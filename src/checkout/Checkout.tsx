import { useState, type FormEvent } from "react";
import { processPayment } from "./payment";
import { LockKeyhole } from "lucide-react";

type CheckoutProps = {
  productId: string;
};

type CheckoutState = "idle" | "processing" | "error" | "success";

function sendMessage(message: Record<string, unknown>) {
  window.parent.postMessage(
  {
    type: "DODO_CHECKOUT",
    ...message,
  },
  window.location.origin,
);
}

export default function Checkout({}: CheckoutProps) {
  const [email, setEmail] = useState("");
  const [cardNumber, setCardNumber] = useState("");
  const [expiry, setExpiry] = useState("");
  const [cvc, setCvc] = useState("");

  const [state, setState] = useState<CheckoutState>("idle");
  const [error, setError] = useState("");
  const [sessionId, setSessionId] = useState("");

  const isProcessing = state === "processing";

  const formatCardNumber = (value: string) => {
    const numbersOnly = value.replace(/\D/g, "").slice(0, 16);

    return numbersOnly.replace(/(\d{4})(?=\d)/g, "$1 ");
  };

  const formatExpiry = (value: string) => {
    const numbersOnly = value.replace(/\D/g, "").slice(0, 4);

    if (numbersOnly.length <= 2) {
      return numbersOnly;
    }

    return `${numbersOnly.slice(0, 2)}/${numbersOnly.slice(2)}`;
  };

  const handleCardChange = (value: string) => {
    setCardNumber(formatCardNumber(value));
  };

  const handleExpiryChange = (value: string) => {
    setExpiry(formatExpiry(value));
  };

  const validateForm = () => {
    if (!email.trim()) {
      return "Enter your email address.";
    }

    if (!email.includes("@")) {
      return "Enter a valid email address.";
    }

    const cleanCard = cardNumber.replace(/\s/g, "");

    if (cleanCard.length !== 16) {
      return "Enter a valid 16-digit card number.";
    }

    if (expiry.length !== 5) {
      return "Enter your card expiry date.";
    }

    if (cvc.length !== 3) {
      return "Enter your 3-digit CVC.";
    }

    return "";
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (isProcessing) {
      return;
    }

    setError("");

    const validationError = validateForm();

    if (validationError) {
      setError(validationError);
      return;
    }

    setState("processing");

    const result = await processPayment(cardNumber);

    if (result.status === "success") {
      setSessionId(result.sessionId);
      setState("success");

      sendMessage({
        event: "success",
        sessionId: result.sessionId,
      });

      return;
    }

    setState("error");
    setError(result.message);

    sendMessage({
      event: "error",
      code: result.code,
      message: result.message,
    });
  };

  const handleClose = () => {
    if (isProcessing) {
      return;
    }

    sendMessage({
      event: "close",
      reason: state === "success" ? "success" : "user",
    });
  };

  if (state === "success") {
    return (
      <main className="min-h-screen bg-slate-950 px-4 py-8 text-slate-950">
        <div className="mx-auto flex min-h-[calc(100vh-4rem)] max-w-md items-center justify-center">
          <section className="w-full rounded-3xl bg-white p-8 text-center shadow-2xl shadow-black/30">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-emerald-100">
              <span className="text-3xl text-emerald-600">✓</span>
            </div>

            <p className="mt-6 text-sm font-semibold uppercase tracking-[0.18em] text-emerald-600">
              Payment complete
            </p>

            <h1 className="mt-2 text-3xl font-bold tracking-tight text-slate-950">
              You're all set
            </h1>

            <p className="mt-3 text-sm leading-6 text-slate-500">
              Your payment was successfully processed. You can safely close
              this checkout.
            </p>

            <div className="mt-6 rounded-2xl bg-slate-50 p-4 text-left">
              <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                Session ID
              </p>

              <p className="mt-2 break-all font-mono text-sm text-slate-700">
                {sessionId}
              </p>
            </div>

            <button
              type="button"
              onClick={handleClose}
              className="mt-6 w-full rounded-xl bg-slate-950 px-5 py-3.5 text-sm font-semibold text-white transition hover:bg-slate-800 focus:outline-none focus:ring-4 focus:ring-slate-200"
            >
              Done
            </button>

            <p className="mt-5 text-xs text-slate-400">
              Powered by Dodo Payments
            </p>
          </section>
        </div>
      </main>
    );
  }

  return (
    <main className="bg-white p-0 text-slate-950">
      <div className="mx-auto flex max-w-md items-center justify-center">
        <section className="w-full overflow-hidden rounded-3xl bg-white">
          {/* Header */}
          <header className="flex items-center justify-between border-b border-slate-100 px-5 py-4">
            <div className="flex items-center gap-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-slate-950 text-sm font-bold text-white">
                D
              </div>

              <div>
                <p className="text-sm font-bold text-slate-950">
                  Dodo Checkout
                </p>

                <p className="text-xs text-slate-400">Secure payment</p>
              </div>
            </div>

            <button
              type="button"
              onClick={handleClose}
              disabled={isProcessing}
              aria-label="Close checkout"
              className="flex h-9 w-9 items-center justify-center rounded-full text-xl text-slate-400 transition hover:bg-slate-100 hover:text-slate-700 disabled:cursor-not-allowed disabled:opacity-40"
            >
              ×
            </button>
          </header>

          <div className="p-4 sm:p-5">
            {/* Product */}
            <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-400">
                    Your purchase
                  </p>

                  <h1 className="mt-2 text-xl font-bold tracking-tight text-slate-950">
                    Pro Plan
                  </h1>

                  <p className="mt-1 text-sm text-slate-500">
                    Everything you need to get started.
                  </p>
                </div>

                <div className="text-right">
                  <p className="text-xl font-bold text-slate-950">$29.00</p>

                  <p className="text-xs text-slate-400">/ month</p>
                </div>
              </div>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="mt-4 space-y-3.5">
              {/* Email */}
              <div>
                <label
                  htmlFor="email"
                  className="mb-1.5 block text-sm font-semibold text-slate-800"
                >
                  Email
                </label>

                <input
                  id="email"
                  type="email"
                  autoComplete="email"
                  placeholder="you@example.com"
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  disabled={isProcessing}
                  className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-950 outline-none transition placeholder:text-slate-400 focus:border-slate-950 focus:ring-4 focus:ring-slate-100 disabled:bg-slate-50"
                />
              </div>

              {/* Card number */}
              <div>
                <label
                  htmlFor="card-number"
                  className="mb-1.5 block text-sm font-semibold text-slate-800"
                >
                  Card number
                </label>

                <input
                  id="card-number"
                  type="text"
                  inputMode="numeric"
                  autoComplete="cc-number"
                  placeholder="4242 4242 4242 4242"
                  value={cardNumber}
                  onChange={(event) => handleCardChange(event.target.value)}
                  disabled={isProcessing}
                  className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-950 outline-none transition placeholder:text-slate-400 focus:border-slate-950 focus:ring-4 focus:ring-slate-100 disabled:bg-slate-50"
                />
              </div>

              {/* Expiry + CVC */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label
                    htmlFor="expiry"
                    className="mb-1.5 block text-sm font-semibold text-slate-800"
                  >
                    Expiry
                  </label>

                  <input
                    id="expiry"
                    type="text"
                    inputMode="numeric"
                    autoComplete="cc-exp"
                    placeholder="MM/YY"
                    value={expiry}
                    onChange={(event) => handleExpiryChange(event.target.value)}
                    disabled={isProcessing}
                    className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-950 outline-none transition placeholder:text-slate-400 focus:border-slate-950 focus:ring-4 focus:ring-slate-100 disabled:bg-slate-50"
                  />
                </div>

                <div>
                  <label
                    htmlFor="cvc"
                    className="mb-1.5 block text-sm font-semibold text-slate-800"
                  >
                    CVC
                  </label>

                  <input
                    id="cvc"
                    type="password"
                    inputMode="numeric"
                    autoComplete="cc-csc"
                    maxLength={3}
                    placeholder="123"
                    value={cvc}
                    onChange={(event) =>
                      setCvc(event.target.value.replace(/\D/g, ""))
                    }
                    disabled={isProcessing}
                    className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-950 outline-none transition placeholder:text-slate-400 focus:border-slate-950 focus:ring-4 focus:ring-slate-100 disabled:bg-slate-50"
                  />
                </div>
              </div>

              {/* Error */}
              {error && (
                <div
                  role="alert"
                  className="rounded-xl border border-red-200 bg-red-50 p-4"
                >
                  <div className="flex gap-3">
                    <span className="mt-0.5 text-red-500">!</span>

                    <div>
                      <p className="text-sm font-semibold text-red-800">
                        Payment couldn't be completed
                      </p>

                      <p className="mt-1 text-sm leading-5 text-red-700">
                        {error}
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* Pay */}
              <button
                type="submit"
                disabled={isProcessing}
                className="flex w-full items-center justify-center gap-2 rounded-xl bg-slate-950 px-5 py-3.5 text-sm font-bold text-white shadow-lg shadow-slate-950/15 transition hover:-translate-y-0.5 hover:bg-slate-800 focus:outline-none focus:ring-4 focus:ring-slate-200 disabled:cursor-not-allowed disabled:translate-y-0 disabled:opacity-70"
              >
                {isProcessing ? (
                  <>
                    <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                    Processing payment…
                  </>
                ) : (
                  "Pay $29.00"
                )}
              </button>

              {/* Security note */}
              <div className="flex items-center justify-center gap-2 text-sm text-slate-400">
                <LockKeyhole size={14} strokeWidth={2} />
                <span>Your card details stay inside checkout.</span>
              </div>
            </form>
          </div>
        </section>
      </div>
    </main>
  );
}