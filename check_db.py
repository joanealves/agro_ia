import os, django
os.environ['DJANGO_SETTINGS_MODULE'] = 'backend.settings'
django.setup()
from django.db import connection
cursor = connection.cursor()
cursor.execute("SELECT column_name, data_type FROM information_schema.columns WHERE table_name = 'pragas_praga' ORDER BY ordinal_position")
print("=== PRAGAS_PRAGA COLUMNS ===")
for row in cursor.fetchall():
    print(f"  {row[0]:20s} {row[1]}")
