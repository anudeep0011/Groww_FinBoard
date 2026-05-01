# Groww FinBoard - Intelligent Financial Dashboard

<div align="center">

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0+-3178C6?logo=typescript)](https://www.typescriptlang.org/)
[![Next.js](https://img.shields.io/badge/Next.js-16.1+-000000?logo=next.js)](https://nextjs.org/)
[![React](https://img.shields.io/badge/React-19.2+-61DAFB?logo=react)](https://react.dev/)

A powerful, customizable financial dashboard built with modern web technologies. Designed for investors, traders, and developers who need real-time market data, customizable widgets, and professional-grade financial visualizations.

[View Live Demo](https://groww-fin-board-eta.vercel.app) • [Report Bug](https://github.com/anudeep0011/Groww_FinBoard/issues) • [Request Feature](https://github.com/anudeep0011/Groww_FinBoard/issues)

</div>

---

## 🎯 Overview

Groww FinBoard is a production-ready financial dashboard that combines real-time market data, professional charting capabilities, and a highly customizable interface. Whether you're tracking stock portfolios, monitoring cryptocurrency prices, or integrating custom data sources, FinBoard provides the tools to visualize and manage your financial data efficiently.

### Key Capabilities

- 📊 **Real-Time Financial Data**: Live stock candles, volume data, and price updates via Finnhub API
- 🎨 **Professional Charting**: TradingView-powered lightweight-charts for candlestick, area, and line charts
- 🔧 **Fully Customizable**: Drag-and-drop grid system with persistent layout management
- 🔐 **Enterprise Authentication**: Firebase Auth with Email/Password and Google OAuth
- 🌐 **Universal API Integration**: Connect any external JSON API (crypto, weather, sports, etc.)
- 🌓 **Dark/Light Theme**: Beautiful responsive design with full theme support
- ⚡ **High Performance**: Optimized rendering, smart data caching, and efficient state management

---

## 🛠️ Tech Stack

| Component | Technology |
|-----------|-----------|
| **Framework** | [Next.js 16.1](https://nextjs.org/) (App Router) |
| **Language** | [TypeScript 5.0](https://www.typescriptlang.org/) |
| **UI Library** | [React 19.2](https://react.dev/) |
| **Styling** | [Tailwind CSS 3.4](https://tailwindcss.com/) |
| **State Management** | [Zustand 5.0](https://github.com/pmndrs/zustand) |
| **Authentication** | [Firebase Auth](https://firebase.google.com/docs/auth) |
| **Charts** | [Lightweight Charts](https://www.tradingview.com/lightweight-charts/) |
| **Data Fetching** | [SWR 2.3](https://swr.vercel.app/) |
| **Icons** | [Lucide React](https://lucide.dev/) |
| **Animation** | [Framer Motion 12.29](https://www.framer.com/motion/) |
| **Deployment** | [Vercel](https://vercel.com/) |

### Additional Libraries

- `react-grid-layout` - Customizable grid system
- `recharts` - Alternative charting library
- `react-chartjs-2` - Chart.js integration
- `chart.js` - Charting foundation
- `bcryptjs` - Password hashing
- `clsx` & `tailwind-merge` - CSS utilities

---

## 🚀 Getting Started

### Prerequisites

- **Node.js**: 18.x or higher
- **npm**: 9.x or higher (or yarn/pnpm)
- **Firebase Account**: For authentication and data storage
- **Finnhub API Key**: For real-time market data (free tier available)

### Installation

1. **Clone the Repository**
   ```bash
   git clone https://github.com/anudeep0011/Groww_FinBoard.git
   cd Groww_FinBoard
   ```

2. **Install Dependencies**
   ```bash
   npm install
   ```

3. **Configure Environment Variables**
   
   Create a `.env.local` file in the root directory:
   ```bash
   cp .env.local.example .env.local
   ```
   
   Fill in your credentials:
   ```env
   # Finnhub API Configuration
   # Get your free API key from https://finnhub.io
   NEXT_PUBLIC_FINNHUB_API_KEY=your_finnhub_api_key_here

   # Firebase Configuration
   # Get these from your Firebase Console (Project Settings)
   NEXT_PUBLIC_FIREBASE_API_KEY=your_firebase_api_key
   NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
   NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
   NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
   NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
   NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id
   NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID=your_measurement_id
   ```

4. **Start Development Server**
   ```bash
   npm run dev
   ```
   
   Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## 📚 Usage Guide

### Authentication

1. **Sign Up / Sign In**
   - Use email and password, or continue with Google
   - All authentication is handled securely through Firebase
   - Your sessions persist across browser restarts

### Dashboard Customization

1. **Add Widgets**
   - Click the **"+ Add Widget"** button
   - Select from predefined templates (Stock Charts, Crypto Prices) or create a custom widget

2. **Arrange Layout**
   - **Move**: Drag the widget header
   - **Resize**: Drag the bottom-right corner
   - Your layout is automatically saved

3. **Configure APIs**
   - Navigate to **Settings → API Configuration**
   - Add custom API endpoints for real-time data
   - Use field mapping to extract specific data from JSON responses

### Working with Data

- **Real-Time Updates**: Stock data updates automatically via Finnhub
- **Custom APIs**: Connect any external API with JSON responses
- **Variable Substitution**: Use `{{API_KEY}}` for secure variable management
- **Data Caching**: Smart caching ensures optimal performance

### Theme Management

- Toggle between Dark and Light modes from the settings menu
- Theme preference is saved in local storage

---

## 🏗️ Project Structure

```
Groww_FinBoard/
├── src/
│   ├── app/                 # Next.js App Router pages
│   ├── components/          # React components
│   │   ├── dashboard/       # Dashboard-related components
│   │   ├── widgets/         # Widget components
│   │   ├── auth/            # Authentication components
│   │   └── common/          # Reusable UI components
│   ├── context/             # React Context providers
│   ├── hooks/               # Custom React hooks
│   ├── lib/                 # Utility functions
│   ├── services/            # API services and integrations
│   │   ├── firebase.ts      # Firebase initialization
│   │   ├── finnhub.ts       # Finnhub API client
│   │   └── api.ts           # Custom API service
│   ├── store/               # Zustand state management
│   │   ├── dashboardStore.ts
│   │   ├── widgetStore.ts
│   │   └── authStore.ts
│   └── types/               # TypeScript definitions
├── public/                  # Static assets
├── tailwind.config.ts       # Tailwind CSS configuration
├── tsconfig.json            # TypeScript configuration
├── next.config.mjs          # Next.js configuration
└── package.json             # Dependencies and scripts
```

---

## 🔧 Configuration

### Environment Variables

| Variable | Required | Description |
|----------|----------|-----------|
| `NEXT_PUBLIC_FINNHUB_API_KEY` | ✅ | API key for real-time stock data |
| `NEXT_PUBLIC_FIREBASE_API_KEY` | ✅ | Firebase project API key |
| `NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN` | ✅ | Firebase authentication domain |
| `NEXT_PUBLIC_FIREBASE_PROJECT_ID` | ✅ | Firebase project ID |
| `NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET` | ✅ | Firebase storage bucket |
| `NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID` | ✅ | Firebase messaging sender ID |
| `NEXT_PUBLIC_FIREBASE_APP_ID` | ✅ | Firebase app ID |

All variables prefixed with `NEXT_PUBLIC_` are exposed to the browser. Sensitive credentials should not be included here.

---

## 📦 Available Scripts

```bash
# Development
npm run dev          # Start development server (http://localhost:3000)

# Production
npm run build        # Build for production
npm start            # Start production server

# Code Quality
npm run lint         # Run ESLint on TypeScript/JavaScript files
```

---

## 🚀 Deployment

### Deploy on Vercel (Recommended)

Groww FinBoard is optimized for Vercel deployment:

1. **Push to GitHub**
   ```bash
   git push origin main
   ```

2. **Connect to Vercel**
   - Go to [vercel.com](https://vercel.com)
   - Import your GitHub repository
   - Add environment variables in project settings

3. **Deploy**
   - Vercel automatically builds and deploys on push

### Deploy on Other Platforms

The application can also be deployed on:
- **Docker**: Create a Dockerfile with Node.js 18+
- **AWS**, **Google Cloud**, **Azure**: Use their Node.js hosting services
- **Self-Hosted**: Run `npm run build && npm start` on your server

---

## 🔐 Security Considerations

- ✅ Firebase Auth handles authentication securely
- ✅ All API keys should be kept in `.env.local` (never commit to git)
- ✅ `.gitignore` is configured to exclude sensitive files
- ✅ Use HTTPS in production
- ✅ Implement rate limiting for API calls
- ✅ Validate all user inputs on the backend

---

## 🤝 Contributing

Contributions are welcome! To contribute:

1. **Fork** the repository
2. **Create** a feature branch (`git checkout -b feature/amazing-feature`)
3. **Commit** your changes (`git commit -m 'Add amazing feature'`)
4. **Push** to the branch (`git push origin feature/amazing-feature`)
5. **Open** a Pull Request

Please ensure your code:
- Follows TypeScript best practices
- Passes ESLint checks (`npm run lint`)
- Is well-documented
- Includes tests if applicable

---

## 📝 License

This project is licensed under the **MIT License** - see the [LICENSE](LICENSE) file for details.

---

## 🐛 Troubleshooting

### Issue: "Finnhub API Key is invalid"
- Verify your API key from [finnhub.io](https://finnhub.io)
- Ensure the key is correctly added to `.env.local`
- Check that the key hasn't expired or been revoked

### Issue: "Firebase authentication fails"
- Verify Firebase project credentials in `.env.local`
- Ensure Firebase Authentication is enabled in the Firebase Console
- Check that your domain is whitelisted in Firebase settings

### Issue: "Build fails"
- Clear cache: `rm -rf .next && npm install`
- Check Node.js version: `node --version` (should be 18+)
- Verify all environment variables are set correctly

### Issue: "Widgets are not persisting"
- Check browser's localStorage is enabled
- Clear browser cache and reload
- Verify Zustand store is properly initialized

For more issues, visit the [GitHub Issues](https://github.com/anudeep0011/Groww_FinBoard/issues) page.

---

## 📊 Performance & Analytics

- **Lighthouse Score**: Optimized for Core Web Vitals
- **Bundle Size**: Minimized through code splitting
- **API Calls**: Intelligent caching with SWR
- **Real-Time Updates**: Efficient WebSocket or polling strategies

---

## 🎓 Learning Resources

- [Next.js Documentation](https://nextjs.org/docs)
- [React 19 Guide](https://react.dev)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/)
- [Tailwind CSS Documentation](https://tailwindcss.com/docs)
- [Firebase Documentation](https://firebase.google.com/docs)
- [Lightweight Charts Guide](https://www.tradingview.com/lightweight-charts/docs/)

---

## 📞 Support

- 📧 **Email**: Open an issue on GitHub for support
- 🐛 **Bug Reports**: [GitHub Issues](https://github.com/anudeep0011/Groww_FinBoard/issues)
- 💡 **Feature Requests**: [GitHub Discussions](https://github.com/anudeep0011/Groww_FinBoard/discussions)

---

## 🙏 Acknowledgments

- [TradingView](https://www.tradingview.com/) for lightweight-charts
- [Finnhub](https://finnhub.io) for real-time market data
- [Firebase](https://firebase.google.com/) for authentication and hosting
- [Vercel](https://vercel.com/) for deployment platform
- All open-source contributors and maintainers

---

<div align="center">

Made with ❤️ by [anudeep0011](https://github.com/anudeep0011)

⭐ If you found this helpful, please consider giving it a star!

</div>
