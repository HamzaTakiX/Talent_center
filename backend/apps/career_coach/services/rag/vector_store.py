"""ChromaDB vector store for career coach RAG."""

from __future__ import annotations

import logging
from pathlib import Path
from typing import Any

from django.conf import settings

logger = logging.getLogger(__name__)

_COLLECTION_NAME = 'career_coach_context'
_client = None
_collection = None


def _get_persist_dir() -> Path:
    base = getattr(settings, 'CAREER_COACH_CHROMA_DIR', None)
    if base:
        return Path(base)
    return Path(settings.BASE_DIR) / 'data' / 'chromadb'


def get_collection():
    global _client, _collection
    if _collection is not None:
        return _collection
    try:
        import chromadb
    except ImportError as exc:
        raise RuntimeError('chromadb is required for RAG. Install with: pip install chromadb') from exc

    persist_dir = _get_persist_dir()
    persist_dir.mkdir(parents=True, exist_ok=True)
    _client = chromadb.PersistentClient(path=str(persist_dir))
    _collection = _client.get_or_create_collection(
        name=_COLLECTION_NAME,
        metadata={'hnsw:space': 'cosine'},
    )
    return _collection


def upsert_documents(
    student_id: int,
    documents: list[dict[str, Any]],
) -> int:
    """Upsert context chunks. Each doc: {id, text, metadata}."""
    if not documents:
        return 0
    collection = get_collection()
    ids = [f'student_{student_id}_{d["id"]}' for d in documents]
    texts = [d['text'] for d in documents]
    metadatas = [{**d.get('metadata', {}), 'student_id': student_id} for d in documents]
    embeddings = None
    try:
        from apps.career_coach.services.rag.embeddings import embed_texts
        embeddings = embed_texts(texts)
    except Exception as exc:
        logger.warning('Embedding failed, ChromaDB will embed internally: %s', exc)

    try:
        collection.upsert(ids=ids, documents=texts, metadatas=metadatas, embeddings=embeddings)
    except Exception:
        collection.upsert(ids=ids, documents=texts, metadatas=metadatas)
    return len(documents)


def query_documents(student_id: int, query: str, *, top_k: int = 8) -> list[dict[str, Any]]:
    collection = get_collection()
    query_embedding = None
    try:
        from apps.career_coach.services.rag.embeddings import embed_texts
        vectors = embed_texts([query])
        query_embedding = vectors[0] if vectors else None
    except Exception as exc:
        logger.warning('Query embedding failed: %s', exc)

    kwargs: dict[str, Any] = {
        'n_results': top_k,
        'where': {'student_id': student_id},
    }
    if query_embedding:
        kwargs['query_embeddings'] = [query_embedding]
    else:
        kwargs['query_texts'] = [query]

    try:
        result = collection.query(**kwargs)
    except Exception as exc:
        logger.warning('ChromaDB query failed: %s', exc)
        return []

    docs = result.get('documents', [[]])[0]
    metas = result.get('metadatas', [[]])[0]
    distances = result.get('distances', [[]])[0]
    return [
        {'text': doc, 'metadata': meta or {}, 'distance': dist}
        for doc, meta, dist in zip(docs, metas, distances)
        if doc
    ]
