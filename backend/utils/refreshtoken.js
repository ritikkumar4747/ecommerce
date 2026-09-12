import jwt from "jsonwebtoken";
import User from "../models/user.models.js";
import { getAuthCookieOptions } from "./cookieOptions.js";

export const refreshToken = async (req, res) => {
    try {
        const token = req.cookies.refreshToken;

        if (!token) {
            throw new Error("No refresh token");
        }

        const decoded = jwt.verify(token, process.env.JWT_REFRESH_SECRET);

        const user = await User.findById(decoded.id);

        if (!user || user.refreshToken !== token) {
            throw new Error("Invalid refresh token");
        }

        const newAccessToken = jwt.sign(
            { id: user._id, email: user.email, role: user.role },
            process.env.JWT_SECRET,
            { expiresIn: "15m" }
        );

        res.cookie("accessToken", newAccessToken, getAuthCookieOptions(15 * 60 * 1000));

        res.json({ message: "Access token refreshed" });

    } catch (err) {
        res.status(401).json({ error: err.message });
    }
};