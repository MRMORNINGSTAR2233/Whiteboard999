# AI Whiteboard Setup Guide

## Quick Start

### 1. Install Dependencies
```bash
pnpm install
```

### 2. Configure Environment Variables

Copy the example environment file:
```bash
cp .env.example .env.local
```

Edit `.env.local` and add your Groq API key:
```env
GROQ_API_KEY=your_actual_api_key_here
```

**Get your Groq API key:**
1. Visit https://console.groq.com/keys
2. Sign up or log in
3. Create a new API key
4. Copy and paste it into `.env.local`

### 3. Start Development Server
```bash
pnpm dev
```

Visit http://localhost:3000

## Features

### ✅ Working Features
- **TLDraw Canvas**: Professional whiteboard with drawing tools
- **AI Diagram Generation**: Create flowcharts, mindmaps, and diagrams with AI
- **Shape Library**: Pre-built shapes and templates
- **Export**: Export to PNG, SVG, PDF, and JSON
- **Auto-save**: Automatic local storage persistence
- **Keyboard Shortcuts**: Full keyboard navigation
- **Formatting Tools**: Text styling, colors, and properties
- **Template Library**: Pre-made templates for common use cases

### 🚧 Partially Implemented
- **Real-time Collaboration**: UI exists, needs WebSocket backend
- **Comments**: UI exists, needs backend integration
- **Admin Dashboard**: Basic structure, needs full implementation

### 🔧 Configuration Options

#### AI Model Selection
You can change the AI model in `.env.local`:
```env
GROQ_MODEL=llama-3.3-70b-versatile  # Default, best for diagrams
# or
GROQ_MODEL=llama-3.1-70b-versatile  # Alternative
```

## Keyboard Shortcuts

- `Ctrl/Cmd + E` - Toggle Export Panel
- `Ctrl/Cmd + K` - Toggle Collaboration Panel
- `Ctrl/Cmd + I` - Toggle AI Assistant
- `Ctrl/Cmd + Shift + S` - Toggle Shape Library
- `Ctrl/Cmd + D` - Duplicate selected elements
- `Ctrl/Cmd + L` - Lock/Unlock selected elements
- `Delete/Backspace` - Delete selected elements
- `Escape` - Deselect all / Close panels

## Troubleshooting

### AI Features Not Working
1. Check that `GROQ_API_KEY` is set in `.env.local`
2. Restart the dev server after adding the key
3. Check browser console for error messages
4. Verify your API key is valid at https://console.groq.com

### Canvas Not Loading
1. Clear browser cache and localStorage
2. Check browser console for errors
3. Ensure all dependencies are installed: `pnpm install`

### Export Not Working
1. Check browser permissions for downloads
2. Try a different export format
3. Ensure shapes exist on the canvas

## Project Structure

```
├── app/
│   ├── api/ai/              # AI API endpoints
│   ├── whiteboard/[id]/     # Whiteboard pages
│   └── admin/               # Admin dashboard
├── components/
│   ├── whiteboard/          # Whiteboard components
│   └── ui/                  # Reusable UI components
├── lib/                     # Utility functions
├── hooks/                   # Custom React hooks
├── types/                   # TypeScript types
└── public/                  # Static assets and templates
```

## Next Steps

### To Enable Real-time Collaboration:
1. Set up a WebSocket server (Socket.io, Pusher, or Ably)
2. Implement presence tracking
3. Add cursor synchronization
4. Enable real-time shape updates

### To Add Authentication:
1. Install NextAuth.js or Clerk
2. Protect whiteboard routes
3. Add user management
4. Implement sharing permissions

### To Deploy:
1. Push to GitHub
2. Deploy to Vercel (recommended) or other platforms
3. Add production environment variables
4. Configure custom domain (optional)

## Support

For issues or questions:
- Check the browser console for errors
- Review this setup guide
- Ensure all environment variables are set correctly
