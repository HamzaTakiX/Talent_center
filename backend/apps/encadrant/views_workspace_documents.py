"""Student ↔ Encadrant workspace document APIs."""

from django.shortcuts import get_object_or_404
from rest_framework import status
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView

from apps.authentication.utils import envelope
from apps.encadrant.models import WorkspaceDocument
from apps.encadrant.permissions import IsStudentOrSupervisor
from apps.encadrant.services.workspace_documents import (
    create_document,
    delete_document,
    get_accessible_document,
    list_documents_for_user,
    mark_viewed_by_encadrant,
    serialize_document,
    upsert_review,
)


class WorkspaceDocumentListCreateView(APIView):
    permission_classes = [IsAuthenticated, IsStudentOrSupervisor]

    def get(self, request):
        student_profile_id = request.query_params.get('student_profile_id')
        documents = list_documents_for_user(
            request.user,
            int(student_profile_id) if student_profile_id else None,
        )
        return Response(
            envelope(True, 'OK', data={'items': [serialize_document(doc) for doc in documents[:200]]}),
        )

    def post(self, request):
        document = create_document(
            request.user,
            request.FILES.get('file'),
            category=request.data.get('category'),
        )
        return Response(
            envelope(True, 'Uploaded', data=serialize_document(document)),
            status=status.HTTP_201_CREATED,
        )


class WorkspaceDocumentDetailView(APIView):
    permission_classes = [IsAuthenticated, IsStudentOrSupervisor]

    def get(self, request, document_id: int):
        document = get_accessible_document(request.user, document_id)
        return Response(envelope(True, 'OK', data=serialize_document(document)))

    def delete(self, request, document_id: int):
        document = get_object_or_404(WorkspaceDocument, pk=document_id)
        delete_document(request.user, document)
        return Response(envelope(True, 'Deleted', data={'id': document_id}))


class WorkspaceDocumentReviewView(APIView):
    permission_classes = [IsAuthenticated, IsStudentOrSupervisor]

    def post(self, request, document_id: int):
        document = get_accessible_document(request.user, document_id)
        review = upsert_review(
            request.user,
            document,
            comment=request.data.get('comment', ''),
            grade=request.data.get('grade', ''),
            status=request.data.get('status'),
        )
        document.refresh_from_db()
        document.review = review
        return Response(envelope(True, 'Saved', data=serialize_document(document)))


class WorkspaceDocumentViewedView(APIView):
    permission_classes = [IsAuthenticated, IsStudentOrSupervisor]

    def post(self, request, document_id: int):
        document = get_accessible_document(request.user, document_id)
        document = mark_viewed_by_encadrant(request.user, document)
        return Response(envelope(True, 'OK', data=serialize_document(document)))
