#!/bin/bash

# Slotly Setup Script
# This script sets up the development environment for the Slotly appointment management system

set -e

echo "🚀 Setting up Slotly..."

# Check if .env exists
if [ ! -f .env ]; then
    echo "📝 Creating .env file..."
    cp .env.example .env
    echo "✅ .env file created"
else
    echo "✅ .env file already exists"
fi

# Install dependencies
echo "📦 Installing dependencies..."
pnpm install

# Push database schema
echo "🗄️  Setting up database..."
pnpm db:push

echo ""
echo "✅ Setup complete!"
echo ""
echo "📚 Next steps:"
echo "  1. Run 'pnpm dev' to start the development server"
echo "  2. Open http://localhost:5173 in your browser"
echo "  3. Register a new account to get started"
echo ""
echo "💡 Tips:"
echo "  - Run 'pnpm db:studio' to open Drizzle Studio (database GUI)"
echo "  - Check the README.md for more information"
echo ""
