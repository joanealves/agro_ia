import requests

BASE = "http://localhost:8000"

# Login
r = requests.post(f"{BASE}/api/auth/login/", json={
    "email": "joanealves2011@gmail.com",
    "password": "Agro@2026"
})
token = r.json().get('access_token') or r.json().get('access')
headers = {"Authorization": f"Bearer {token}"}

# Check fazendas
print("=== FAZENDAS ===")
r = requests.get(f"{BASE}/api/fazenda/fazendas/", headers=headers)
print(f"Status: {r.status_code}")
print(f"Data: {r.text[:500]}")

# Try create praga with correct fazenda
print("\n=== CREATE PRAGA (verbose) ===")
r = requests.post(f"{BASE}/api/pragas/", json={
    "nome": "Teste",
    "nivel": "baixo",
    "descricao": "teste",
    "fazenda": 1
}, headers={**headers, "Content-Type": "application/json"})
print(f"Status: {r.status_code}")
# Get error details from HTML
if r.status_code == 500:
    text = r.text
    # Find the exception value
    start = text.find('<td class="code"><pre>')
    if start > 0:
        end = text.find('</pre>', start)
        print(f"Error: {text[start+22:end]}")
    # Try to find exception type
    start2 = text.find('<title>')
    if start2 > 0:
        end2 = text.find('</title>', start2)
        print(f"Title: {text[start2+7:end2]}")
