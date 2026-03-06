import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { ThemeToggle } from "@/components/theme-toggle";
import LoginForm from "@/components/login-form";
import { env } from "@/lib/env";

export default function HomePage() {
  const token = cookies().get("tipjen_admin_session")?.value;
  if (token === env.adminPassword) {
    redirect("/dashboard");
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-brand-cream px-4 dark:bg-slate-950">
      <div className="absolute right-4 top-4"><ThemeToggle /></div>
      <div className="w-full max-w-md rounded-[32px] border border-brand-sand bg-white p-8 shadow-soft dark:border-white/10 dark:bg-white/5">
        <div className="mb-6">
          <p className="text-sm font-medium text-[#8b6758] dark:text-amber-200">Tipjen Admin</p>
          <h1 className="mt-2 text-3xl font-bold">Masuk ke dashboard</h1>
          <p className="mt-2 text-sm text-[#84685c] dark:text-slate-300">Kelola produk, label, gambar, dan status tampil buyer dari sini.</p>
        </div>
        <LoginForm />
      </div>
    </main>
  );
}
