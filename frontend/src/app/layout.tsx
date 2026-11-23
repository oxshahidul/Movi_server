import type { Metadata } from "next";
import "./globals.css";
import Providers from "../components/Providers";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";

export const metadata: Metadata = {
  title: "ScreenBox — Cinema-Grade Streaming & Entertainment",
  description:
    "Recreation of ScreenBox: Browse movies, binge TV series, experience bufferless HLS playback, continue watching across devices.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark">
      <body className="bg-cinema-950 text-slate-100 min-h-screen flex flex-col font-sans">
        <Providers>
          <Navbar />
          <main className="flex-1">{children}</main>
          <Footer />
        </Providers>
      </body>
    </html>
  );
}
