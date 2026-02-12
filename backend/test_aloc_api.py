#!/usr/bin/env python
"""
Test script to verify ALOC API connectivity and functionality.
Run from backend directory: python test_aloc_api.py
"""

import os
import sys
from pathlib import Path

# CRITICAL: Load .env FIRST, before any other imports
from dotenv import load_dotenv

print("=" * 80)
print("ALOC API DIAGNOSTIC TEST")
print("=" * 80)

# Load .env from backend directory
env_path = Path(__file__).resolve().parent / ".env"
print(f"\n📄 Looking for .env at: {env_path}")
print(f"   Exists: {env_path.exists()}")

if env_path.exists():
    load_dotenv(dotenv_path=env_path, override=True)
    print(f"   ✓ Loaded from {env_path}")
else:
    print(f"   ❌ Not found!")

# Check if environment variables are loaded BEFORE Django
print("\n📋 ENVIRONMENT CHECK (before Django):")
aloc_base_url_env = os.environ.get('ALOC_BASE_URL')
aloc_token_env = os.environ.get('ALOC_ACCESS_TOKEN')
print(f"   ALOC_BASE_URL (env): {aloc_base_url_env}")
print(f"   ALOC_ACCESS_TOKEN (env): {aloc_token_env[:20]}..." if aloc_token_env else "   ALOC_ACCESS_TOKEN (env): NOT SET")

# Now setup Django
import django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'core.settings')
django.setup()

from django.conf import settings
import requests
import json

def test_connectivity():
    """Test ALOC API connectivity and functionality."""
    
    print("\n" + "=" * 80)
    print("CREDENTIALS CHECK (Django Settings)")
    print("=" * 80)
    
    # Get from Django settings
    base_url = getattr(settings, 'ALOC_BASE_URL', None)
    token = getattr(settings, 'ALOC_ACCESS_TOKEN', None)
    timeout = getattr(settings, 'ALOC_TIMEOUT', 60)
    
    # Fallback to env vars if Django settings didn't load
    if not base_url:
        base_url = aloc_base_url_env
    if not token:
        token = aloc_token_env
    
    print(f"\n✅ Base URL: {base_url}")
    print(f"✅ Token set: {bool(token)}")
    print(f"   Token preview: {token[:20]}..." if token else "")
    print(f"✅ Timeout: {timeout}s")
    
    if not base_url or not token:
        print("\n❌ CRITICAL: Credentials not loaded!")
        print("   Stopping test.")
        return False
    
    # Test connectivity
    print("\n" + "=" * 80)
    print("CONNECTIVITY TEST")
    print("=" * 80)
    
    try:
        headers = {
            'AccessToken': token,
            'Accept': 'application/json',
        }
        
        print(f"\n🔗 Testing Base URL: {base_url}")
        response = requests.get(base_url, headers=headers, timeout=timeout)
        print(f"   Status: {response.status_code}")
        
        if response.status_code == 404:
            print("   Note: Root endpoint returns 404 (might be expected)")
        elif response.status_code == 401:
            print("   ❌ Authorization failed - check token")
            print(f"   Response: {response.text[:300]}")
            return False
        elif response.status_code == 200:
            print("   ✓ Root endpoint working")
        else:
            print(f"   Status {response.status_code}: {response.text[:200]}")
        
    except requests.exceptions.ConnectTimeout:
        print(f"   ❌ Connection timeout")
        return False
    except requests.exceptions.ConnectionError as e:
        print(f"   ❌ Connection error: {e}")
        return False
    except Exception as e:
        print(f"   ❌ Error: {e}")
        return False
    
    # Test /questions endpoint with different variations
    print("\n" + "=" * 80)
    print("ENDPOINT DISCOVERY")
    print("=" * 80)
    
    # Try different endpoint variations
    base_no_v2 = base_url.replace('/api/v2', '').rstrip('/')
    
    endpoints_to_try = [
        f"{base_url}/q",              # Standard ALOC v2 endpoint
        f"{base_no_v2}/q",            # Base + /q
        f"{base_url}/questions",       # Legacy attempt 1
        f"{base_no_v2}/api/v2/q",     # Full path
    ]
    
    working_endpoint = None
    
    for endpoint in endpoints_to_try:
        print(f"\n🔍 Trying: {endpoint}")
        try:
            resp = requests.get(endpoint, headers=headers, timeout=timeout)
            print(f"   Status: {resp.status_code}")
            
            if resp.status_code == 200:
                print(f"   ✓ Working endpoint found!")
                working_endpoint = endpoint
                try:
                    data = resp.json()
                    print(f"   Response type: {type(data).__name__}")
                    if isinstance(data, dict):
                        print(f"   Top-level keys: {list(data.keys())[:10]}")
                        if 'results' in data:
                            print(f"   Total items: {len(data.get('results', []))}")
                except Exception as e:
                    print(f"   (Could not parse JSON: {type(e).__name__})")
                break
            elif resp.status_code in [400, 404]:
                print(f"   Status {resp.status_code} - endpoint not found")
            elif resp.status_code in [401, 403]:
                print(f"   Status {resp.status_code} - authorization error")
            else:
                print(f"   Status {resp.status_code}")
                
        except requests.exceptions.Timeout:
            print(f"   Timeout")
        except Exception as e:
            print(f"   Error: {type(e).__name__}")
    
    if not working_endpoint:
        print("\n   ⚠️  No 200 OK endpoint found")
        print("   However, /api/v2/q returned 400 (bad request)")
        print("   This likely means the endpoint exists but parameters are wrong")
        print("   Proceeding with parameter testing...")
        working_endpoint = f"{base_url}/q"  # Use /q endpoint for parameter testing
    else:
        print(f"\n   ✓ Found working endpoint: {working_endpoint}")
    
    # Test with parameters
    print("\n" + "=" * 80)
    print("PARAMETER TESTING")
    print("=" * 80)
    
    test_queries = [
        {"subject": "english"},
        {"subject": "mathematics"},
        {"subject": "biology"},
        {"subject": "english", "type": "utme"},
        {"subject": "mathematics", "type": "ssce"},
        {"subject": "english", "year": "2015"},
        {"subject": "biology", "year": "2020"},
    ]
    
    test_endpoint = working_endpoint or f"{base_url}/questions"
    
    for query in test_queries:
        print(f"\n🔎 Query: {query}")
        
        try:
            resp = requests.get(test_endpoint, params=query, headers=headers, timeout=timeout)
            print(f"   Status: {resp.status_code}")
            
            if resp.status_code == 200:
                print(f"   ✓ Query successful!")
                try:
                    data = resp.json()
                    count = len(data) if isinstance(data, list) else len(data.get('results', []))
                    print(f"   Results: {count} items")
                except:
                    print(f"   Response length: {len(resp.text)} bytes")
            elif resp.status_code == 400:
                print(f"   Note: Bad request (400)")
                try:
                    error_data = resp.json()
                    print(f"   Error: {str(error_data)[:300]}")
                except:
                    print(f"   Response: {resp.text[:200]}")
            elif resp.status_code == 404:
                print(f"   Not found (404) - check parameters")
        except Exception as e:
            print(f"   Error: {type(e).__name__}")
    
    # Alternative authentication methods
    print("\n" + "=" * 80)
    print("AUTH METHOD TESTING")
    print("=" * 80)
    
    auth_methods = [
        ("AccessToken header", {"AccessToken": token}),
        ("Bearer token (legacy)", {"Authorization": f"Bearer {token}"}),
        ("Token header (legacy)", {"Authorization": f"Token {token}"}),
        ("X-API-Key header (legacy)", {"X-API-Key": token}),
    ]
    
    test_endpoint = working_endpoint or f"{base_url}/questions"
    
    for method_name, method_headers in auth_methods:
        print(f"\n🔐 {method_name}")
        
        try:
            resp = requests.get(test_endpoint, headers=method_headers, timeout=timeout)
            status = resp.status_code
            print(f"   Status: {status}")
            
            if status == 200:
                print(f"   ✓ Auth method works!")
            elif status in [401, 403]:
                print(f"   ❌ Auth failed")
            else:
                print(f"   Status {status}")
            
        except Exception as e:
            print(f"   Error: {type(e).__name__}")
    
    print("\n" + "=" * 80)
    print("DIAGNOSTIC COMPLETE")
    print("=" * 80)
    print("\n📝 NEXT STEPS:")
    print("1. Review results above (look for working endpoints and auth methods)")
    print("2. Check ALOC API documentation for correct parameter names")
    print("3. Update exam_generator.py with working endpoint/params")
    print("4. Test exam creation with 'Past Questions' mode")
    
    return True

if __name__ == "__main__":
    try:
        success = test_connectivity()
        sys.exit(0 if success else 1)
    except Exception as e:
        print(f"\n❌ Fatal error: {e}")
        import traceback
        traceback.print_exc()
        sys.exit(1)

if __name__ == "__main__":
    try:
        success = test_connectivity()
        sys.exit(0 if success else 1)
    except Exception as e:
        print(f"\n❌ Fatal error: {e}")
        import traceback
        traceback.print_exc()
        sys.exit(1)
