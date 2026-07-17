export default function Home() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-bg px-4 text-center">
      <div>
        <h1 className="font-display text-4xl font-black text-ink mb-3">
          Your own online store, <span className="text-primary">live in minutes</span>
        </h1>
        <p className="text-[#7d7a70] mb-6 max-w-md mx-auto">
          Rs. 1,000/year · WhatsApp checkout · No coding needed
        </p>
        <div className="flex gap-3 justify-center">
          <a href="/signup" className="bg-primary text-white font-bold px-6 py-3 rounded-xl">
            Create your store
          </a>
          <a href="/login" className="border border-[#e9e5d9] font-bold px-6 py-3 rounded-xl">
            Log in
          </a>
        </div>
        <p className="text-xs text-[#999] mt-6">
          This is a placeholder — swap in the full marketing landing page next.
        </p>
      </div>
    </div>
  );
}
