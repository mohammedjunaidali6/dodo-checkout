export type CheckoutError = {
  code: string;
  message: string;
};

export type CheckoutCloseReason =
  | "user"
  | "success"
  | "error";

export type CheckoutOptions = {
  productId: string;

  onSuccess?: (data: {
    sessionId: string;
  }) => void;

  onError?: (error: CheckoutError) => void;

  onClose?: (data: {
    reason: CheckoutCloseReason;
  }) => void;
};

type CheckoutMessage =
  | {
      type: "DODO_CHECKOUT";
      event: "success";
      sessionId: string;
    }
  | {
      type: "DODO_CHECKOUT";
      event: "error";
      code: string;
      message: string;
    }
  | {
      type: "DODO_CHECKOUT";
      event: "close";
      reason: CheckoutCloseReason;
    };

let iframe: HTMLIFrameElement | null = null;
let overlay: HTMLDivElement | null = null;

let removeMessageListener:
  | (() => void)
  | null = null;

let removeKeyListener:
  | (() => void)
  | null = null;

let removeResizeListener:
  | (() => void)
  | null = null;

let removeContentObserver:
  | (() => void)
  | null = null;

let previousBodyOverflow = "";

const CHECKOUT_URL =
  `${window.location.origin}/checkout`;


  // Resize iframe to match the actual checkout content.
 
function resizeIframe() {
  if (!iframe) {
    return;
  }

  try {
    const documentElement =
      iframe.contentDocument?.documentElement;

    const body =
      iframe.contentDocument?.body;

    if (!documentElement || !body) {
      return;
    }

    const contentHeight = Math.max(
      documentElement.scrollHeight,
      body.scrollHeight,
    );

    const maxHeight =
      window.innerHeight - 32;

    const height = Math.min(
      contentHeight,
      maxHeight,
    );

    iframe.style.height = `${height}px`;
  } catch {
    // Ignore iframe sizing errors.
  }
}

export const DodoCheckout = {
  open(options: CheckoutOptions) {
    // Prevent multiple checkout instances
    if (iframe) {
      return;
    }

    const checkoutUrl = new URL(
      CHECKOUT_URL,
    );

    checkoutUrl.searchParams.set(
      "productId",
      options.productId,
    );

    const checkoutOrigin =
      checkoutUrl.origin;
  
    // Overlay

    overlay =
      document.createElement("div");

    Object.assign(overlay.style, {
      position: "fixed",
      inset: "0",
      zIndex: "999999",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      padding: "16px",
      boxSizing: "border-box",
      background:
        "rgba(2, 6, 23, 0.72)",
      backdropFilter: "blur(6px)",
      WebkitBackdropFilter: "blur(6px)",
      overflow: "hidden",
    });

    overlay.setAttribute(
      "aria-label",
      "Dodo Checkout",
    );

    // Iframe

    iframe =
      document.createElement("iframe");

    iframe.src =
      checkoutUrl.toString();

    iframe.title =
      "Dodo Checkout";

    Object.assign(iframe.style, {
      width:
        "min(460px, calc(100vw - 32px))",

      height: "auto",

      maxHeight:
        "calc(100vh - 32px)",

      border: "0",

      borderRadius: "24px",

      background: "#ffffff",

      boxShadow:
        "0 25px 70px rgba(0, 0, 0, 0.45)",

      display: "block",

      boxSizing: "border-box",

      overflow: "hidden",
    });

    iframe.allow = "payment";

    iframe.setAttribute(
      "aria-label",
      "Dodo Checkout",
    );
  
    // Prevent background scrolling
  
    previousBodyOverflow =
      document.body.style.overflow;

    document.body.style.overflow =
      "hidden";

    // Add iframe to overlay

    overlay.appendChild(iframe);

    document.body.appendChild(
      overlay,
    );

    // Iframe loaded

    iframe.addEventListener(
      "load",
      () => {
        resizeIframe();

        iframe?.focus();

        // Watch checkout content changes.
        try {
          const body =
            iframe?.contentDocument?.body;

          const documentElement =
            iframe?.contentDocument
              ?.documentElement;

          if (
            !body ||
            !documentElement
          ) {
            return;
          }

          const observer =
            new ResizeObserver(() => {
              resizeIframe();
            });

          observer.observe(body);
          observer.observe(
            documentElement,
          );

          removeContentObserver =
            () => {
              observer.disconnect();
            };
        } catch {
          // Ignore observer errors.
        }
      },
      { once: true },
    );

    // Window resize

    const handleWindowResize =
      () => {
        resizeIframe();
      };

    window.addEventListener(
      "resize",
      handleWindowResize,
    );

    removeResizeListener =
      () => {
        window.removeEventListener(
          "resize",
          handleWindowResize,
        );
      };

    // Escape key

    const handleKeyDown = (
      event: KeyboardEvent,
    ) => {
      if (event.key !== "Escape") {
        return;
      }

      event.preventDefault();

      options.onClose?.({
        reason: "user",
      });

      destroy();
    };

    window.addEventListener(
      "keydown",
      handleKeyDown,
    );

    removeKeyListener =
      () => {
        window.removeEventListener(
          "keydown",
          handleKeyDown,
        );
      };

    // Backdrop click

    overlay.addEventListener(
      "click",
      (event) => {
        if (
          event.target !== overlay
        ) {
          return;
        }

        options.onClose?.({
          reason: "user",
        });

        destroy();
      },
    );

    // postMessage listener

    const handleMessage = (
      event: MessageEvent,
    ) => {
      // Security:
      // Only accept messages from our checkout.
      if (
        event.origin !==
        checkoutOrigin
      ) {
        return;
      }

      // Security:
      // Only accept messages from our iframe.
      if (
        event.source !==
        iframe?.contentWindow
      ) {
        return;
      }

      const message =
        event.data as CheckoutMessage;

      if (
        !message ||
        message.type !==
          "DODO_CHECKOUT"
      ) {
        return;
      }

      switch (message.event) {
        // -----------------------------------
        // Success
        

        case "success": {
          options.onSuccess?.({
            sessionId:
              message.sessionId,
          });

          destroy();

          break;
        }

        // Error

        case "error": {
          options.onError?.({
            code: message.code,
            message: message.message,
          });

          // Do NOT destroy checkout.
          // Customer can retry.

          // Error content may increase
          // checkout height.
          setTimeout(() => {
            resizeIframe();
          }, 0);

          break;
        }

        // Close

        case "close": {
          options.onClose?.({
            reason: message.reason,
          });

          destroy();

          break;
        }
      }
    };

    window.addEventListener(
      "message",
      handleMessage,
    );

    removeMessageListener =
      () => {
        window.removeEventListener(
          "message",
          handleMessage,
        );
      };
  },

  // Public close method

  close() {
    destroy();
  },
};

  // Completely remove checkout.

function destroy() {
  // Remove postMessage listener
  removeMessageListener?.();

  removeMessageListener = null;

  // Remove keyboard listener
  removeKeyListener?.();

  removeKeyListener = null;

  // Remove resize listener
  removeResizeListener?.();

  removeResizeListener = null;

  // Remove content observer
  removeContentObserver?.();

  removeContentObserver = null;

  // Restore body scrolling
  document.body.style.overflow =
    previousBodyOverflow;

  // Remove iframe
  iframe?.remove();

  iframe = null;

  // Remove overlay
  overlay?.remove();

  overlay = null;
}