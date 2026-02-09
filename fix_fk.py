import os, django
os.environ['DJANGO_SETTINGS_MODULE'] = 'backend.settings'
django.setup()

from django.db import connection
cursor = connection.cursor()

# Check data in both schemas
cursor.execute("SELECT id, nome FROM extensions.fazenda_fazenda ORDER BY id")
rows_ext = cursor.fetchall()
print(f"extensions.fazenda_fazenda: {len(rows_ext)} rows")
for r in rows_ext:
    print(f"  id={r[0]} nome={r[1]}")

cursor.execute("SELECT id, nome FROM public.fazenda_fazenda ORDER BY id")
rows_pub = cursor.fetchall()
print(f"\npublic.fazenda_fazenda: {len(rows_pub)} rows")
for r in rows_pub:
    print(f"  id={r[0]} nome={r[1]}")

# Check which schema pragas_praga is in
cursor.execute("SELECT schemaname FROM pg_tables WHERE tablename = 'pragas_praga'")
pragas_schemas = [r[0] for r in cursor.fetchall()]
print(f"\npragas_praga schemas: {pragas_schemas}")

# Fix: Drop the bad FK and recreate pointing to public
print("\n=== FIXING FK ===")

# Drop old FK
cursor.execute("""
    ALTER TABLE pragas_praga
    DROP CONSTRAINT IF EXISTS pragas_praga_fazenda_id_2b3ad19d_fk_fazenda_fazenda_id
""")
print("[OK] Dropped old FK constraint")

# Add FK to public.fazenda_fazenda
cursor.execute("""
    ALTER TABLE pragas_praga
    ADD CONSTRAINT pragas_praga_fazenda_id_fk
    FOREIGN KEY (fazenda_id) REFERENCES public.fazenda_fazenda(id)
    DEFERRABLE INITIALLY DEFERRED
""")
print("[OK] Added new FK to public.fazenda_fazenda")

# Test insert
from backend.pragas.models import Praga
from backend.fazenda.models import Fazenda

fazenda = Fazenda.objects.first()
try:
    p = Praga.objects.create(nome="Teste FK Fix", nivel="baixo", descricao="test", fazenda=fazenda)
    print(f"\n[OK] Created praga id={p.id}")
    p.delete()
    print("[OK] Deleted test praga")
except Exception as e:
    print(f"\n[FAIL] {type(e).__name__}: {e}")
