#!/usr/bin/env bash

echo "--- Starting Django Q Cluster (Background) ---"
python manage.py qcluster &

echo "--- Starting Daphne ASGI Server (Foreground) ---"
# Bind to the PORT environment variable provided by Render
daphne -b 0.0.0.0 -p ${PORT:-8000} core.asgi:application
