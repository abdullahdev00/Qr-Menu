#!/bin/bash

# Git Remote Setup Script
# Usage: ./setup-git.sh

echo "🔧 Setting up Git remote..."

# Check if GITHUB_PERSONAL_ACCESS_TOKEN is set
if [ -z "$GITHUB_PERSONAL_ACCESS_TOKEN" ]; then
    echo "❌ Error: GITHUB_PERSONAL_ACCESS_TOKEN environment variable is not set"
    echo "Please set your GitHub token first:"
    echo "export GITHUB_PERSONAL_ACCESS_TOKEN=your_token_here"
    exit 1
fi

# Set the remote URL with token
git remote set-url origin "https://abdullahdev00:${GITHUB_PERSONAL_ACCESS_TOKEN}@github.com/abdullahdev00/Qr-Menu.git"

echo "✅ Git remote URL updated successfully!"
echo "🔍 Current remote URL:"
git remote get-url origin

echo "📝 You can now push/pull without entering credentials"