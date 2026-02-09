import requests
import json

BASE = "http://localhost:8000"

# Test login
print("=== TEST LOGIN ===")
r = requests.post(f"{BASE}/api/auth/login/", json={
    "email": "joanealves2011@gmail.com",
    "password": "Agro@2026"
})
print(f"Status: {r.status_code}")
data = r.json()
print(f"Keys: {list(data.keys())}")
if 'access_token' in data or 'access' in data:
    token = data.get('access_token') or data.get('access')
    print(f"Token: {token[:50]}...")

    # Test pragas with auth
    print("\n=== TEST PRAGAS LIST ===")
    r2 = requests.get(f"{BASE}/api/pragas/", headers={
        "Authorization": f"Bearer {token}"
    })
    print(f"Status: {r2.status_code}")
    print(f"Response: {r2.text[:200]}")

    # Test pragas create
    print("\n=== TEST PRAGAS CREATE ===")
    r3 = requests.post(f"{BASE}/api/pragas/", json={
        "nome": "Teste Praga",
        "nivel": "baixo",
        "descricao": "Teste de criacao",
        "fazenda": 1
    }, headers={
        "Authorization": f"Bearer {token}",
        "Content-Type": "application/json"
    })
    print(f"Status: {r3.status_code}")
    print(f"Response: {r3.text[:300]}")
else:
    print(f"Login failed: {json.dumps(data, indent=2)}")
