"""Update the seeded user's email from seed@leafai.test to seed@example.com
so it passes EmailStr validation used by the API.
"""
import sys
from pathlib import Path
sys.path.insert(0, str(Path(__file__).resolve().parents[1]))

from app.core.database import get_database

old = 'seed@leafai.test'
new = 'seed@example.com'

db = get_database()
res = db.users.update_one({'email': old}, {'$set': {'email': new}})
print('matched_count:', res.matched_count, 'modified_count:', res.modified_count)
