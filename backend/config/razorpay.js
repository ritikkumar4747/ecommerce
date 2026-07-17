import Razorpay from "razorpay";

const keyId = process.env.RAZORPAY_KEY_ID || process.env.RAZORPAY_KEY || null;
const keySecret = process.env.RAZORPAY_KEY_SECRET || process.env.RAZORPAY_KEY_SECRET_CANONICAL || null;

let razorpayClient;

if (keyId && keySecret) {
    razorpayClient = new Razorpay({
        key_id: keyId,
        key_secret: keySecret,
    });
} else {
    // Do not throw at import time; export a shim that fails at call time with clear message
    console.warn("Razorpay not configured: export shim. Set RAZORPAY_KEY_ID and RAZORPAY_KEY_SECRET in .env to enable payments.");

    const missingMsg = "Razorpay not configured; missing RAZORPAY_KEY_ID or RAZORPAY_KEY_SECRET";

    razorpayClient = {
        orders: {
            create: async () => { throw new Error(missingMsg); },
            fetch: async () => { throw new Error(missingMsg); },
        },
        payments: {
            fetch: async () => { throw new Error(missingMsg); },
        },
    };
}

export default razorpayClient;
export { keyId, keySecret };