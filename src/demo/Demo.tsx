import { useState } from "react";
import { DodoCheckout } from "../sdk/dodo-checkout";

type EventLog = {
  id: number;
  type: "opened" | "success" | "error" | "close";
  message: string;
  time: string;
};

const PRODUCT_ID = "prod_pro";

function getTime() {
  return new Date().toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  });
}

export default function Demo() {
  const [events, setEvents] = useState<EventLog[]>([]);
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);

  const addEvent = (
    type: EventLog["type"],
    message: string,
  ) => {
    setEvents((currentEvents) => [
      {
        id: Date.now(),
        type,
        message,
        time: getTime(),
      },
      ...currentEvents,
    ]);
  };

  const handleBuy = () => {
    setIsCheckoutOpen(true);

    addEvent(
      "opened",
      "Checkout opened",
    );

    DodoCheckout.open({
      productId: PRODUCT_ID,

      onSuccess: ({ sessionId }) => {
        setIsCheckoutOpen(false);

        addEvent(
          "success",
          `Payment successful · ${sessionId}`,
        );
      },

      onError: ({ code, message }) => {
        addEvent(
          "error",
          `${code} · ${message}`,
        );
      },

      onClose: ({ reason }) => {
        setIsCheckoutOpen(false);

        addEvent(
          "close",
          `Checkout closed · reason: ${reason}`,
        );
      },
    });
  };

  const handleClearEvents = () => {
    setEvents([]);
  };

  return (
    <main className="min-h-screen bg-slate-950 text-white">
      <div className="mx-auto max-w-6xl px-5 py-10 sm:px-8 lg:py-16">
        {/* Header */}
        <header className="flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white text-sm font-black text-slate-950">
                D
              </div>

              <span className="text-sm font-semibold text-slate-300">
                Dodo Store
              </span>
            </div>

            <h1 className="mt-8 max-w-2xl text-4xl font-bold tracking-tight sm:text-5xl">
              Simple checkout for your digital product.
            </h1>

            <p className="mt-4 max-w-xl text-base leading-7 text-slate-400">
              This demo shows how a merchant can open Dodo Checkout
              and receive payment events through the SDK.
            </p>
          </div>

          <div className="rounded-full border border-emerald-400/20 bg-emerald-400/10 px-4 py-2 text-xs font-semibold text-emerald-300">
            SDK Demo
          </div>
        </header>

        {/* Main content */}
        <div className="mt-12 grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
          {/* Product card */}
          <section className="overflow-hidden rounded-3xl border border-white/10 bg-white/[0.04]">
            <div className="border-b border-white/10 p-7 sm:p-9">
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">
                Featured plan
              </p>

              <div className="mt-5 flex flex-col gap-8 sm:flex-row sm:items-end sm:justify-between">
                <div>
                  <h2 className="text-3xl font-bold tracking-tight">
                    Pro Plan
                  </h2>

                  <p className="mt-3 max-w-lg text-sm leading-6 text-slate-400">
                    Everything you need to launch, manage, and
                    grow your digital business.
                  </p>
                </div>

                <div className="sm:text-right">
                  <p className="text-4xl font-bold">
                    $29
                  </p>

                  <p className="mt-1 text-sm text-slate-500">
                    per month
                  </p>
                </div>
              </div>
            </div>

            <div className="grid gap-4 p-7 sm:grid-cols-3 sm:p-9">
              <Feature
                title="Global payments"
                description="Accept payments from customers worldwide."
              />

              <Feature
                title="Subscriptions"
                description="Simple recurring billing for your customers."
              />

              <Feature
                title="Secure checkout"
                description="Payment details stay inside checkout."
              />
            </div>

            <div className="border-t border-white/10 p-7 sm:p-9">
              <button
                type="button"
                onClick={handleBuy}
                disabled={isCheckoutOpen}
                className="w-full rounded-xl bg-white px-6 py-4 text-sm font-bold text-slate-950 shadow-xl shadow-black/20 transition hover:-translate-y-0.5 hover:bg-slate-100 focus:outline-none focus:ring-4 focus:ring-white/20 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {isCheckoutOpen
                  ? "Checkout is open…"
                  : "Buy Pro — $29/month"}
              </button>

              <p className="mt-4 text-center text-xs text-slate-500">
                Secure payment powered by Dodo Payments
              </p>
            </div>
          </section>

          {/* Event panel */}
          <section className="rounded-3xl border border-white/10 bg-white/[0.04]">
            <div className="flex items-center justify-between border-b border-white/10 px-6 py-5">
              <div>
                <h2 className="text-sm font-bold">
                  Checkout events
                </h2>

                <p className="mt-1 text-xs text-slate-500">
                  SDK callback activity
                </p>
              </div>

              <button
                type="button"
                onClick={handleClearEvents}
                disabled={events.length === 0}
                className="rounded-lg px-3 py-2 text-xs font-semibold text-slate-400 transition hover:bg-white/10 hover:text-white disabled:cursor-not-allowed disabled:opacity-30"
              >
                Clear
              </button>
            </div>

            <div className="min-h-[420px] p-4">
              {events.length === 0 ? (
                <div className="flex min-h-[380px] items-center justify-center rounded-2xl border border-dashed border-white/10 px-6 text-center">
                  <div>
                    <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-white/5 text-xl">
                      ⌁
                    </div>

                    <p className="mt-4 text-sm font-semibold text-slate-300">
                      No events yet
                    </p>

                    <p className="mt-2 text-xs leading-5 text-slate-500">
                      Click “Buy Pro” to open checkout and
                      see SDK callbacks here.
                    </p>
                  </div>
                </div>
              ) : (
                <div className="space-y-2">
                  {events.map((event) => (
                    <div
                      key={event.id}
                      className="rounded-2xl border border-white/10 bg-black/20 p-4"
                    >
                      <div className="flex items-center justify-between gap-3">
                        <span
                          className={`rounded-full px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider ${getEventBadgeClass(
                            event.type,
                          )}`}
                        >
                          {event.type}
                        </span>

                        <span className="font-mono text-[10px] text-slate-600">
                          {event.time}
                        </span>
                      </div>

                      <p className="mt-3 break-words text-xs leading-5 text-slate-400">
                        {event.message}
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </section>
        </div>

        {/* Technical note */}
        <footer className="mt-8 rounded-2xl border border-white/10 bg-white/[0.03] p-5">
          <p className="text-xs leading-5 text-slate-500">
            <span className="font-semibold text-slate-300">
              Integration:
            </span>{" "}
            The merchant calls{" "}
            <code className="font-mono text-slate-300">
              DodoCheckout.open()
            </code>
            . The SDK creates the checkout iframe and exposes
            success, error, and close callbacks.
          </p>
        </footer>
      </div>
    </main>
  );
}

function Feature({
  title,
  description,
}: {
  title: string;
  description: string;
}) {
  return (
    <div className="rounded-2xl border border-white/10 bg-black/10 p-5">
      <div className="h-2 w-2 rounded-full bg-emerald-400" />

      <h3 className="mt-4 text-sm font-semibold">
        {title}
      </h3>

      <p className="mt-2 text-xs leading-5 text-slate-500">
        {description}
      </p>
    </div>
  );
}

function getEventBadgeClass(
  type: EventLog["type"],
) {
  switch (type) {
    case "success":
      return "bg-emerald-400/10 text-emerald-300";

    case "error":
      return "bg-red-400/10 text-red-300";

    case "close":
      return "bg-amber-400/10 text-amber-300";

    default:
      return "bg-sky-400/10 text-sky-300";
  }
}