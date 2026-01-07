import type { Metadata } from "next";
import { Lato, Source_Sans_3 } from "next/font/google";
import { ToastProvider } from "@/components/providers/toast-provider";
import "./globals.css";

const lato = Lato({
  variable: "--font-lato",
  subsets: ["latin"],
  weight: ["300", "400", "700", "900"],
});

const sourceSans = Source_Sans_3({
  variable: "--font-source-sans",
  subsets: ["latin"],
  weight: ["400", "600", "700"],
});

export const metadata: Metadata = {
  title: {
    default: "Haigent Demo",
    template: "%s | Haigent Demo",
  },
  description: "AI-powered HR automation demo platform",
  icons: {
    icon: "/favicon.ico",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${lato.variable} ${sourceSans.variable} antialiased`}>
        {children}
        <ToastProvider />
      </body>
    </html>
  );
}
