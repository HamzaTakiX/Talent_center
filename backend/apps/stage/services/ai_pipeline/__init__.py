"""AI matching pipeline — PyMuPDF, GPT-4o Mini, vector embeddings."""

from .embedding_service import cosine_similarity, generate_embedding, semantic_score_from_vectors
from .pipeline import index_offer, index_student_profile, parse_cv_bytes, process_cv_upload, process_offer_publish
from .pdf_extractor import extract_text_from_pdf

__all__ = [
    'cosine_similarity',
    'extract_text_from_pdf',
    'generate_embedding',
    'index_offer',
    'index_student_profile',
    'parse_cv_bytes',
    'process_cv_upload',
    'process_offer_publish',
    'semantic_score_from_vectors',
]
