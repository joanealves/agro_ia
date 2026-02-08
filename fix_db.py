import os, django
os.environ['DJANGO_SETTINGS_MODULE'] = 'backend.settings'
django.setup()
from django.db import connection

cursor = connection.cursor()

# 1. Add 'nivel' column if missing
cursor.execute("""
    SELECT column_name FROM information_schema.columns
    WHERE table_name = 'pragas_praga' AND column_name = 'nivel'
""")
if not cursor.fetchone():
    cursor.execute("ALTER TABLE pragas_praga ADD COLUMN nivel VARCHAR(20) DEFAULT 'baixo' NOT NULL")
    print("[OK] nivel column added")
else:
    print("[OK] nivel column already exists")

# 2. Make imagem nullable
cursor.execute("ALTER TABLE pragas_praga ALTER COLUMN imagem DROP NOT NULL")
print("[OK] imagem is now nullable")

# 3. Make descricao nullable with default
cursor.execute("ALTER TABLE pragas_praga ALTER COLUMN descricao SET DEFAULT ''")
cursor.execute("ALTER TABLE pragas_praga ALTER COLUMN descricao DROP NOT NULL")
print("[OK] descricao updated")

# Verify
cursor.execute("""
    SELECT column_name, data_type, is_nullable
    FROM information_schema.columns WHERE table_name = 'pragas_praga'
    ORDER BY ordinal_position
""")
print("\nFinal schema:")
for row in cursor.fetchall():
    print(f"  {row[0]:20s} {row[1]:30s} nullable={row[2]}")
print("\nDone!")
