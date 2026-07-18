import { createClient } from "@/lib/supabase/server";

export default async function OrdersPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data: store } = await supabase
    .from("stores")
    .select("id")
    .eq("owner_id", user!.id)
    .single();

  const { data: orders } = await supabase
    .from("orders")
    .select("*, order_items(*)")
    .eq("store_id", store?.id)
    .order("created_at", { ascending: false });

  return (
    <div>
      <h1 className="font-display text-2xl font-black text-ink mb-6">Orders</h1>

      {!orders || orders.length === 0 ? (
        <div className="bg-white rounded-2xl p-6 text-sm text-[#7d7a70]">
          No orders yet. Once a customer checks out on your storefront, it'll show up here.
        </div>
      ) : (
        <div className="bg-white rounded-2xl divide-y divide-[#f1efe8]">
          {orders.map((order) => (
            <div key={order.id} className="p-4 flex justify-between items-start">
              <div>
                <div className="font-bold text-sm">{order.customer_name}</div>
                <div className="text-xs text-[#7d7a70] mt-0.5">
                  {order.customer_phone}
                  {order.customer_address ? ` · ${order.customer_address}` : ""}
                  {order.customer_zip ? `, ${order.customer_zip}` : ""}
                </div>
                <div className="text-xs text-[#7d7a70] mt-1">
                  {order.order_items?.length ?? 0} item(s) ·{" "}
                  {new Date(order.created_at).toLocaleString("en-PK", {
                    dateStyle: "medium",
                    timeStyle: "short",
                  })}
                </div>
              </div>
              <div className="text-right">
                <div className="font-bold text-primary">
                  Rs. {Number(order.total).toLocaleString()}
                </div>
                <span className="text-[10px] font-bold uppercase tracking-wide text-[#7d7a70]">
                  {order.status}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
