import type { Metadata } from "next";
// import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

/*
const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});
*/

export const metadata: Metadata = {
  title: "FinBoard",
  description: "Real-time financial tracking and analysis",
  icons: {
    icon: "data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'><text y='.9em' font-size='90'>📊</text></svg>",
  },
};

import { AuthProvider } from "@/context/AuthContext";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`antialiased`}
      >
        <AuthProvider>
          <script
            dangerouslySetInnerHTML={{
              __html: `
                (function() {
                    try {
                    const storage = localStorage.getItem('finboard-storage');
                    if (storage) {
                        const parsed = JSON.parse(storage);
                        if (parsed.state && parsed.state.theme === 'dark') {
                        document.documentElement.classList.add('dark');
                        } else {
                        document.documentElement.classList.remove('dark');
                        }
                    }
                    } catch (e) {
                    console.error('Theme script error:', e);
                    }
                })()
                `,
            }}
          />
          {children}
        </AuthProvider>
      </body>
    </html>
  );
}
