import type { Metadata } from "next";
import { Fraunces, Inter, JetBrains_Mono } from "next/font/google";
import "./globals.css";

const fraunces = Fraunces({
  variable: "--font-display",
  subsets: ["latin"],
  weight: ["500", "600"],
});

const inter = Inter({
  variable: "--font-sans",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

const jetBrainsMono = JetBrains_Mono({
  variable: "--font-mono",
  subsets: ["latin"],
  weight: ["400", "500"],
});

export const metadata: Metadata = {
  title: "HPP Patient Check-In",
  description:
    "Real-time visibility into patient activity and financial outcomes - improve accuracy, reduce billing errors, strengthen collections.",
  openGraph: {
    title: "HPP Patient Check-In",
    description:
      "Practice control layer for patient operations & billing oversight. Real-time visibility to improve accuracy, reduce billing errors, and strengthen collections.",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html
      lang="en"
      className={`${fraunces.variable} ${inter.variable} ${jetBrainsMono.variable}`}
    >
      <body className={`${fraunces.variable} ${inter.variable} ${jetBrainsMono.variable} antialiased`}>
        {children}
      </body>
    </html>
  );
}
