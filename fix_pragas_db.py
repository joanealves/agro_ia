import os, django
os.environ['DJANGO_SETTINGS_MODULE'] = 'backend.settings'
django.setup()
from django.db import connection

cursor = connection.cursor()

# Check if 'nivel' column exists
cursor.execute("""
    SELECT column_name FROM information_schema.columns
    WHERE table_name = 'pragas_praga' AND column_name = 'nivel'
""")
has_nivel = cursor.fetchone()

if not has_nivel:
    print("Adding 'nivel' column...")
    cursor.execute("""
        ALTER TABLE pragas_praga
        ADD COLUMN nivel VARCHAR(20) DEFAULT 'baixo' NOT NULL
    """)
    print("  -> nivel column added!")
else:
    print("  -> nivel column already exists")

# Make imagem nullable
print("Making 'imagem' nullable...")
cursor.execute("""
    ALTER TABLE pragas_praga
    ALTER COLUMN imagem DROP NOT NULL
""")
print("  -> imagem is now nullable")

# Make descricao have default
print("Setting default for 'descricao'...")
cursor.execute("""
    ALTER TABLE pragas_praga
    ALTER COLUMN descricao SET DEFAULT ''
""")
cursor.execute("""
    ALTER TABLE pragas_praga
    ALTER COLUMN descricao DROP NOT NULL
""")
print("  -> descricao default set")

# Verify final state
cursor.execute("""
    SELECT column_name, data_type, is_nullable, column_default
    FROM information_schema.columns
    WHERE table_name = 'pragas_praga'
    ORDER BY ordinal_position
""")
print("\n=== FINAL PRAGAS_PRAGA SCHEMA ===")
for row in cursor.fetchall():
    print(f"  {row[0]:20s} {row[1]:30s} nullable={row[2]:5s} default={row[3]}")

print("\nDone!")
