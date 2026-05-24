import { httpRouter } from "convex/server";
import { httpAction } from "./_generated/server";
import { internal } from "./_generated/api";

async function verifyStripeSignature(
  payload: string,
  sigHeader: string,
  secret: string,
): Promise<boolean> {
  const parts = sigHeader.split(",");
  const timestamp = parts.find((p) => p.startsWith("t="))?.slice(2);
  const signatures = parts
    .filter((p) => p.startsWith("v1="))
    .map((p) => p.slice(3));

  if (!timestamp || signatures.length === 0) return false;

  const signedPayload = `${timestamp}.${payload}`;
  const encoder = new TextEncoder();

  const key = await crypto.subtle.importKey(
    "raw",
    encoder.encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"],
  );

  const signatureBytes = await crypto.subtle.sign(
    "HMAC",
    key,
    encoder.encode(signedPayload),
  );

  const computedSig = Array.from(new Uint8Array(signatureBytes))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");

  return signatures.some((sig) => sig === computedSig);
}

const http = httpRouter();

http.route({
  path: "/stripe/webhook",
  method: "POST",
  handler: httpAction(async (ctx, request) => {
    const sig = request.headers.get("stripe-signature");
    const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

    if (!sig || !webhookSecret) {
      return new Response("Missing signature or webhook secret", { status: 400 });
    }

    const body = await request.text();

    const isValid = await verifyStripeSignature(body, sig, webhookSecret);
    if (!isValid) {
      return new Response("Invalid signature", { status: 400 });
    }

    const event = JSON.parse(body) as {
      type: string;
      data: {
        object: {
          id: string;
          payment_status?: string;
          payment_intent?: string;
          customer_email?: string | null;
          amount_total?: number | null;
          metadata?: Record<string, string>;
        };
      };
    };

    if (event.type === "checkout.session.completed") {
      const session = event.data.object;

      if (session.payment_status !== "paid") {
        return new Response(null, { status: 200 });
      }

      const eventId = session.metadata?.eventId;
      const buyerEmail =
        session.customer_email ?? session.metadata?.buyerEmail ?? "";

      if (!eventId) {
        return new Response("Missing eventId in metadata", { status: 400 });
      }

      await ctx.runMutation(internal.purchases.fulfillPayment, {
        eventId: eventId as any,
        stripePaymentIntentId: (session.payment_intent as string) ?? session.id,
        stripeCheckoutSessionId: session.id,
        buyerEmail,
        amountCents: session.amount_total ?? 0,
      });
    }

    return new Response(null, { status: 200 });
  }),
});

export default http;
