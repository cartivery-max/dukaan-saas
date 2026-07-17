"use client";

import { useState } from "react";

type Product = {
  id: string;
  name: string;
  description: string | null;
  price: number;
  discount_price: number | null;
  stock_status: string;
  image_url: string | null;
};

type Store = {
  id: string;
  storename: string;
  display_name: string;
  whatsapp_number: string | null;
  whatsapp_message_template: string | null;
  banner_images: string[];
};

export default function StorefrontClient({
  store,
  products,
}: {
  store: Store;
  products: Product[];
}) {
  const [cart, setCart] = useState<Product[]>([]);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [customerName, setCustomerName] = useState("");
  const [customerPhone, setCustomerPhone] = useState("");
  const [customerAddress, setCustomerAddress] = useState("");
  const [customerZip, setCustomerZip] = useState("");

  function priceOf(p: Product) {
    return p.discount_price ?? p.price;
  }

  function addToCart(p: Product) {
    setCart((prev) => [...prev, p]);
    setDrawerOpen(true);
  }

  const total = cart.reduce((sum, p) => sum + priceOf(p), 0);

  function buildWhatsAppMessage() {
    const template =
      store.whatsapp_message_template ??
      "Hi {store_name}! I'd like to order:\n{items}\n\nTotal: {total}";

    const itemsText = cart
      .map((p) => `- ${p.name} (Rs. ${priceOf(p).toLocaleString()})`)
      .join("\n");

    return template
      .replaceAll("{store_name}", store.display_name)
      .replaceAll("{items}", itemsText)
      .replaceAll("{total}", `Rs. ${total.toLocaleString()}`)
      .replaceAll("{customer_name}", customerName || "-")
      .replaceAll("{customer_phone}", customerPhone || "-")
      .replaceAll("{customer_address}", customerAddress || "-")
      .replaceAll("{customer_zip}", customerZip || "-");
  }

  function sendToWhatsApp() {
    const message = buildWhatsAppMessage();
    const number = (store.whatsapp_number ?? "").replace(/[^0-9]/g, "");
    const url = `https://wa.me/${number}?text=${encodeURIComponent(message)}`;
    window.open(url, "_blank");
  }

  return (
    <div className="min-h-screen bg-bg">
      {/* Hero banner */}
      <div className="relative h-64 bg-gradient-to-br from-primary to-[#0d332c] flex items-center justify-center text-white text-center px-4">
        <div>
          <h1 className="font-display text-3xl font-black">{store.display_name}</h1>
        </div>
      </div>

      {/* Store header */}
      <div className="flex items-center justify-between px-6 py-4 bg-white">
        <div className="font-display font-black text-primary text-lg">
          {store.display_name}
        </div>
        <button
          onClick={() => setDrawerOpen(true)}
          className="bg-primary text-white text-sm font-bold px-4 py-2 rounded-full"
        >
          Cart ({cart.length})
        </button>
      </div>

      {/* Product grid */}
      <div className="px-6 py-6">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {products.map((p) => (
            <div key={p.id} className="bg-white rounded-2xl overflow-hidden shadow-sm">
              <div className="h-28 bg-gradient-to-br from-accent to-primary" />
              <div className="p-3">
                <p className="text-sm font-bold">{p.name}</p>
                <p className="text-sm text-primary font-bold mt-1">
                  {p.discount_price ? (
                    <>
                      <span className="line-through text-[#aaa] font-normal mr-1">
                        Rs. {p.price.toLocaleString()}
                      </span>
                      Rs. {p.discount_price.toLocaleString()}
                    </>
                  ) : (
                    <>Rs. {p.price.toLocaleString()}</>
                  )}
                </p>
                <button
                  onClick={() => addToCart(p)}
                  disabled={p.stock_status === "out_of_stock"}
                  className="w-full mt-2 bg-accent text-white text-xs font-bold py-2 rounded-lg disabled:opacity-40"
                >
                  {p.stock_status === "out_of_stock" ? "Out of stock" : "Add to cart"}
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Cart drawer */}
      {drawerOpen && (
        <div className="fixed inset-0 bg-black/40 z-50 flex justify-end">
          <div className="bg-white w-full max-w-sm h-full p-6 overflow-y-auto">
            <button onClick={() => setDrawerOpen(false)} className="text-[#999] mb-4">
              ✕
            </button>
            <h3 className="font-display text-xl font-bold mb-4">Your Order</h3>

            {cart.length === 0 ? (
              <p className="text-sm text-[#999]">Your cart is empty.</p>
            ) : (
              <>
                {cart.map((p, i) => (
                  <div key={i} className="flex justify-between text-sm py-2 border-b">
                    <span>{p.name}</span>
                    <span>Rs. {priceOf(p).toLocaleString()}</span>
                  </div>
                ))}
                <div className="flex justify-between font-bold mt-3 mb-5">
                  <span>Total</span>
                  <span>Rs. {total.toLocaleString()}</span>
                </div>

                <div className="space-y-3 mb-4">
                  <input
                    placeholder="Your name"
                    className="w-full px-3 py-2 border rounded-lg text-sm"
                    value={customerName}
                    onChange={(e) => setCustomerName(e.target.value)}
                  />
                  <input
                    placeholder="Phone number"
                    className="w-full px-3 py-2 border rounded-lg text-sm"
                    value={customerPhone}
                    onChange={(e) => setCustomerPhone(e.target.value)}
                  />
                  <input
                    placeholder="Delivery address"
                    className="w-full px-3 py-2 border rounded-lg text-sm"
                    value={customerAddress}
                    onChange={(e) => setCustomerAddress(e.target.value)}
                  />
                  <input
                    placeholder="Zip / postal code"
                    className="w-full px-3 py-2 border rounded-lg text-sm"
                    value={customerZip}
                    onChange={(e) => setCustomerZip(e.target.value)}
                  />
                </div>

                <button
                  onClick={sendToWhatsApp}
                  className="w-full bg-[#25D366] text-white font-bold py-3 rounded-lg"
                >
                  Send Order via WhatsApp
                </button>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
