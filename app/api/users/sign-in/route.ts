import { User } from "@/database";
import { connectToDatabase } from "@/lib/mongodb";
import { NextRequest, NextResponse } from "next/server";
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken'

const JWT_SECRET = process.env.NEXT_JWT_SECRET_KEY as string;

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
            return NextResponse.json({ success: false, message: "Invalid JSON data format" }, { status: 400 });
        }

        // Find existing user
        let email = user.email as string;
        let existingUser = await User.findOne({ email });
        if (existingUser == null) return NextResponse.json({ success: false, message: "User does not exist, please sign-up" }, { status: 404 });

        // Compare passwords
        const isCorrect = await bcrypt.compare(user.password as string, existingUser.password);
        if (!isCorrect) return NextResponse.json({ success: false, message: "Email or password is wrong" }, { status: 401 });

        // Generate JWT token and return
        if (!JWT_SECRET) throw new Error('JWT_SECRET not found');
        const token = jwt.sign({ _id: existingUser._id, email: existingUser.email }, JWT_SECRET);

        return NextResponse.json({ success: true, message: "User signed-in successfully", token });

    } catch (error) {
        console.log(error);
        return NextResponse.json({
            success: false,
            message: "User sign-in failed",
            error: error instanceof Error ? error.message : 'Unknown'
        }, { status: 500 });
    }
}