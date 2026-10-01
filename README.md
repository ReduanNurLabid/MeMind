# 🧠 MeMind — Subconscious Word Association Game

[![Live Demo](https://img.shields.io/badge/Live%20Demo-Play%20Now-6366f1?style=for-the-badge&logo=google-chrome&logoColor=white)](https://reduannurlabid.github.io/MeMind/)
[![Built with React](https://img.shields.io/badge/React-19-61dafb?style=for-the-badge&logo=react&logoColor=black)](https://react.dev/)
[![Three.js](https://img.shields.io/badge/Three.js-3D%20Neural%20Map-black?style=for-the-badge&logo=three.js&logoColor=white)](https://threejs.org/)
[![Transformers.js](https://img.shields.io/badge/Transformers.js-Client%20Side%20AI-orange?style=for-the-badge&logo=huggingface&logoColor=white)](https://huggingface.co/docs/transformers.js)

> *"The mind is like an iceberg, it floats with one-seventh of its bulk above water."* — Sigmund Freud

**MeMind** is an interactive psychoanalytic word association game that taps into your subconscious mind. By measuring your reaction times, semantic deviations, hesitation latencies, and emotional defense mechanisms, MeMind constructs a personalized psychological diagnostic profile accompanied by an interactive 3D neural brain visualization.

---

## ✨ Features

- **⚡ Rapid-Fire Association Tests**: Voice or text-based prompt-reaction loops measuring cognitive latency in milliseconds.
- **🧠 3D Interactive Subconscious Brain**: Explore your neural activity map in full 3D built with Three.js / WebGL.
- **🤖 Client-Side Semantic AI**: Powered by `@xenova/transformers` (`all-MiniLM-L6-v2`) running directly in your browser without sending any private data to external servers.
- **📜 Freudian Diagnostic Profiling**: Generates psychodynamic summaries, defensive censorship assessments, and sub-archetype evaluations.
- **📸 Export & Share**: High-resolution diagnostic card exports ready for sharing with friends.

---

## 🚀 Live Site

Play the game directly in your browser:
**👉 [https://reduannurlabid.github.io/MeMind/](https://reduannurlabid.github.io/MeMind/)**

*(Or deploy in 1 click to [Vercel](https://vercel.com) by connecting this repository)*

---

## 🛠️ Local Development

### Prerequisites
- Node.js (v18 or higher recommended)
- npm or yarn

### Getting Started

1. **Clone the repository:**
   ```bash
   git clone https://github.com/ReduanNurLabid/MeMind.git
   cd MeMind
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Start local development server:**
   ```bash
   npm run dev
   ```

4. **Build for production:**
   ```bash
   npm run build
   ```

---

## 🌐 Automatic Deployment

This repository includes a preconfigured GitHub Actions workflow (`.github/workflows/deploy.yml`).
Whenever changes are pushed to `main`, GitHub Pages automatically builds and publishes the live site.

To enable GitHub Pages in your repository:
1. Go to your repository on GitHub: `https://github.com/ReduanNurLabid/MeMind`
2. Navigate to **Settings** > **Pages**
3. Under **Build and deployment** > **Source**, select **GitHub Actions**
4. Push your code, and your game will go live!

---

## 📄 License
MIT License. Feel free to play, fork, and explore!
