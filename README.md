# AI Coding Platform Prototype

This project is a minimal proof of concept for a browser-based coding environment inspired by Replit. It integrates AI code completion and voice-to-code functionality using OpenAI's APIs. The platform is intended as a starting point for building a much more feature-rich system.

## Features

- **Monaco Editor** in the browser for a VS Code–like experience.
- **AI Code Completion** via GPT-4 (requires `OPENAI_API_KEY`).
- **Voice to Code** using OpenAI Whisper for speech transcription.
- Basic Express server serving static files and API endpoints.
- Simplified file management through the editor (no persistence beyond the browser).

Future versions could add:
- Multiple AI model providers (Claude, Gemini, etc.).
- Container-based project hosting and previews.
- User authentication and project templates (React, Python, Node.js).
- Domain management and deployment options.

## Getting Started

1. Install dependencies:
   ```bash
   npm install
   ```
2. Export your OpenAI API key:
   ```bash
   export OPENAI_API_KEY=your-key-here
   ```
3. Start the server:
   ```bash
   node server/index.js
   ```
4. Open `http://localhost:3000` in your browser.

This prototype is intentionally lightweight and leaves many features unimplemented. It should serve as a foundation for more advanced development.
