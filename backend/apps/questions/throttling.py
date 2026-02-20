from rest_framework.throttling import UserRateThrottle

class AIGenerationRateThrottle(UserRateThrottle):
    scope = 'ai_generation'
