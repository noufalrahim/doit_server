import jwt from "jsonwebtoken";
import { Request, Response, NextFunction } from "express";
import { db } from "../db";
import { users } from "../db/schema";
import { eq } from "drizzle-orm";
import { jwtSecret } from "../secrets";

export interface AuthRequest extends Request {
    user?: string;
    token?: string;
}

export const auth = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
        const token = req.header("x-auth-token");
        if (!token) {
            res.status(401).json({ success: false, error: "No token provided" });
            return;
        }

        const verified = jwt.verify(token, jwtSecret);
        if (!verified || typeof verified !== "object" || !("id" in verified)) {
            res.status(401).json({ success: false, error: "Invalid token" });
            return;
        }

        const verifiedToken = verified as { id: string }; // Ensure id is a string

        const [user] = await db.select().from(users).where(eq(users.id, verifiedToken.id));
        if (!user) {
            res.status(401).json({ success: false, error: "User not found" });
            return;
        }

        req.user = verifiedToken.id;
        req.token = token;

        next();
    } catch (e) {
        console.error("Auth Middleware Error:", e); // Debugging
        res.status(500).json({ success: false, error: "Server error" });
    }
};
