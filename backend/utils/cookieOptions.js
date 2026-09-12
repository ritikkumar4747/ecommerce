export const getAuthCookieOptions = (maxAge) => {
    const isProduction = process.env.NODE_ENV === "production";
    return {
        httpOnly: true,
        secure: isProduction,
        sameSite: isProduction ? "none" : "lax",
        ...(maxAge ? { maxAge } : {})
    };
};
