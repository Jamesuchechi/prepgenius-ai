#!/usr/bin/env bash
# exit on error
set -o errexit

echo "--- Installing dependencies ---"
pip install -r requirements.txt

# NOTE: Always run 'makemigrations' locally and commit them to Git.
# Never run 'makemigrations' in production to avoid divergent history.
echo "--- Running Migrations ---"
python manage.py migrate --noinput

echo "--- Collecting Static Files ---"
python manage.py collectstatic --noinput

echo "--- Seeding Initial Data ---"
python manage.py load_countries
python manage.py load_nigeria_data
python manage.py seed_standardized_subjects
python manage.py load_math_topics
python manage.py seed_badges
python manage.py seed_subscription_plans

echo "--- Creating Superuser if missing ---"
python manage.py createsuperuser_if_none_exists

echo "--- Build Completed Successfully ---"
