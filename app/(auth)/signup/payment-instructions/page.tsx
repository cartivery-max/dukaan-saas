export default function PaymentInstructionsPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-bg px-4">
      <div className="w-full max-w-md bg-white border border-[#e9e5d9] rounded-2xl p-8 text-center">
        <div className="inline-block bg-[#fbeed8] text-[#b9791f] text-xs font-bold px-3 py-1.5 rounded-full mb-4">
          Awaiting payment
        </div>
        <h1 className="font-display text-2xl font-black text-ink mb-2">
          One last step
        </h1>
        <p className="text-sm text-[#7d7a70] mb-6">
          Your store is saved but not live yet. Pay Rs. 1,000 to activate it for one year.
        </p>

        <div className="bg-[#fbfaf7] border border-[#e3e0d6] rounded-xl p-5 text-left mb-6">
          <div className="text-xs font-bold text-[#555] mb-1">Pay via JazzCash / EasyPaisa</div>
          <div className="font-display text-lg font-bold text-primary mb-3">0300 1234567</div>
          <div className="text-xs font-bold text-[#555] mb-1">Reference code</div>
          <div className="font-mono text-sm bg-white border border-[#e3e0d6] rounded-lg px-3 py-2">
            REF-{Math.random().toString(36).slice(2, 8).toUpperCase()}
          </div>
        </div>

        <p className="text-xs text-[#7d7a70] mb-4">
          After paying, send a screenshot of the payment along with this reference code
          to our WhatsApp number below. Your store is usually activated within a few hours.
        </p>

        <a
          href="https://wa.me/923001234567"
          className="block w-full bg-[#25D366] text-white font-bold text-sm rounded-lg py-3"
        >
          Send payment proof on WhatsApp
        </a>
      </div>
    </div>
  );
}
