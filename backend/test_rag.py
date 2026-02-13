
import os
import django
import sys
from unittest.mock import MagicMock, patch

# Setup Django environment
sys.path.append(os.path.dirname(os.path.abspath(__file__)))
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'core.settings.base')
django.setup()

from apps.accounts.models import User
from apps.study_tools.models import Document, DocumentChunk
from apps.study_tools.services.document_processor import DocumentProcessor
from django.core.files.uploadedfile import SimpleUploadedFile

def test_rag_pipeline():
    print("Setting up test data...")
    # Create User
    user, created = User.objects.get_or_create(email="rag_test@example.com", defaults={"username": "rag_test"})
    
    # Create a dummy text file
    content = "This is a test document for RAG. " * 50  # Enough to create chunks? 
    # 50 * ~30 chars = 1500 chars. Chunk size is 1000. Should get 2 chunks.
    
    file = SimpleUploadedFile("rag_test.txt", content.encode("utf-8"))
    
    # Create Document
    doc = Document.objects.create(
        user=user,
        title="RAG Test Document",
        file=file,
        file_type="txt"
    )
    
    print(f"Created document: {doc.id}")
    
    # Mock AIRouter to avoid API calls
    with patch('ai_services.router.AIRouter') as MockRouter:
        mock_instance = MockRouter.return_value
        # Mock generate_embedding to return a fixed list of floats
        mock_instance.generate_embedding.return_value = [0.1, 0.2, 0.3, 0.4, 0.5]
        
        print("Processing document...")
        DocumentProcessor.process_document(doc.id)
        
        # Reload document
        doc.refresh_from_db()
        
        print(f"Document Status: {doc.processing_status}")
        print(f"Document Content Length: {len(doc.content) if doc.content else 0}")
        
        # Verify Content
        if not doc.content:
            print("FAIL: Document content not saved.")
            return

        # Verify Chunks
        chunks = DocumentChunk.objects.filter(document=doc).order_by('chunk_index')
        print(f"Created {chunks.count()} chunks.")
        
        if chunks.count() == 0:
            print("FAIL: No chunks created.")
            return
            
        for chunk in chunks:
            print(f"Chunk {chunk.chunk_index}: Length {len(chunk.content)}, Embedding: {chunk.embedding}")
            if chunk.embedding != [0.1, 0.2, 0.3, 0.4, 0.5]:
                print("FAIL: Embedding mismatch.")
                return

        print("SUCCESS: RAG pipeline verified.")

if __name__ == "__main__":
    test_rag_pipeline()
