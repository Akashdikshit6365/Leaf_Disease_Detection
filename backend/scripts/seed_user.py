"""Seed a test user into the MongoDB users collection via the existing
`register_user` service. Safe to run multiple times (will skip if user exists).
"""
import sys
from pathlib import Path
sys.path.insert(0, str(Path(__file__).resolve().parents[1]))

from app.services import auth_service
from pymongo.errors import DuplicateKeyError

email = 'seed@leafai.test'
password = 'SeedPass!23'
name = 'Seed User'

try:
    user = auth_service.register_user(name=name, email=email, password=password)
    print('User created:', user)
except DuplicateKeyError:
    print('User already exists — skipping')
except Exception as exc:
    print('Failed to create user:', exc)
