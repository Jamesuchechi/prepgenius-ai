#!/usr/bin/env python
"""Verify study_plans database tables exist."""

import os
import sys
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'core.settings')
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

django.setup()

from django.db import connection

# Get all table names
with connection.cursor() as cursor:
    cursor.execute("SELECT name FROM sqlite_master WHERE type='table' AND name LIKE '%study%'")
    tables = [row[0] for row in cursor.fetchall()]

print("✓ Study Plans Database Tables Created:")
print("=" * 60)
for table in sorted(tables):
    print(f"  • {table}")

print(f"\nTotal tables: {len(tables)}")
print("=" * 60)

# Verify the 4 main models
expected_tables = [
    'study_plans_studyplan',
    'study_plans_studytask', 
    'study_plans_studyreminder',
    'study_plans_adjustmenthistory'
]

missing = [t for t in expected_tables if t not in tables]
if missing:
    print(f"\n✗ Missing tables: {missing}")
    sys.exit(1)
else:
    print("\n✓ All expected tables present!")
    print("✓ Database migration successful!")
    sys.exit(0)
