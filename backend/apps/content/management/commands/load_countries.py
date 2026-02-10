from django.core.management.base import BaseCommand
from apps.content.models import Country

class Command(BaseCommand):
    help = 'Loads initial country data'

    def handle(self, *args, **options):
        countries_data = [
            # West Africa
            {'code': 'NG', 'name': 'Nigeria', 'region': 'West Africa', 
             'currency': 'NGN', 'priority': 1, 'is_active': True},
            {'code': 'GH', 'name': 'Ghana', 'region': 'West Africa', 
             'currency': 'GHS', 'priority': 2, 'is_active': False},
            {'code': 'SL', 'name': 'Sierra Leone', 'region': 'West Africa', 
             'currency': 'SLL', 'priority': 2, 'is_active': False},
            
            # East Africa
            {'code': 'KE', 'name': 'Kenya', 'region': 'East Africa', 
             'currency': 'KES', 'priority': 3, 'is_active': False},
            {'code': 'UG', 'name': 'Uganda', 'region': 'East Africa', 
             'currency': 'UGX', 'priority': 3, 'is_active': False},
            
            # Southern Africa
            {'code': 'ZA', 'name': 'South Africa', 'region': 'Southern Africa', 
             'currency': 'ZAR', 'priority': 4, 'is_active': False},
        ]
        
        for data in countries_data:
            Country.objects.get_or_create(code=data['code'], defaults=data)
        
        self.stdout.write(self.style.SUCCESS('Countries loaded!'))
