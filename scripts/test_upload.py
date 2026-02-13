import requests
import os

BASE_URL = 'http://localhost:8000/api'
USERNAME = 'test_uploader'
PASSWORD = 'testpassword123'

# 1. Login
print("Attempting to login...")
login_url = f'{BASE_URL}/auth/token/'
try:
    response = requests.post(login_url, data={'username': USERNAME, 'password': PASSWORD})
    if response.status_code != 200:
        print(f"Login failed: {response.text}")
        exit(1)
    
    access_token = response.json()['access']
    headers = {'Authorization': f'Bearer {access_token}'}
    print("Login successful.")

    # 2. Upload file
    print("Attempting to upload file...")
    upload_url = f'{BASE_URL}/study-tools/documents/'
    # Create a dummy file
    with open('test_doc.txt', 'w') as f:
        f.write('This is a test document content for RAG processing.')

    files = {'file': open('test_doc.txt', 'rb')}
    data = {'title': 'Test Document', 'file_type': 'txt'}

    response = requests.post(upload_url, headers=headers, files=files, data=data)
    if response.status_code == 201:
        print("Upload successful!")
        print(response.json())
    else:
        print(f"Upload failed: {response.status_code}")
        print(response.text)

    # Cleanup
    files['file'].close()
    os.remove('test_doc.txt')

except Exception as e:
    print(f"An error occurred: {e}")
