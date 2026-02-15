
import logging
from .groq_client import GroqClient
from .mistral_client import MistralClient
from .cohere_client import CohereClient
from .huggingface_client import HuggingFaceClient

logger = logging.getLogger(__name__)

class AIRouter:
    def __init__(self):
        # Initialize clients in priority order
        self.clients = [
            ("Groq", GroqClient()),
            ("Mistral", MistralClient()),
            ("Cohere", CohereClient()),
            ("HuggingFace", HuggingFaceClient())
        ]

    def generate_questions(self, topic, difficulty, count=5, q_type="MCQ", additional_context=""):
        errors = []
        
        for name, client in self.clients:
            try:
                # Skip clients that weren't initialized properly (e.g. missing API key)
                # Assuming clients might be None or have internal checks
                if hasattr(client, 'client') and client.client is None:
                     # Check specific to how we implemented clients. 
                     # Groq, Mistral, Cohere set self.client = None if key missing
                     continue
                
                # HuggingFace check
                if isinstance(client, HuggingFaceClient) and not client.api_key:
                    continue

                logger.info(f"Attempting question generation with {name}...")
                return client.generate_questions(topic, difficulty, count, q_type, additional_context)
                
            except Exception as e:
                logger.warning(f"{name} failed: {e}")
                errors.append(f"{name}: {str(e)}")
                continue
        
        # If we get here, all clients failed
        error_msg = f"All AI providers failed. Errors: {'; '.join(errors)}"
        logger.error(error_msg)
        raise Exception(error_msg)

    async def generate_questions_async(self, topic, difficulty, count=5, q_type="MCQ", additional_context=""):
        errors = []
        
        for name, client in self.clients:
            try:
                # Check if client supports async generation
                if not hasattr(client, 'generate_questions_async'):
                    continue

                if hasattr(client, 'async_client') and client.async_client is None:
                     continue
                
                # HuggingFace check
                if isinstance(client, HuggingFaceClient) and not client.api_key:
                    continue

                logger.info(f"Attempting async question generation with {name}...")
                return await client.generate_questions_async(topic, difficulty, count, q_type, additional_context)
                
            except Exception as e:
                logger.warning(f"{name} failed async: {e}")
                errors.append(f"{name}: {str(e)}")
                continue
        
        # If we get here, all clients failed
        error_msg = f"All AI providers failed async generation. Errors: {'; '.join(errors)}"
        logger.error(error_msg)
        raise Exception(error_msg)

    def generate_topics(self, subject):
        errors = []
        for name, client in self.clients:
            try:
                if hasattr(client, 'client') and client.client is None:
                    continue
                
                # HuggingFace check
                if isinstance(client, HuggingFaceClient) and not client.api_key:
                    continue

                logger.info(f"Attempting topic generation for '{subject}' with {name}...")
                # Ensure the client has the method before calling
                if hasattr(client, 'generate_topics'):
                    return client.generate_topics(subject)
                else:
                    logger.warning(f"{name} client does not support topic generation.")
                
            except Exception as e:
                logger.warning(f"{name} failed to generate topics: {e}")
                errors.append(f"{name}: {str(e)}")
                continue

        error_msg = f"All AI providers failed to generate topics. Errors: {'; '.join(errors)}"
        logger.error(error_msg)
        raise Exception(error_msg)

    def generate_study_plan(self, exam_type, subjects, days_available, difficulty_level, daily_hours, weekly_days):
        """Generate a study plan using AI providers."""
        errors = []
        
        prompt = f"""Create a structured study plan with the following requirements:
Exam Type: {exam_type}
Subjects: {', '.join(subjects)}
Days Available: {days_available}
Daily Study Hours: {daily_hours}
Weekly Study Days: {weekly_days}
Difficulty Level: {difficulty_level}

Return a JSON response with:
- topic_sequence: list of topics to study in order with estimated hours each
- revision_schedule: recommended revision topics
- study_pace: recommended daily schedule structure
"""
        
        for name, client in self.clients:
            try:
                if hasattr(client, 'client') and client.client is None:
                    continue
                
                # HuggingFace check
                if isinstance(client, HuggingFaceClient) and not client.api_key:
                    continue

                logger.info(f"Attempting study plan generation with {name}...")
                # Use generate_questions with study plan context as fallback
                if hasattr(client, 'generate_study_plan'):
                    return client.generate_study_plan(exam_type, subjects, days_available, difficulty_level, daily_hours, weekly_days)
                else:
                    # Fallback to generating a high-level response
                    logger.debug(f"{name} client does not support direct study plan generation, using fallback.")
                    continue
                
            except Exception as e:
                logger.warning(f"{name} failed to generate study plan: {e}")
                errors.append(f"{name}: {str(e)}")
                continue
        
        logger.warning(f"AI-based study plan generation failed. Using template-based approach. Errors: {'; '.join(errors)}")
        return None  # Return None to trigger template-based generation
    
    def generate_chat_response(self, message, conversation_history=None, system_prompt=None, context=None):
        """Generate a chat response using AI providers with conversation context."""
        errors = []
        
        for name, client in self.clients:
            try:
                if hasattr(client, 'client') and client.client is None:
                    continue
                
                # HuggingFace check
                if isinstance(client, HuggingFaceClient) and not client.api_key:
                    continue

                logger.info(f"Attempting chat response generation with {name}...")
                
                # Check for active document context
                document_context = ""
                active_document_id = (context or {}).get('active_document_id')
                
                if active_document_id:
                    # Use RAG to get relevant context
                    document_context = self._get_document_context(active_document_id, message)

                # Build the prompt with conversation history
                if conversation_history:
                    # Format history for context
                    history_context = "\n".join([
                        f"{'Student' if msg['role'] == 'user' else 'Tutor'}: {msg['content']}"
                        for msg in conversation_history[-5:]  # Last 5 messages
                    ])
                    full_message = f"{document_context}\n{history_context}\nStudent: {message}\nTutor:"
                else:
                    full_message = f"{document_context}\nStudent: {message}\nTutor:"
                
                # Use the base generate_response method
                if hasattr(client, 'generate_response'):
                    # Extract image_data from context if available
                    image_data = (context or {}).get('image_data')
                    
                    response = client.generate_response(
                        prompt=full_message,
                        system_prompt=system_prompt,
                        temperature=0.7,
                        max_tokens=1024,
                        image_data=image_data
                    )
                    if response:
                        return response
                
            except Exception as e:
                logger.warning(f"{name} failed to generate chat response: {e}")
                errors.append(f"{name}: {str(e)}")
                continue
        
        error_msg = f"All AI providers failed to generate chat response. Errors: {'; '.join(errors)}"
        logger.error(error_msg)
        raise Exception(error_msg)

    def stream_chat_response(self, message, conversation_history=None, system_prompt=None, context=None):
        """
        Streams a chat response using AI providers with conversation context.
        Yields chunks of text.
        """
        errors = []
        
        for name, client in self.clients:
            try:
                if hasattr(client, 'client') and client.client is None:
                    continue
                
                # HuggingFace check
                if isinstance(client, HuggingFaceClient) and not client.api_key:
                    continue

                logger.info(f"Attempting streaming chat response generation with {name}...")
                
                # Check for active document context
                document_context = ""
                active_document_id = (context or {}).get('active_document_id')
                
                if active_document_id:
                     # Use RAG to get relevant context
                    document_context = self._get_document_context(active_document_id, message)

                # Build the prompt with conversation history
                if conversation_history:
                    history_context = "\n".join([
                        f"{'Student' if msg['role'] == 'user' else 'Tutor'}: {msg['content']}"
                        for msg in conversation_history[-5:]
                    ])
                    full_message = f"{document_context}\n{history_context}\nStudent: {message}\nTutor:"
                else:
                    full_message = f"{document_context}\nStudent: {message}\nTutor:"
                
                # Check if client supports streaming
                if hasattr(client, 'stream_response'):
                    # Extract image_data from context if available
                    image_data = (context or {}).get('image_data')
                    
                    for chunk in client.stream_response(
                        prompt=full_message,
                        system_prompt=system_prompt,
                        temperature=0.7,
                        max_tokens=1024,
                        image_data=image_data
                    ):
                        yield chunk
                    return  # Success, stop trying other clients
                
                # Fallback to non-streaming if streaming not supported but client works
                elif hasattr(client, 'generate_response'):
                    logger.info(f"{name} does not support streaming, falling back to full response.")
                    response = client.generate_response(
                        prompt=full_message,
                        system_prompt=system_prompt,
                        temperature=0.7,
                        max_tokens=1024
                    )
                    if response:
                        yield response  # Yield full response as one chunk
                        return
                
            except Exception as e:
                logger.warning(f"{name} failed to stream chat response: {e}")
                errors.append(f"{name}: {str(e)}")
                continue
        
        error_msg = f"All AI providers failed to stream chat response. Errors: {'; '.join(errors)}"
        logger.error(error_msg)
        # Don't raise exception here as it breaks the generator pattern easily, 
        # or yield an error message? Better to raise so caller knows.
        raise Exception(error_msg)

    def generate_embedding(self, text):
        """
        Generate vector embedding for text using available clients.
        Prioritizes clients that support embedding (Cohere, Mistral).
        """
        errors = []
        for name, client in self.clients:
            try:
                if hasattr(client, 'client') and client.client is None:
                    continue
                
                # Check if client supports embedding
                if not hasattr(client, 'generate_embedding'):
                    continue

                logger.info(f"Attempting embedding generation with {name}...")
                return client.generate_embedding(text)
                
            except Exception as e:
                logger.warning(f"{name} failed to generate embedding: {e}")
                errors.append(f"{name}: {str(e)}")
                continue

        error_msg = f"All AI providers failed to generate embedding. Errors: {'; '.join(errors)}"
        logger.error(error_msg)
        raise Exception(error_msg)

    def _get_document_context(self, document_id, query, k=3):
        """
        Retrieves relevant document chunks using vector similarity.
        """
        try:
            from apps.study_tools.models import Document, DocumentChunk
            import numpy as np

            # Get document and check existence
            try:
                doc = Document.objects.get(id=document_id)
            except Document.DoesNotExist:
                return ""

            # If no chunks (old document or failed processing), fallback to content field if small enough
            if not doc.chunks.exists():
                logger.warning(f"Document {document_id} has no chunks. Returning first 5000 chars.")
                return f"\n\nCONTEXT FROM DOCUMENT '{doc.title}':\n{doc.content[:5000] if doc.content else ''}\n\nINSTRUCTION: Answer based on the context above."

            # Generate query embedding
            query_embedding = self.generate_embedding(query)
            
            # Retrieve all chunks for the document
            # Note: For production with millions of rows, use pgvector. 
            # For <10k chunks per user, in-memory numpy is fast enough.
            chunks = list(doc.chunks.all().values('id', 'content', 'embedding', 'chunk_index'))
            
            if not chunks:
                 return ""

            # Calculate cosine similarity
            # Sim(A, B) = dot(A, B) / (norm(A) * norm(B))
            
            query_vec = np.array(query_embedding)
            query_norm = np.linalg.norm(query_vec)
            
            scored_chunks = []
            for chunk in chunks:
                chunk_vec = np.array(chunk['embedding'])
                chunk_norm = np.linalg.norm(chunk_vec)
                
                if chunk_norm == 0 or query_norm == 0:
                    similarity = 0
                else:
                    similarity = np.dot(query_vec, chunk_vec) / (query_norm * chunk_norm)
                
                scored_chunks.append((similarity, chunk))
            
            # Sort by similarity desc
            scored_chunks.sort(key=lambda x: x[0], reverse=True)
            
            # Take top K
            top_chunks = scored_chunks[:k]
            
            # Format context
            context_text = "\n...\n".join([c[1]['content'] for c in top_chunks])
            
            logger.info(f"Retrieved {len(top_chunks)} chunks for document {document_id}")
            
            return f"\n\nCONTEXT FROM DOCUMENT '{doc.title}':\n{context_text}\n\nINSTRUCTION: Answer based on the context above."

        except Exception as e:
            logger.error(f"Error retrieving document context: {e}")
            return ""