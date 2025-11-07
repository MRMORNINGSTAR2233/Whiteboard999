# AI Whiteboard - Professional Collaboration Tool

🎨 A powerful, AI-enhanced whiteboard application for teams, classrooms, and creative professionals.

## ✨ Features

- **AI-Powered Diagram Generation** - Create flowcharts, mindmaps, and business diagrams with AI
- **Professional Drawing Tools** - Built on TLDraw for smooth, responsive canvas experience
- **Smart Templates** - Pre-built templates for common use cases
- **Export Options** - Export to PNG, SVG, PDF, and JSON formats
- **Auto-Save** - Never lose your work with automatic local storage
- **Keyboard Shortcuts** - Full keyboard navigation for power users
- **Real-time Collaboration UI** - (Backend integration required)

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ 
- pnpm (recommended) or npm

### Installation

1. **Clone and install dependencies:**
```bash
pnpm install
```

2. **Set up environment variables:**
```bash
cp .env.example .env.local
```

3. **Add your Groq API key to `.env.local`:**
```env
GROQ_API_KEY=your_groq_api_key_here
```

Get your free API key from [console.groq.com/keys](https://console.groq.com/keys)

4. **Start the development server:**
```bash
pnpm dev
```

5. **Open your browser:**
Visit [http://localhost:3000](http://localhost:3000)

## 📚 Documentation

- **[Setup Guide](SETUP.md)** - Detailed setup instructions and troubleshooting
- **[Fixes Applied](FIXES_APPLIED.md)** - Recent improvements and bug fixes

## 🎯 Current Status

### ✅ Working Features
- TLDraw canvas integration
- AI diagram generation (with API key)
- Shape library and templates
- Export functionality
- Auto-save and persistence
- Keyboard shortcuts
- Error handling

### 🚧 In Progress
- Real-time collaboration (UI ready, needs backend)
- Admin dashboard
- Advanced analytics

## 🛠️ Tech Stack

- **Framework:** Next.js 14 with App Router
- **Canvas:** TLDraw
- **AI:** Groq API (Llama 3.3)
- **UI:** Radix UI + Tailwind CSS
- **Language:** TypeScript

## 📝 License

MIT

## 🤝 Contributing

Contributions welcome! Please read the setup guide first.

---

**Original Concept:** AI Whiteboard for real-time collaboration  
**Live Demo:** https://v0-ai-whiteboarding-tool.vercel.app/
