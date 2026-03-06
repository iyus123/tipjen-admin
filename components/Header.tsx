import Link from "next/link";

export function Header({
  title,
  subtitle,
  current,
}: {
  title: string;
  subtitle: string;
  current: "shop" | "admin";
}) {
  return (
    <header className="topbar">
      <div className="container topbar-inner">
        <div className="brand">
          <h1>{title}</h1>
          <p>{subtitle}</p>
        </div>
        <nav className="nav-links">
          <Link href="/shop" className={`nav-link ${current === "shop" ? "active" : ""}`}>
            Halaman Pembeli
          </Link>
          <Link href="/admin" className={`nav-link ${current === "admin" ? "active" : ""}`}>
            Halaman Penjual
          </Link>
        </nav>
      </div>
    </header>
  );
}
