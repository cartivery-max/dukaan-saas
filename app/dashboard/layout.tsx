import { createClient } from "@/lib/supabase/server";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data: store } = user
    ? await supabase.from("stores").select("*").eq("owner_id", user.id).single()
    : { data: null };

  return (
    <div className="min-h-screen flex flex-col md:flex-row bg-bg">
      <aside className="bg-[#12332d] text-[#e8e8e0] p-5 md:w-56 flex md:flex-col gap-1 flex-wrap">
        <div className="font-display font-black text-lg text-white w-full mb-2">
          {store?.display_name ?? "My Store"}
        </div>
        <a href="/dashboard" className="text-sm font-semibold px-3 py-2 rounded-lg hover:bg-white/10">
          Overview
        </a>
        <a href="/dashboard/products" className="text-sm font-semibold px-3 py-2 rounded-lg hover:bg-white/10">
          Products
        </a>
        <a href="/dashboard/settings" className="text-sm font-semibold px-3 py-2 rounded-lg hover:bg-white/10">
          Store Settings
        </a>
        <a href="/dashboard/orders" className="text-sm font-semibold px-3 py-2 rounded-lg hover:bg-white/10">
          Orders
        </a>
      </aside>
      <main className="flex-1 p-6 md:p-8">{children}</main>
    </div>
  );
}
