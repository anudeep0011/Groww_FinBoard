# FinBoard - Finance Dashboard

FinBoard is a customizable, high-performance finance dashboard built with Next.js, Tailwind CSS, and Zustand.

## 🚀 Features

-   **Draggable & Resizable Grid**: Organize your workspace exactly how you want.
-   **Real-time Stock Data**: Simulated live price updates for AAPL, GOOGL, BTC, etc.
-   **Multiple Widget Types**:
    -   **Charts**: Interactive area charts.
    -   **Market Table**: Overview of top performers.
    -   **Portfolio Card**: Quick portfolio summary.
-   **Theme Support**: Built-in Light and Dark modes.
-   **Persistence**: Your layout and settings are saved automatically.

## 🛠️ Tech Stack

-   **Framework**: Next.js 14 (App Router)
-   **Styling**: Tailwind CSS 3.4
-   **State**: Zustand + Persist Middleware
-   **Charts**: Recharts
-   **Grid**: React-Grid-Layout

## 🏃‍♂️ Getting Started

### 1. Prerequisites
- Node.js 18+
- npm or yarn

### 2. Installation
```bash
git clone <repository-url>
cd finboard
npm install
```

### 3. API Configuration
This project uses the **Finnhub Stock API** for real-time market data.

1.  Get a free API Key from [finnhub.io](https://finnhub.io/).
2.  Create a `.env.local` file in the root directory:
    ```bash
    cp .env.local.example .env.local
    # Or just create it manually
    ```
3.  Add your API Key:
    ```env
    NEXT_PUBLIC_FINNHUB_API_KEY=your_actual_api_key_here
    ```

### 4. Running the App
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) to view the dashboard.

## 📂 Folder Structure

```
finboard/
├── src/
│   ├── app/                 # Next.js App Router pages & layout
│   ├── components/
│   │   ├── dashboard/       # Dashboard-specific components (Grid, Toolbar)
│   │   └── widgets/         # Individual widget components (Chart, Card)
│   ├── hooks/               # Custom React hooks (useStockData)
│   ├── lib/                 # Utilities (CN, JSON flattening)
│   ├── services/            # API services and fetchers
│   ├── store/               # Zustand state management
│   └── types/               # TypeScript definitions
├── public/                  # Static assets
└── ...config files          # Next.js, Tailwind, ESLint configs
```

## 🔮 Usage

1.  **Adding Widgets**: Click the **+ Add Widget** button in the floating toolbar.
2.  **Custom Data**: Choose "Custom API" to connect any JSON API.
3.  **Layout**: Click the **Gear Icon** -> **Edit Layout** to drag and resize widgets.
4.  **Themes**: Toggle Dark/Light mode via the **Gear Icon** menu.
