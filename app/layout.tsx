import type { Metadata } from "next";
import localFont from "next/font/local";
import "./globals.css";

const loveSans = localFont({
  variable: "--font-love-sans",
  display: "swap",
  src: [
    {
      path: "../public/fonts/LoveSans-Light.woff",
      weight: "300",
      style: "normal",
    },
    {
      path: "../public/fonts/LoveSans-LightItalic.woff",
      weight: "300",
      style: "italic",
    },
    {
      path: "../public/fonts/LoveSans-Regular.woff",
      weight: "400",
      style: "normal",
    },
    {
      path: "../public/fonts/LoveSans-RegularItalic.woff",
      weight: "400",
      style: "italic",
    },
    {
      path: "../public/fonts/LoveSans-Medium.woff",
      weight: "500",
      style: "normal",
    },
    {
      path: "../public/fonts/LoveSans-MediumItalic.woff",
      weight: "500",
      style: "italic",
    },
    {
      path: "../public/fonts/LoveSans-Semibold.woff",
      weight: "600",
      style: "normal",
    },
    {
      path: "../public/fonts/LoveSans-SemiboldItalic.woff",
      weight: "600",
      style: "italic",
    },
    {
      path: "../public/fonts/LoveSans-Bold.woff",
      weight: "700",
      style: "normal",
    },
    {
      path: "../public/fonts/LoveSans-BoldItalic.woff",
      weight: "700",
      style: "italic",
    },
  ],
});

export const metadata: Metadata = {
  title: "clove — product engineering studio",
  description:
    "Product engineering studio building high-performance websites, platforms, and systems that convert, scale, and ship fast.",
  openGraph: {
    title: "clove — product engineering studio",
    description:
      "Product engineering studio building high-performance websites, platforms, and systems that convert, scale, and ship fast.",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${loveSans.variable} dark h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-background text-foreground font-sans">
        {children}
      </body>
    </html>
  );
}
