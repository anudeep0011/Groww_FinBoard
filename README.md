# FinBoard - Intelligent Finance Dashboard

FinBoard is a customizable, production-ready finance dashboard designed for investors and developers. It features a high-performance grid system, real-time stock data processing, and a unique "Widget-Centric" API management system that allows you to connect any JSON API directly to your dashboard.

![FinBoard Dashboard](./public/screenshots/dashboard-preview.png)
*(Replace with actual screenshot)*

## 🚀 Key Features

*   **Authentication & Security**: Full Firebase Auth integration (Email/Password & Google OAuth) with protected routes.
*   **Customizable Workspace**: Drag-and-drop grid system backed by `react-grid-layout` with persistent layout saving.
*   **Real-Time Market Data**: Integrated **Finnhub API** for live stock candles, volume data, and real-time price updates.
*   **Professional Charting**: Powered by TradingView's `lightweight-charts` for high-performance financial visualization (Candlestick, Area, Line).
*   **Universal API Connectivity**:
    *   **Custom Widgets**: Connect *any* external JSON API (crypto, weather, sports).
    *   **Field Mapping**: Intelligent JSON flattening and field auto-suggestion.
    *   **Variable Substitution**: Use `{{API_KEY}}` variables securely.
*   **Theming**: Beautiful Dark/Light mode support built with Tailwind CSS.

## 🛠️ Tech Stack

*   **Core**: [Next.js 14](https://nextjs.org/) (App Router), TypeScript, React
*   **Styling**: Tailwind CSS, Lucide Icons
*   **State Management**: Zustand (with LocalStorage persistence)
*   **Backend / Auth**: Google Firebase (Auth, Firestore capable)
*   **Visualization**: Lightweight Charts (TradingView)
*   **Deployment**: Vercel Ready

## 🏃‍♂️ Getting Started

### 1. Prerequisites
*   Node.js 18+
*   npm

### 2. Installation

```bash
git clone https://github.com/yourusername/finboard.git
cd finboard
npm install
```

### 3. Environment Configuration
This project relies on **Firebase** for auth and **Finnhub** for market data.

1.  Create a `.env.local` file in the root:
    ```bash
    cp .env.local.example .env.local
    ```

2.  Populate it with your credentials:

    ```env
    # Market Data (Get free key from finnhub.io)
    NEXT_PUBLIC_FINNHUB_API_KEY=your_finnhub_key

    # Firebase Configuration (Get from Firebase Console)
    NEXT_PUBLIC_FIREBASE_API_KEY=your_firebase_api_key
    NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
    NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
    NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
    NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
    NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id
    ```

### 4. Running Locally

```bash
npm run dev
```
Visit [http://localhost:3000](http://localhost:3000) to start.

## 🔮 How to Use

### Managing APIs
FinBoard uses a **Widget-Centric** approach. You don't manage a list of keys in a vacuum; you manage them *with* the widgets that use them.
1.  **Add a Widget**: Click `+ Add Widget` -> `Custom API`.
2.  **Configure**: Enter your API Endpoint (e.g., `https://api.coindesk.com/v1/bpi/currentprice.json`).
3.  **Edit**: Hover over the widget in the `Settings > API Configuration` list to jump back to its config.

### Layouts
*   **Arrange**: Drag header to move, grab bottom-right corner to resize.
*   **Reset**: Use `Settings > Reset Dashboard` to restore default layout.

## 📦 Production Build

The application is fully optimized for production.
```bash
npm run build
# Output check
npm run lint
```

## 📄 License
MIT
