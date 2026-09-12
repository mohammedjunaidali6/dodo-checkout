export type PaymentResult =
  | {
      status: "success";
      sessionId: string;
    }
  | {
      status: "declined";
      code: "CARD_DECLINED";
      message: string;
    }
  | {
      status: "failed";
      code: "PAYMENT_FAILED";
      message: string;
    };

const failedOnceCards = new Set<string>();

export async function processPayment(
  cardNumber: string,
): Promise<PaymentResult> {
  await new Promise((resolve) => setTimeout(resolve, 1500));

  const normalizedCard = cardNumber.replace(/\s/g, "");

  // Successful payment
  if (normalizedCard === "4242424242424242") {
    return {
      status: "success",
      sessionId: `sess_${crypto.randomUUID()}`,
    };
  }

  // Declined payment
  if (normalizedCard === "4000000000000002") {
    return {
      status: "declined",
      code: "CARD_DECLINED",
      message: "Your card was declined. Please try another card.",
    };
  }

  // Fail once, then succeed
  if (normalizedCard === "4000000000000341") {
    if (!failedOnceCards.has(normalizedCard)) {
      failedOnceCards.add(normalizedCard);

      return {
        status: "failed",
        code: "PAYMENT_FAILED",
        message:
          "We couldn't complete the payment. Please try again.",
      };
    }

    return {
      status: "success",
      sessionId: `sess_${crypto.randomUUID()}`,
    };
  }

  return {
    status: "declined",
    code: "CARD_DECLINED",
    message: "Please use one of the provided test cards.",
  };
}