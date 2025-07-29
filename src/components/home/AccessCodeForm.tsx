import React, { useState } from "react";
import toast from "react-hot-toast";

function AccessCodeForm({ onSuccess }: { onSuccess: () => void }) {
  const [code, setCode] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    if (code === process.env.NEXT_PUBLIC_MAMUN_ACCESS_CODE) {
      onSuccess();
      setLoading(false);
      toast.success("Access Granted");
    } else {
      setError("Invalid Access Code");
      setLoading(false);
    }
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-(--charcoal-black) px-5 text-center text-(--mist-white)">
      <h1 className="mb-6 text-3xl font-bold">Enter Access Code</h1>

      <form
        onSubmit={handleSubmit}
        className="flex w-full max-w-sm flex-col gap-4"
      >
        <input
          type="password"
          placeholder="Access Code"
          value={code}
          onChange={(e) => setCode(e.target.value)}
          className="rounded border border-white/20 bg-transparent px-4 py-3 text-white placeholder-white/40 focus:ring-2 focus:ring-white/50 focus:outline-none"
          required
        />
        <button
          type="submit"
          disabled={loading}
          className="rounded bg-(--mist-white) py-3 font-semibold text-(--charcoal-black) hover:bg-white disabled:opacity-50"
        >
          {loading ? "Checking..." : "Submit"}
        </button>
        {error && <p className="mt-2 text-sm text-red-500">{error}</p>}
      </form>
      <p className="mt-10 text-lg font-semibold">
        (We&apos;re building something great right now. Thanks for your
        patience)
      </p>
    </div>
  );
}

export default AccessCodeForm;
