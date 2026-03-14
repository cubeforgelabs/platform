import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Cubeforge - Build Games with React",
  description:
    "A React-first 2D game engine for the browser. Write real TypeScript, build real games. Perfect for kids and beginners learning to code through game development.",
  keywords: [
    "game engine",
    "react",
    "typescript",
    "2d games",
    "learn to code",
    "kids programming",
    "browser games",
    "game development",
    "cubeforge",
  ],
  authors: [{ name: "Cubeforge Labs" }],
  openGraph: {
    title: "Cubeforge - Build Games with React",
    description:
      "A React-first 2D game engine for the browser. Write real TypeScript, build real games.",
    url: "https://cubeforge.dev",
    siteName: "Cubeforge",
    type: "website",
    locale: "en_US",
  },
  twitter: {
    card: "summary_large_image",
    title: "Cubeforge - Build Games with React",
    description:
      "A React-first 2D game engine for the browser. Write real TypeScript, build real games.",
  },
  metadataBase: new URL("https://cubeforge.dev"),
  robots: {
    index: true,
    follow: true,
  },
  icons: {
    icon: [
      { url: "/favicon.ico", sizes: "any" },
      { url: "/favicon-96x96.png", sizes: "96x96", type: "image/png" },
      { url: "/favicon.svg", type: "image/svg+xml" },
    ],
    apple: "/apple-touch-icon.png",
  },
  manifest: "/site.webmanifest",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        {/* Blocking script: set theme before first paint to avoid flash */}
        <script
          dangerouslySetInnerHTML={{
            __html: `(function(){try{var t=localStorage.getItem('cf-theme');if(!t)t=window.matchMedia('(prefers-color-scheme: dark)').matches?'dark':'light';document.documentElement.setAttribute('data-theme',t);}catch(e){}})();`,
          }}
        />
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        {children}
      </body>
    </html>
  );
}
