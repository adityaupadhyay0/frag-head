import type { Metadata } from "next";
import { Geist_Mono } from "next/font/google";
import "./globals.css";

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Frag-Head | AI Scent Discovery",
  description: "8-bit Luxury Noir Fragrance Engine",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body
        className={`${geistMono.variable} font-mono antialiased bg-retro-black text-retro-slate` }
      >
        <div className="scanline" />
        {children}
      </body>
    </html>
  );
}
