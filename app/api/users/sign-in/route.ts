import { User } from "@/database";
import { connectToDatabase } from "@/lib/mongodb";
import { NextRequest, NextResponse } from "next/server";
import bcrypt from 'bcrypt';
import jwt, { SignOptions } from 'jsonwebtoken'

const JWT_SECRET = process.env.NEXT_JWT_SECRET_KEY as string;

// Used to keep bcrypt timing consistent when the user is not found,
// preventing account enumeration via timing differences.
const DUMMY_HASH = '$2b$10$abcdefghijklmnopqrstuuABCDEFGHIJKLMNOPQRSTUVWXYZ012345';

export async function POST(req: NextRequest) {
    try {
        // connect to db
        await connectToDatabase();

        // get user input
        const formData = await req.formData();

        // get js object from user input
        let user;
        try {
            user = Object.fromEntries(formData.entries());
        } catch (error) {
            return NextResponse.json({ success: false, message: "Invalid form data" }, { status: 400 });
        }

        // Validate that email and password are present strings
        if (!user.email || typeof user.email !== 'string' ||
            !user.password || typeof user.password !== 'string') {
            return NextResponse.json({ success: false, message: "Email and password are required" }, { status: 400 });
        }

        // Normalize email
        const normalizedEmail = (user.email as string).trim().toLowerCase();

        // Find existing user
        const existingUser = await User.findOne({ email: normalizedEmail });

        // Always run bcrypt.compare to prevent timing-based account enumeration.
        // If the user doesn't exist, compare against a dummy hash so the timing
        // is indistinguishable from a real (but wrong) password attempt.
        const hashToCompare = existingUser ? existingUser.password : DUMMY_HASH;
        const isCorrect = await bcrypt.compare(user.password as string, hashToCompare);

        // Return the same 401 for both "user not found" and "wrong password"
        if (!existingUser || !isCorrect) {
            return NextResponse.json({ success: false, message: "Email or password is incorrect" }, { status: 401 });
        }

        // Generate JWT token and return
        if (!JWT_SECRET) throw new Error('JWT_SECRET not found');
        const token = jwt.sign(
            { _id: existingUser._id, email: existingUser.email },
            JWT_SECRET,
            { expiresIn: (process.env.NEXT_JWT_EXPIRES_IN ?? '1h') as SignOptions['expiresIn'] }
        );

        return NextResponse.json({ success: true, message: "User signed-in successfully", token });

    } catch (error) {
        console.error(error);
        return NextResponse.json({
            success: false,
            message: "User sign-in failed",
        }, { status: 500 });
    }
}
