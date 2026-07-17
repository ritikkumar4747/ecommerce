import jwt from "jsonwebtoken";
import User from "../models/user.models.js";
import { redisclient } from "../config/redisclient.js";

const adminmiddleware = async (req, res, next) => {
    try {
        let token;

        //  Extract token safely
        if (req.cookies?.accessToken) {
            token = req.cookies.accessToken;
        } else if (req.headers.authorization?.startsWith("Bearer ")) {
            token = req.headers.authorization.split(" ")[1];
        }

        if (!token) {
            return res.status(401).json({ error: "No token provided" });
        }

        //  Check Redis blacklist FIRST
        const isBlocked = await redisclient.get(`bl:${token}`);
        if (isBlocked) {
            return res.status(401).json({ error: "Token is blacklisted" });
        }

        //  Verify token
        const payload = jwt.verify(token, process.env.JWT_SECRET);

        if (!payload?.id) {
            return res.status(401).json({ error: "Invalid token payload" });
        }

        //  Fetch user
        const user = await User.findById(payload.id);
        if (!user) {
            return res.status(401).json({ error: "User not found" });
        }

        //  Role check AFTER confirming user
        if (user.role !== "admin") {
            return res.status(403).json({ error: "Admin access required" });
        }

        //  Attach to request
        req.user = user;
        req.token = token;

        next();

    } catch (err) {
        return res.status(401).json({
            error: err.message || "Authentication failed"
        });
    }
};

export default adminmiddleware;