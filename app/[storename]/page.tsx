import { createClient } from "@/lib/supabase/server";
import StorefrontClient from "@/components/StorefrontClient";

export default async function StorefrontPage({
  params,
}: {
  params: Promise<{ storename: string }>;
}) {
  const { storename } = await params;
  const supabase = await createClient();

  const { data: store } = await supabase
    .from("stores")
    .select("*")
    .eq("storename", storename)
    .eq("status", "active")
    .single();

  if (!store) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-bg px-4">
        <div className="text-center">
          <h1 className="font-display text-2xl font-black text-ink mb-2">
            Store not available
          </h1>
          <p className="text-sm text-[#7d7a70]">
            This store doesn&apos;t exist or isn&apos;t active yet.
          </p>
        </div>
      </div>
    );
  }

  const { data: products } = await supabase
    .from("products")
    .select("*")
    .eq("store_id", store.id)
    .order("created_at", { ascending: false });

  return <StorefrontClient store={store} products={products ?? []} />;
}
