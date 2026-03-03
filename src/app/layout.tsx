import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { TopNav } from "@/components/layout/TopNav";
import { Sidebar } from "@/components/layout/Sidebar";
import { Footer } from "@/components/layout/Footer";
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
  title: "시시덕 - 티어메이커, 랭킹",
  description: "나만의 티어리스트를 만들고 공유하세요",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko">
      <body
        className={`${geistSans.variable} ${geistMono.variable} font-sans antialiased`}
      >
        <TopNav />
        <div className="flex pt-[var(--nav-height)]">
          <Sidebar />
          <main className="ml-[var(--sidebar-width)] flex min-h-[calc(100vh-var(--nav-height))] flex-1 flex-col">
            <div className="flex-1 px-6 py-6">{children}</div>
            <Footer />
          </main>
        </div>
      </body>
    </html>
  );
}
