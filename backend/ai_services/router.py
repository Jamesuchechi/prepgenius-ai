import random
from .base import GroqClient, MistralClient, HuggingFaceClient, CohereClient
from django.conf import settings

class AIModelRouter:
    def __init__(self):
        self.clients = []
        if settings.GROQ_API_KEY:
            self.clients.append(GroqClient())
        if settings.MISTRAL_API_KEY:
            self.clients.append(MistralClient())
        if settings.HUGGINGFACE_API_KEY:
             self.clients.append(HuggingFaceClient())
        if settings.COHERE_API_KEY:
             self.clients.append(CohereClient())
        
        # Simple round-robin counter (not thread-safe in simple deployment but sufficient for random load balancing)
        self.current_index = 0

    def get_client(self):
        """Returns the next client in the rotation, or random choice for now."""
        if not self.clients:
            return None # Or raise Error
        
        # Random selection for stateless load balancing across workers
        return random.choice(self.clients)

    def generate_response(self, prompt: str, system_prompt: str = None) -> str:
        """Tries to generate response from available clients, with failover."""
        # Shuffle clients to try in random order for failover
        shuffled_clients = list(self.clients)
        random.shuffle(shuffled_clients)
        
        for client in shuffled_clients:
            response = client.generate_response(prompt, system_prompt)
            if response:
                return response
        
        raise Exception("All AI providers failed to generate a response.")
