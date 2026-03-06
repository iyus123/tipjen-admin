import "./globals.css";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Tipjen Admin",
  description: "Web admin penjual Tipjen",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="id">
      <body>
        <div className="container page-shell">{children}</div>
      </body>
    </html>
  );
}
