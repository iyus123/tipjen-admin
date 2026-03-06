import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { getServiceSupabase } from "@/lib/supabase-server";
import { env } from "@/lib/env";
import { ThemeToggle } from "@/components/theme-toggle";
import DashboardClient from "@/components/dashboard-client";

export default async function DashboardPage() {
  const token = cookies().get("tipjen_admin_session")?.value;
  if (token !== env.adminPassword) redirect("/");

  const supabase = getServiceSupabase();
  const [{ data: products }, { data: labels }] = await Promise.all([
    supabase.from("products").select("*").order("updated_at", { ascending: false }),
    supabase.from("product_labels").select("*").order("name"),
  ]);

  return (
    <main className="min-h-screen bg-brand-cream p-4 dark:bg-slate-950 md:p-6">
      <div className="mx-auto max-w-7xl">
        <div className="mb-6 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="text-sm font-medium text-[#8b6758] dark:text-amber-200">Tipjen Admin</p>
            <h1 className="mt-1 text-3xl font-bold">Kelola produk dan sinkron buyer</h1>
          </div>
          <div className="flex items-center gap-3">
            <form action="/api/logout" method="post">
              <button className="rounded-2xl border border-stone-200 bg-white px-4 py-2 text-sm font-medium text-stone-700 hover:bg-stone-50 dark:border-white/10 dark:bg-white/5 dark:text-white dark:hover:bg-white/10">Keluar</button>
            </form>
            <ThemeToggle />
          </div>
        </div>
        <DashboardClient initialProducts={products ?? []} initialLabels={labels ?? []} />
      </div>
    </main>
  );
}
