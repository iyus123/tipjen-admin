import "./globals.css";
import Script from "next/script";
import { themeScript } from "@/lib/theme-script";

export const metadata = {
  title: "Tipjen Admin",
  description: "Dashboard admin Tipjen",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="id" suppressHydrationWarning>
      <body>
        <Script id="theme-script" strategy="beforeInteractive">{themeScript}</Script>
        {children}
      </body>
    </html>
  );
}
