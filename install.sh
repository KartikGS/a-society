#!/usr/bin/env bash
set -e
SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"

echo "Installing A-Society..."
cd "$SCRIPT_DIR/runtime"
npm install
chmod +x bin/a-society
npm link

echo ""
echo "Installation complete. The 'a-society' command is now available."
echo ""
echo "Before running, set your Anthropic API key:"
echo "  export ANTHROPIC_API_KEY=your_api_key_here"
echo ""
echo "Usage: cd to your workspace root, then run 'a-society'"
