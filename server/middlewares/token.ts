import { NextFunction } from "express";
import express from "express";
import jwt from "jsonwebtoken";
import {
    generateTokens,
    verifyAccessToken,
} from "../controller/auth.controller";
import UserModel from "../models/user";
// import { generateTokens } from "../controller/auth.controller";
require("dotenv");

interface UserRequest extends express.Request {
    user?: string;
}

// Middleware to add tokens to response if they were refreshed
export function addTokensToResponse(
    req: express.Request,
    res: express.Response,
    next: NextFunction
) {
    // Save the original json method
    const originalJson = res.json;

    // Override the json method
    res.json = function (body: any) {
        // If new tokens were generated during authentication
        if (res.locals.newTokens) {
            // Add the tokens to the response body
            if (typeof body === "object" && body !== null) {
                body.accessToken = res.locals.newTokens.accessToken;
                body.refreshToken = res.locals.newTokens.refreshToken;

                console.log("Added refreshed tokens to response body");
            }
        }

        // Call the original json method
        return originalJson.call(this, body);
    };

    next();
}

export async function authenticateToken(
    req: UserRequest,
    res: express.Response,
    next: NextFunction
) {
    try {
        const authHeader = req.headers["authorization"];
        if (!authHeader) {
            return res.status(401).json({
                success: false,
                message: "Authorization header not provided",
            });
        }

        // Extract token from "Bearer <token>" format
        const accessToken = authHeader.startsWith("Bearer ")
            ? authHeader.slice(7)
            : authHeader;

        if (!accessToken) {
            return res
                .status(401)
                .json({ success: false, message: "Token not provided" });
        }

        // Get refresh token from cookies
        const refreshToken = req.cookies.refreshToken;

        // Use the verifyAccessToken function to validate tokens and handle refresh if needed
        try {
            await verifyAccessToken(accessToken, refreshToken, req, res, next);
            // verifyAccessToken will call next() if successful
        } catch (error) {
            console.error("Token verification error:", error);
            return res.status(401).json({
                success: false,
                message: "Authentication failed",
            });
        }
    } catch (err) {
        console.error("General token error:", err);
        return res
            .status(403)
            .json({ success: false, message: "Invalid or expired token" });
    }
}

export async function Auth(
    req: UserRequest,
    res: express.Response,
    next: NextFunction
) {
    try {
        // Extract tokens from various sources
        const accessToken =
            req.cookies.accessToken ||
            (req.query.accessToken as string) ||
            req.body.accessToken ||
            req.params.accessToken ||
            (req.headers["authorization"]?.startsWith("Bearer ")
                ? req.headers["authorization"].split(" ")[1]
                : req.headers["authorization"]) ||
            req.headers["x-access-token"] ||
            req.headers["x-auth-token"];

        const refreshToken =
            req.cookies.refreshToken ||
            (req.query.refreshToken as string) ||
            req.body.refreshToken ||
            req.params.refreshToken ||
            req.headers["x-refresh-token"];

        // If we have tokens, verify them
        if (accessToken || refreshToken) {
            try {
                await verifyAccessToken(
                    accessToken,
                    refreshToken,
                    req,
                    res,
                    next
                );
                return; // verifyAccessToken will call next() if successful
            } catch (error) {
                console.error("Token verification error:", error);
                // Continue to ID-based auth if token verification fails
            }
        }

        // Fallback to ID-based auth if no tokens or token verification failed
        const { id } = req.body;
        if (!id) {
            return res
                .status(400)
                .json({ success: false, message: "User ID is required" });
        }

        // Generate new tokens
        const { accessToken: newAccessToken, refreshToken: newRefreshToken } =
            await generateTokens(id);

        // Set cookies
        res.cookie("accessToken", newAccessToken, {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: "strict",
            maxAge: 15 * 60 * 1000, // 15 minutes
        });

        res.cookie("refreshToken", newRefreshToken, {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: "strict",
            maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
        });

        next();
    } catch (error) {
        console.error("Auth middleware error:", error);
        return res
            .status(500)
            .json({ success: false, message: "Internal server error" });
    }
}
