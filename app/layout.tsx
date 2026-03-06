import "./globals.css";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "WA Shop Starter",
  description: "Katalog jualan dengan halaman penjual dan pembeli yang terhubung.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="id">
      <body>{children}</body>
    </html>
  );
}
