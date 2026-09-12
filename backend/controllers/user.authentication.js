import User from "../models/user.models.js";
import validate from "../utils/validator.js";
import { redisclient } from "../config/redisclient.js";
import { getAuthCookieOptions } from "../utils/cookieOptions.js";

import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";


export const register = async (req, res) => {
    try {
        validate(req.body);

        const { name, email, password, role } = req.body;

        const exists = await User.exists({ email });
        if (exists) {
            throw new Error("User already exists");
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        const userData = { name, email, password: hashedPassword };
        // Allow role to be provided for local/dev convenience (must be 'admin', 'user', or 'seller')
        if (role && (role === 'admin' || role === 'user' || role === 'seller')) {
            // Prevent creating admin accounts in production unless explicitly allowed
            const allowAdmin = (process.env.ALLOW_ADMIN_REGISTRATION === 'true') || (process.env.NODE_ENV !== 'production');
            if (role === 'admin') {
                if (!allowAdmin) {
                    // ignore admin flag in production for safety
                } else {
                    // Enforce single-admin constraint
                    const adminExists = await User.exists({ role: 'admin' });
                    if (adminExists) {
                        throw new Error('An admin user already exists');
                    }
                    userData.role = 'admin';
                }
            } else if (role === 'seller') {
                userData.role = 'seller';
            } else {
                userData.role = 'user';
            }
        }

        const user = await User.create(userData);

        if (!process.env.JWT_SECRET || !process.env.JWT_REFRESH_SECRET) {
            throw new Error("JWT secrets are not set");
        }

        //  Access Token (short expiry)
        const accessToken = jwt.sign(
            { id: user._id, email: user.email, role: user.role },
            process.env.JWT_SECRET,
            { expiresIn: "15m" }
        );

        //  Refresh Token (long expiry)
        const refreshToken = jwt.sign(
            { id: user._id },
            process.env.JWT_REFRESH_SECRET,
            { expiresIn: "7d" }
        );

        // (Optional but recommended) Save refresh token in DB
        user.refreshToken = refreshToken;
        await user.save();

        //  Send tokens in cookies
        res.cookie("accessToken", accessToken, getAuthCookieOptions(15 * 60 * 1000));
        res.cookie("refreshToken", refreshToken, getAuthCookieOptions(7 * 24 * 60 * 60 * 1000));

        res.status(201).json({
            message: "User registered successfully"
        });

    } catch (err) {
        res.status(400).json({ error: err.message });
    }
};
export const login=async(req,res)=>{
    try{
        const {email,password}=req.body;   
        if(!email || !password){
            throw new Error("Please provide email and password");
        }
        const user=await User.findOne({email:email});
        if(!user){
            throw new Error("User not found");
        }   
        const isMatch=await bcrypt.compare(password,user.password);
        if(!isMatch){
            throw new Error("Invalid password");
        }
        //  Access Token (short expiry)
        const accessToken = jwt.sign(
            { id: user._id, email: user.email, role: user.role },
            process.env.JWT_SECRET,
            { expiresIn: "15m" }
        );

        //  Refresh Token (long expiry)
        const refreshToken = jwt.sign(
            { id: user._id },
            process.env.JWT_REFRESH_SECRET,
            { expiresIn: "7d" }
        );

        // (Optional but recommended) Save refresh token in DB
        user.refreshToken = refreshToken;
        await user.save();

        //  Send tokens in cookies
        res.cookie("accessToken", accessToken, getAuthCookieOptions(15 * 60 * 1000));
        res.cookie("refreshToken", refreshToken, getAuthCookieOptions(7 * 24 * 60 * 60 * 1000));
        res.status(200).json({message:"User logged in successfully"});
    }
    catch(err){
        res.status(400).json({error:err.message});
    }
}

export const logout = async (req, res) => {
    try {
        const accessToken = req.cookies?.accessToken;
        const refreshToken = req.cookies?.refreshToken;

        //  Blacklist access token
        if (accessToken) {
            const payload = jwt.verify(accessToken, process.env.JWT_SECRET);

            const ttl = Math.max(
                (payload.exp || 0) - Math.floor(Date.now() / 1000),
                1
            );

            // Use option object for expiry with node-redis v4
            await redisclient.set(`bl:${accessToken}`, "blocked", { EX: ttl });
        }

        // Remove refresh token from DB (VERY IMPORTANT)
        if (refreshToken) {
            const decoded = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET);

            await User.findByIdAndUpdate(decoded.id, {
                $unset: { refreshToken: "" }
            });
        }

        //Clear cookies
        res.clearCookie("accessToken", getAuthCookieOptions());
        res.clearCookie("refreshToken", getAuthCookieOptions());

        res.status(200).json({ message: "Logged out successfully" });

    } catch (err) {
        res.status(400).json({ error: err.message });
    }
};

export const me = async (req, res) => {
    try {
        // user.middleware attaches req.user if token is valid
        if (!req.user) return res.status(401).json({ error: 'Not authenticated' });

        const { _id, name, email, role } = req.user;
        res.json({ id: _id, name, email, role });
    } catch (err) {
        res.status(401).json({ error: err.message });
    }
}

export const makeAdmin = async (req, res) => {
    try {
        if (!req.user) return res.status(401).json({ error: 'Not authenticated' });
        const user = await User.findById(req.user._id);
        if (!user) return res.status(404).json({ error: 'User not found' });
        // Enforce single-admin constraint: ensure no other admin exists
        const existingAdmin = await User.findOne({ role: 'admin' });
        if (existingAdmin && existingAdmin._id.toString() !== user._id.toString()) {
            return res.status(400).json({ error: 'An admin already exists' });
        }

        user.role = 'admin';
        await user.save();
        return res.json({ message: 'User promoted to admin', role: user.role });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
}



