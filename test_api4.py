import os, django
os.environ['DJANGO_SETTINGS_MODULE'] = 'backend.settings'
django.setup()

from django.db import connection
cursor = connection.cursor()

# Check FK constraints on pragas_praga
cursor.execute("""
    SELECT
        tc.constraint_name,
        kcu.column_name,
        ccu.table_name AS foreign_table_name,
        ccu.column_name AS foreign_column_name
    FROM information_schema.table_constraints AS tc
    JOIN information_schema.key_column_usage AS kcu
        ON tc.constraint_name = kcu.constraint_name
    JOIN information_schema.constraint_column_usage AS ccu
        ON ccu.constraint_name = tc.constraint_name
    WHERE tc.table_name = 'pragas_praga'
    AND tc.constraint_type = 'FOREIGN KEY'
""")
print("=== FK CONSTRAINTS on pragas_praga ===")
for row in cursor.fetchall():
    print(f"  {row[0]}: {row[1]} -> {row[2]}.{row[3]}")

# Check which tables exist for fazenda
cursor.execute("""
    SELECT table_name FROM information_schema.tables
    WHERE table_name LIKE '%fazenda%'
    ORDER BY table_name
""")
print("\n=== FAZENDA TABLES ===")
for row in cursor.fetchall():
    print(f"  {row[0]}")

# Check pragas_praga FK constraint details
cursor.execute("""
    SELECT conname, pg_get_constraintdef(oid)
    FROM pg_constraint
    WHERE conrelid = 'pragas_praga'::regclass
    AND contype = 'f'
""")
print("\n=== CONSTRAINT DEFINITIONS ===")
for row in cursor.fetchall():
    print(f"  {row[0]}: {row[1]}")
