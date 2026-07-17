import Order from "../models/order.models.js";
import Cart from "../models/cart.models.js";
import Product from "../models/product.models.js";
import User from "../models/user.models.js";
import razorpay, { keySecret as razorpayKeySecret, keyId as razorpayKeyId } from "../config/razorpay.js";
import crypto from "crypto";

//  Create order (checkout)
export const createOrder = async (req, res) => {
    try {
        const userId = req.user._id;

        const cart = await Cart.findOne({ userId }).populate("items.productId");

        if (!cart || cart.items.length === 0) {
            return res.status(400).json({ error: "Cart is empty" });
        }

        let totalAmount = 0;

        const orderItems = cart.items.map(item => {
            const price = item.productId.price;

            totalAmount += price * item.quantity;

            return {
                productId: item.productId._id,
                quantity: item.quantity,
                priceAtPurchase: price
            };
        });

        // Determine shipping address: accept addressId (saved) or shippingAddress object
        let shippingAddress = null;
        if (req.body.addressId) {
            const user = await User.findById(userId);
            const addr = user.addresses.id(req.body.addressId);
            if (addr) {
                shippingAddress = {
                    recipientName: addr.recipientName,
                    line1: addr.line1,
                    line2: addr.line2,
                    city: addr.city,
                    state: addr.state,
                    postalCode: addr.postalCode,
                    country: addr.country,
                    phone: addr.phone,
                    addressLabel: addr.label
                };
            } else {
                return res.status(400).json({ error: "Selected address not found" });
            }
        } else if (req.body.shippingAddress) {
            shippingAddress = req.body.shippingAddress;
            // Server-side validation for provided shippingAddress
            const required = ["recipientName", "line1", "city", "postalCode", "country"];
            for (const f of required) {
                if (!shippingAddress[f] || String(shippingAddress[f]).trim() === "") {
                    return res.status(400).json({ error: `${f} is required in shippingAddress` });
                }
            }

            // phone format validation
            if (shippingAddress.phone) {
                const phoneRe = /^[0-9+()\-\s]{7,20}$/;
                if (!phoneRe.test(String(shippingAddress.phone).trim())) {
                    return res.status(400).json({ error: 'phone has invalid format in shippingAddress' });
                }
            }

            // basic postal code pattern per country (simple examples)
            if (shippingAddress.postalCode && shippingAddress.country) {
                const pc = String(shippingAddress.postalCode).trim();
                const country = String(shippingAddress.country).toLowerCase();
                const patterns = {
                    india: /^\d{6}$/, // India 6 digits
                    us: /^\d{5}(-\d{4})?$/, // USA 5 or 9 digits
                    uk: /^[A-Z0-9 ]{2,8}$/i,
                };
                for (const key of Object.keys(patterns)) {
                    if (country.includes(key)) {
                        if (!patterns[key].test(pc)) return res.status(400).json({ error: `postalCode invalid for country ${shippingAddress.country}` });
                    }
                }
            }

            // Optionally save this address if requested
            if (req.body.saveAddress) {
                const user = await User.findById(userId);
                if (shippingAddress.isDefault) user.addresses.forEach(a => (a.isDefault = false));
                user.addresses.push(shippingAddress);
                await user.save();
            }
        } else {
            return res.status(400).json({ error: "Shipping address is required" });
        }

        const order = await Order.create({
            userId,
            items: orderItems,
            amount: totalAmount,
            status: "pending",
            shippingAddress
        });
            // Create Razorpay order
            const options = {
                amount: Math.round(totalAmount * 100), // amount in paise
                currency: "INR",
                receipt: order._id.toString(),
                payment_capture: 1,
            };

            let rOrder;
            try {
                rOrder = await razorpay.orders.create(options);
            } catch (err) {
                console.error('Razorpay create order failed, falling back to test order', err);
                // Fallback for local/dev: create a fake order object so frontend can continue
                rOrder = { id: `test_order_${order._id}`, amount: options.amount, currency: options.currency };
            }

            // Save razorpay order id to order
            order.paymentInfo = order.paymentInfo || {};
            order.paymentInfo.razorpayOrderId = rOrder.id;
            await order.save();

            res.status(201).json({ message: "Order placed", order, razorpayOrder: rOrder, razorpayKey: razorpayKeyId });

    } catch (err) {
        console.error('Create order error', err);
        res.status(500).json({ error: err.message });
    }
};

//  Get user orders
export const getOrders = async (req, res) => {
    try {
        const orders = await Order.find({ userId: req.user._id })
            .populate("items.productId");

        res.json(orders);

    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// Get single order
export const getOrderById = async (req, res) => {
    try {
        const order = await Order.findById(req.params.id)
            .populate("items.productId");

        if (!order) {
            return res.status(404).json({ error: "Order not found" });
        }

        res.json(order);

    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// Verify payment signature and mark order as paid
export const verifyPayment = async (req, res) => {
    try {
        const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body;
        if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
            return res.status(400).json({ error: "Missing payment verification parameters" });
        }

        if (!razorpayKeySecret) {
            return res.status(500).json({ error: "Razorpay key secret not configured on server. Cannot verify payment." });
        }

        const hmac = crypto.createHmac("sha256", razorpayKeySecret);
        hmac.update(razorpay_order_id + "|" + razorpay_payment_id);
        const expectedSignature = hmac.digest("hex");

        if (expectedSignature !== razorpay_signature) {
            return res.status(400).json({ error: "Invalid signature" });
        }

        // Find order by razorpay order id
        const order = await Order.findOne({ "paymentInfo.razorpayOrderId": razorpay_order_id });
        if (!order) return res.status(404).json({ error: "Order not found" });

        order.paymentInfo = order.paymentInfo || {};
        order.paymentInfo.razorpayPaymentId = razorpay_payment_id;
        order.paymentInfo.razorpaySignature = razorpay_signature;
        order.isPaid = true;
        order.paidAt = Date.now();
        order.status = "completed";

        await order.save();

        // 🧹 Clear cart after successful payment verification
        await Cart.findOneAndDelete({ userId: order.userId });

        res.json({ success: true, order });

    } catch (err) {
        console.error('Verify payment error', err);
        res.status(500).json({ error: err.message });
    }
};

// Get orders containing seller's products
export const getSellerOrders = async (req, res) => {
    try {
        // Find products owned by the seller
        const sellerProducts = await Product.find({ seller: req.user._id }).select("_id");
        const productIds = sellerProducts.map(p => p._id);

        // Find orders containing these products
        const orders = await Order.find({ "items.productId": { $in: productIds } })
            .populate("items.productId")
            .populate("userId", "name email");

        res.json(orders);
    } catch (err) {
        console.error('Get seller orders error', err);
        res.status(500).json({ error: err.message });
    }
};

// Update order status (allowed for admins, and sellers if the order contains their products)
export const updateOrderStatus = async (req, res) => {
    try {
        const { status } = req.body;
        if (!status) {
            return res.status(400).json({ error: "Status is required" });
        }

        const validStatuses = ["pending", "completed", "cancelled", "shipped", "delivered"];
        if (!validStatuses.includes(status)) {
            return res.status(400).json({ error: "Invalid status value" });
        }

        const order = await Order.findById(req.params.id);
        if (!order) {
            return res.status(404).json({ error: "Order not found" });
        }

        // Authorization check: Admin, or Seller owning at least one product in this order
        if (req.user.role !== "admin") {
            const sellerProducts = await Product.find({ seller: req.user._id }).select("_id");
            const productIds = sellerProducts.map(p => p._id.toString());
            const hasSellerProduct = order.items.some(item => productIds.includes(item.productId.toString()));

            if (!hasSellerProduct) {
                return res.status(403).json({ error: "Not authorized to update this order's status" });
            }
        }

        order.status = status;
        await order.save();

        res.json({ success: true, order });
    } catch (err) {
        console.error('Update order status error', err);
        res.status(500).json({ error: err.message });
    }
};