import os, django
os.environ['DJANGO_SETTINGS_MODULE'] = 'backend.settings'
django.setup()

from backend.pragas.models import Praga
from backend.pragas.serializers import PragaSerializer
from backend.fazenda.models import Fazenda
from backend.custom_auth.models import CustomUser

user = CustomUser.objects.first()
fazenda = Fazenda.objects.first()

print(f"User: {user}")
print(f"Fazenda: {fazenda} (id={fazenda.id if fazenda else None})")

# Test serializer validation
data = {
    "nome": "Teste",
    "nivel": "baixo",
    "descricao": "teste",
    "fazenda": fazenda.id if fazenda else 1
}
s = PragaSerializer(data=data)
print(f"\nSerializer valid: {s.is_valid()}")
if not s.is_valid():
    print(f"Errors: {s.errors}")
else:
    print(f"Validated data: {s.validated_data}")
    try:
        praga = s.save()
        print(f"Created praga: {praga.id} - {praga.nome}")
        # Clean up
        praga.delete()
        print("Deleted test praga")
    except Exception as e:
        print(f"Save error: {type(e).__name__}: {e}")
