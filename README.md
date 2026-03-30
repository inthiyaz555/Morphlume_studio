# 🎨 Morphlume Studio

<div align="center">
  <img src="https://github.com/user-attachments/assets/0aa67016-6eaf-458a-adb2-6e31a0763ed6" alt="Morphlume Studio Banner" width="100%" />
  
  <h3>The Ultimate AI-Powered Creative Studio</h3>
  
  <p align="center">
    <a href="#-features">Features</a> •
    <a href="#-tech-stack">Tech Stack</a> •
    <a href="#-getting-started">Getting Started</a> •
    <a href="#-screens">Screens</a>
  </p>
</div>

---

## ✨ Overview

**Morphlume Studio** is a cutting-edge, all-in-one platform for AI-driven creativity. Whether you're looking to transform images, process videos, or turn live sketches into masterpieces, Morphlume provides a seamless, premium experience powered by state-of-the-art AI models.

Built with a focus on high performance and stunning aesthetics, it bridges the gap between complex AI workflows and intuitive user interfaces.

---

## 🚀 Features

### 🖼️ AI Image Tools
- **Cloud Transformations**: Powered by **Google Gemini 1.5/2.5** for high-fidelity image understanding and generation.
- **Local AI Processing**: Integrated **Hugging Face Transformers.js** for privacy-focused, browser-side AI tasks.
- **Style Transfer**: Apply artistic styles to your photos instantly.

### 🎥 Video Suite
- AI-enhanced video tools for background removal, style application, and motion analysis.

### ✍️ Live Sketch-to-AI
- Draw directly on the canvas and watch as the AI interprets your strokes into high-quality artwork in real-time.

### 🔐 Secure & Personalized
- **JWT-based Authentication**: Secure login and signup flow.
- **User Profiles**: Track your transformation history and manage your preferences.
- **Social Features**: Read and share insights through the integrated Blog module.

### 💬 Intelligent Assistant
- Built-in **ChatWidget** to guide you through the studio's features using AI.

---

## 🛠 Tech Stack

### Frontend
- **Framework**: [React 19](https://react.dev/)
- **Build Tool**: [Vite 6](https://vitejs.dev/)
- **Styling**: [Tailwind CSS 4](https://tailwindcss.com/)
- **Animations**: [Framer Motion](https://www.framer.com/motion/)
- **Icons**: [Lucide React](https://lucide.dev/)

### Backend
- **Server**: [Node.js](https://nodejs.org/) & [Express](https://expressjs.com/)
- **Database**: JSON-based persistent storage (for portability) & SQLite support.
- **Auth**: JSON Web Tokens (JWT) & Bcrypt for password hashing.

### AI Engines
- **Cloud**: [Google Gemini API](https://ai.google.dev/)
- **Local**: [Hugging Face Transformers.js](https://huggingface.co/docs/transformers.js/index)

---

## 🏁 Getting Started

### Prerequisites
- Node.js (v18 or higher)
- A Google Gemini API Key

### Installation

1.  **Clone the repository**
    ```bash
    git clone https://github.com/inthiyaz555/Morphlume_studio.git
    cd Morphlume_studio
    ```

2.  **Install dependencies**
    ```bash
    npm install
    ```

3.  **Environment Setup**
    Create a `.env` file in the root directory:
    ```env
    VITE_GEMINI_API_KEY=your_gemini_api_key_here
    JWT_SECRET=your_secret_key_here
    ```

4.  **Run Development Server**
    ```bash
    npm run dev
    ```
    The server will start at `http://localhost:3000`.

---

## 📸 Project Structure

```text
morphlume-studio/
├── src/
│   ├── components/    # Reusable UI components
│   ├── pages/         # High-level page layouts
│   ├── services/      # AI and API integration logic
│   ├── AuthContext/   # Global authentication state
│   └── styles/        # Global CSS and Tailwind setup
├── server.ts          # Express backend with Vite integration
├── db.json            # Local persistent storage
└── vite.config.ts     # Build configuration
```

---

## 🛡 License

This project is private and for demonstration purposes.

---

<div align="center">
  <sub>Built with ❤️ by <a href="https://github.com/inthiyaz555">inthiyaz555</a></sub>
</div>

