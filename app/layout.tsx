import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Dukaan — Build your online store in minutes",
  description: "Create your own online store with WhatsApp checkout. Rs. 1,000/year.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="font-body">{children}</body>
    </html>
  );
}
