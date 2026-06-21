#!/usr/bin/env bash
set -euo pipefail

# Create and activate virtualenv to avoid PEP 668 'externally-managed-environment' errors
python -m venv .venv
source .venv/bin/activate

python -m pip install --upgrade pip

# Install requirements; use PyTorch CPU index so Render finds compatible wheels
pip install -r requirements.txt --extra-index-url https://download.pytorch.org/whl/cpu

echo "Build script finished"
