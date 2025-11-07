#!/bin/bash

# AI Whiteboard Setup Script
echo "🎨 AI Whiteboard Setup"
echo "====================="
echo ""

# Check if .env.local exists
if [ -f ".env.local" ]; then
    echo "✅ .env.local file exists"
else
    echo "📝 Creating .env.local from template..."
    cp .env.example .env.local
    echo "⚠️  Please edit .env.local and add your GROQ_API_KEY"
    echo "   Get your key from: https://console.groq.com/keys"
fi

echo ""
echo "📦 Installing dependencies..."
pnpm install

echo ""
echo "✅ Setup complete!"
echo ""
echo "Next steps:"
echo "1. Edit .env.local and add your GROQ_API_KEY"
echo "2. Run 'pnpm dev' to start the development server"
echo "3. Open http://localhost:3000 in your browser"
echo ""
echo "📚 For more information, see SETUP.md"
