import os, django
os.environ['DJANGO_SETTINGS_MODULE'] = 'backend.settings'
django.setup()

from django.db import connection
cursor = connection.cursor()

# Check schemas
cursor.execute("""
    SELECT table_schema, table_name FROM information_schema.tables
    WHERE table_name LIKE '%fazenda%' OR table_name LIKE '%praga%'
    ORDER BY table_schema, table_name
""")
print("=== TABLES WITH SCHEMA ===")
for row in cursor.fetchall():
    print(f"  {row[0]}.{row[1]}")

# Check current search_path
cursor.execute("SHOW search_path")
print(f"\nsearch_path: {cursor.fetchone()[0]}")

# Check fazenda_fazenda in public schema
cursor.execute("""
    SELECT schemaname, tablename FROM pg_tables
    WHERE tablename = 'fazenda_fazenda'
""")
print(f"\nfazenda_fazenda locations:")
for row in cursor.fetchall():
    print(f"  schema={row[0]}, table={row[1]}")

# Try direct query
cursor.execute("SELECT id, nome FROM fazenda_fazenda LIMIT 3")
print(f"\nfazenda_fazenda data:")
for row in cursor.fetchall():
    print(f"  id={row[0]}, nome={row[1]}")
