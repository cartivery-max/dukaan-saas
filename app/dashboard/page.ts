import { createClient } from "@/lib/supabase/server";

export default async function DashboardOverview() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data: store } = await supabase
    .from("stores")
    .select("*")
    .eq("owner_id", user!.id)
    .single();

  const statusStyles: Record<string, string> = {
    active: "bg-[#e3f3e9] text-[#2e7d4f]",
    pending_payment: "bg-[#fbeed8] text-[#b9791f]",
    expired: "bg-[#f6e2e2] text-[#c14545]",
  };

  const statusLabel: Record<string, string> = {
    active: "Store Active",
    pending_payment: "Awaiting Payment",
    expired: "Expired",
  };

  const { data: orders } = await supabase
    .from("orders")
    .select("total")
    .eq("store_id", store?.id);

  const { count: productCount } = await supabase
    .from("products")
    .select("*", { count: "exact", head: true })
    .eq("store_id", store?.id);

  const orderCount = orders?.length ?? 0;
  const revenue = orders?.reduce((sum, o) => sum + Number(o.total), 0) ?? 0;

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="font-display text-2xl font-black text-ink">Overview</h1>
        <span className={`text-xs font-bold px-3 py-1.5 rounded-full ${statusStyles[store?.status ?? "pending_payment"]}`}>
          {statusLabel[store?.status ?? "pending_payment"]}
        </span>
      </div>

      {store?.status !== "active" && (
        <div className="bg-[#fbeed8] border border-[#f0d9ae] rounded-xl p-4 mb-6 text-sm">
          Your store isn&apos;t live yet. Complete payment to activate{" "}
          <b>yoursaas.com/{store?.storename}</b>.
        </div>
      )}

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-2xl p-5">
          <div className="font-display text-2xl font-black text-primary">{orderCount}</div>
          <div className="text-xs text-[#7d7a70] font-semibold mt-1">Orders total</div>
        </div>
        <div className="bg-white rounded-2xl p-5">
          <div className="font-display text-2xl font-black text-primary">
            Rs. {revenue.toLocaleString()}
          </div>
          <div className="text-xs text-[#7d7a70] font-semibold mt-1">Revenue total</div>
        </div>
        <div className="bg-white rounded-2xl p-5">
          <div className="font-display text-2xl font-black text-primary">{productCount ?? 0}</div>
          <div className="text-xs text-[#7d7a70] font-semibold mt-1">Products live</div>
        </div>
        <div className="bg-white rounded-2xl p-5">
          <div className="font-display text-2xl font-black text-primary">—</div>
          <div className="text-xs text-[#7d7a70] font-semibold mt-1">Store visits</div>
        </div>
      </div>
    </div>
  );
}
