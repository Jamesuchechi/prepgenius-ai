import os
import logging
from pypdf import PdfReader
from django.conf import settings
from ..models import Document

logger = logging.getLogger(__name__)

class DocumentProcessor:
    @staticmethod
    def process_document(document_id):
        """
        Process a document: extract text and update status.
        This method is intended to be run in a background thread/task.
        """
        try:
            document = Document.objects.get(id=document_id)
            if document.processed:
                return

            logger.info(f"Starting processing for document {document.id}: {document.title}")
            document.processing_status = 'processing'
            document.save(update_fields=['processing_status'])

            file_path = document.file.path
            extracted_text = ""

            if document.file_type == 'pdf':
                extracted_text = DocumentProcessor._extract_from_pdf(file_path)
            elif document.file_type in ['txt', 'md']:
                extracted_text = DocumentProcessor._extract_from_text(file_path)
            else:
                raise ValueError(f"Unsupported file type: {document.file_type}")

            # RAG Implementation: Chunking and Embedding
            DocumentProcessor._process_rag(document, extracted_text)

            document.processed = True
            document.processing_status = 'completed'
            document.save(update_fields=['processed', 'processing_status', 'content']) # Updated content in _process_rag
            logger.info(f"Successfully processed document {document.id}")

        except Exception as e:
            logger.error(f"Error processing document {document_id}: {e}")
            try:
                document = Document.objects.get(id=document_id)
                document.processing_status = 'failed'
                document.error_message = str(e)
                document.save(update_fields=['processing_status', 'error_message'])
            except Exception:
                pass

    @staticmethod
    def _extract_from_pdf(file_path):
        reader = PdfReader(file_path)
        text = ""
        for page in reader.pages:
            text += page.extract_text() + "\n"
        return text

    @staticmethod
    def _extract_from_text(file_path):
        with open(file_path, 'r', encoding='utf-8') as f:
            return f.read()

    @staticmethod
    def _process_rag(document, text):
        """
        Chunks the text, generates embeddings, and saves to DocumentChunk.
        """
        from ..models import DocumentChunk
        from ai_services.router import AIRouter

        # Save full text first
        document.content = text
        document.save(update_fields=['content'])

        # Simple chunking strategy: 1000 chars with 100 overlap
        CHUNK_SIZE = 1000
        OVERLAP = 100
        
        chunks = []
        start = 0
        text_len = len(text)
        
        while start < text_len:
            end = min(start + CHUNK_SIZE, text_len)
            chunk_text = text[start:end]
            
            # Adjust to nearest space to avoid cutting words
            if end < text_len:
                last_space = chunk_text.rfind(' ')
                if last_space != -1:
                    end = start + last_space
                    chunk_text = text[start:end]
            
            chunks.append(chunk_text)
            start = end - OVERLAP if end < text_len else end # Move window with overlap

        # Generate embeddings and save chunks
        router = AIRouter()
        
        # Clear existing chunks if re-processing
        document.chunks.all().delete()
        
        for i, chunk_text in enumerate(chunks):
            try:
                embedding = router.generate_embedding(chunk_text)
                DocumentChunk.objects.create(
                    document=document,
                    chunk_index=i,
                    content=chunk_text,
                    embedding=embedding
                )
            except Exception as e:
                logger.error(f"Failed to generate embedding for chunk {i}: {e}")
                # Continue processing other chunks even if one fails
                continue
