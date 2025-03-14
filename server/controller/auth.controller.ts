import { Request, Response } from "express";
import jwt from "jsonwebtoken";
import UserModel from "../models/user";

// Secret keys for tokens (should be stored in environment variables in production)
const ACCESS_TOKEN_SECRET = process.env.ACCESS_TOKEN_SECRET || "access_secret";
const REFRESH_TOKEN_SECRET =
    process.env.REFRESH_TOKEN_SECRET || "refresh_secret";

// Access token expiry - set to a very short time for testing (30 seconds)
// You can make this longer in production (e.g., 15m)
const ACCESS_TOKEN_EXPIRY = process.env.ACCESS_TOKEN_EXPIRY || "30s";

// Refresh token expiry (7 days)
const REFRESH_TOKEN_EXPIRY = process.env.REFRESH_TOKEN_EXPIRY || "7d";

/**
 * Verify access token middleware
 */
export const verifyAccessToken = async (
    accessToken: string,
    refreshToken: string,
    req: Request,
    res: Response,
    next: any
) => {
    try {
        try {
            // First verify access token
            const decoded = jwt.verify(accessToken, ACCESS_TOKEN_SECRET) as {
                _id: string;
            };

            // Set the user ID in the request
            req.body.userId = decoded._id;

            // Extract token info for logging
            const tokenData = jwt.decode(accessToken) as { exp: number };
            const currentTime = Math.floor(Date.now() / 1000);
            const timeUntilExpiry = tokenData.exp - currentTime;

            console.log(
                `Valid access token. Time until expiry: ${timeUntilExpiry} seconds`
            );

            // Continue with the request
            return next();
        } catch (error) {
            // Access token is invalid or expired
            console.log(
                "Access token validation failed, attempting to use refresh token"
            );

            // If no refresh token is provided, authentication fails
            if (!refreshToken) {
                return res.status(401).json({
                    status: false,
                    message:
                        "Access token expired and no refresh token provided",
                });
            }

            try {
                // Verify and decode refresh token
                const decoded = jwt.verify(
                    refreshToken,
                    REFRESH_TOKEN_SECRET
                ) as { _id: string };

                // Find user by ID and check if refresh token matches
                const user = await UserModel.findOne({ _id: decoded._id });

                if (!user) {
                    console.log("User not found for the given refresh token");
                    return res.status(401).json({
                        status: false,
                        message: "Invalid refresh token - user not found",
                    });
                }

                // if (user.refreshToken !== refreshToken) {
                //     console.log(
                //         "Stored refresh token does not match the provided token"
                //     );
                //     return res.status(401).json({
                //         status: false,
                //         message: "Invalid refresh token - token mismatch",
                //     });
                // }

                console.log(
                    "Refresh token validated successfully, generating new tokens"
                );

                // Generate new tokens
                const tokens = await generateTokens(user._id);

                // Set user ID in request
                req.body.userId = user._id;

                // Store tokens in the response local variables for later use
                res.locals.newTokens = {
                    accessToken: tokens.accessToken,
                    refreshToken: tokens.refreshToken,
                };

                // Set cookies with new tokens
                res.cookie("accessToken", tokens.accessToken, {
                    httpOnly: true,
                    secure: process.env.NODE_ENV === "production",
                    sameSite: "strict",
                    maxAge: 15 * 60 * 1000, // 15 minutes
                });

                res.cookie("refreshToken", tokens.refreshToken, {
                    httpOnly: true,
                    secure: process.env.NODE_ENV === "production",
                    sameSite: "strict",
                    maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
                });

                console.log("Successfully refreshed tokens and set cookies");

                // Continue with the request
                return next();
            } catch (refreshError) {
                console.error("Refresh token validation failed:", refreshError);
                return res.status(401).json({
                    status: false,
                    message: "Invalid refresh token - cannot verify",
                });
            }
        }
    } catch (error) {
        console.error("Unexpected error in token verification:", error);
        return res.status(500).json({
            status: false,
            message: "Server error during authentication",
        });
    }
};

/**
 * Generate new access and refresh tokens for a user
 */
export const generateTokens = async (userId: string) => {
    try {
        // Find user by ID
        const user = await UserModel.findById(userId);

        if (!user) {
            throw new Error("User not found");
        }

        // Generate access token with correct expiry
        const accessToken = jwt.sign({ _id: userId }, ACCESS_TOKEN_SECRET, {
            expiresIn: ACCESS_TOKEN_EXPIRY, // Use the constant, not process.env
        });

        // Generate refresh token
        const refreshToken = jwt.sign({ _id: userId }, REFRESH_TOKEN_SECRET, {
            expiresIn: REFRESH_TOKEN_EXPIRY, // Use the constant, not process.env
        });

        // Decode tokens to log expiration times
        const accessTokenDecoded = jwt.decode(accessToken) as { exp: number };
        const refreshTokenDecoded = jwt.decode(refreshToken) as { exp: number };

        const accessExpiry = new Date(
            accessTokenDecoded.exp * 1000
        ).toISOString();
        const refreshExpiry = new Date(
            refreshTokenDecoded.exp * 1000
        ).toISOString();

        console.log(`Generated tokens for user ${userId}:`);
        console.log(`Access token expires at: ${accessExpiry}`);
        console.log(`Refresh token expires at: ${refreshExpiry}`);

        // Save refresh token to user model
        user.refreshToken = refreshToken;
        await user.save();

        return { accessToken, refreshToken };
    } catch (error) {
        console.error("Error generating tokens:", error);
        throw error;
    }
};

/**
 * Refresh token handler
 */
export const refreshToken = async (req: Request, res: Response) => {
    try {
        const refreshToken = req.cookies.refreshToken;

        if (!refreshToken) {
            return res
                .status(401)
                .json({ status: false, message: "Refresh token required" });
        }

        // Verify refresh token
        const decoded = jwt.verify(refreshToken, REFRESH_TOKEN_SECRET) as {
            _id: string;
        };

        // Find user with the given ID and refresh token
        const user = await UserModel.findOne({
            _id: decoded._id,
            refreshToken,
        });

        if (!user) {
            return res
                .status(401)
                .json({ status: false, message: "Invalid refresh token" });
        }

        // Generate new tokens
        const tokens = await generateTokens(user._id);

        // Set new refresh token in cookie
        res.cookie("refreshToken", tokens.refreshToken, {
            httpOnly: true,
            maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
            secure: process.env.NODE_ENV === "production",
            sameSite: "strict",
        });

        return res.status(200).json({
            status: true,
            message: "Token refreshed successfully",
            accessToken: tokens.accessToken,
        });
    } catch (error) {
        return res
            .status(401)
            .json({ status: false, message: "Invalid refresh token" });
    }
};
