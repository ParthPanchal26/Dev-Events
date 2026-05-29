import { User } from "@/database";
import { connectToDatabase } from "@/lib/mongodb";
import { NextRequest, NextResponse } from "next/server";
import bcrypt from 'bcrypt';
import jwt, { SignOptions } from 'jsonwebtoken'

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
            return NextResponse.json({ success: false, message: "Invalid form data" }, { status: 400 });
        }

        // Validate that email and password are present strings
        if (!user.email || typeof user.email !== 'string' ||
            !user.password || typeof user.password !== 'string') {
            return NextResponse.json({ success: false, message: "Email and password are required" }, { status: 400 });
        }

        // Validate firstName and lastName are present non-empty strings
        if (!user.firstName || typeof user.firstName !== 'string' || (user.firstName as string).trim() === '' ||
            !user.lastName || typeof user.lastName !== 'string' || (user.lastName as string).trim() === '') {
            return NextResponse.json({ success: false, message: "First name and last name are required" }, { status: 400 });
        }

        // Normalize email before lookup and storage; reject whitespace-only values
        const normalizedEmail = (user.email as string).trim().toLowerCase();
        if (normalizedEmail === '') {
            return NextResponse.json({ success: false, message: "Email and password are required" }, { status: 400 });
        }

        // Find existing user using normalized email
        const existingUser = await User.findOne({ email: normalizedEmail });
        if (existingUser !== null) return NextResponse.json({ success: false, message: "User already exist, please sign-in" }, { status: 422 });

        // hash the password and override in user object
        const hashedPassword = await bcrypt.hash(user.password as string, 10);
        user = { ...user, email: normalizedEmail, password: hashedPassword };

        // Create db document
        const userDocument = await User.create({ ...user });

        // Generate JWT token and return
        if (!JWT_SECRET) throw new Error('JWT_SECRET not found');
        const token = jwt.sign(
            { _id: userDocument._id, email: userDocument.email },
            JWT_SECRET,
            { expiresIn: (process.env.NEXT_JWT_EXPIRES_IN ?? '1h') as SignOptions['expiresIn'] }
        );

        return NextResponse.json({ success: true, message: "User created successfully", token });

    } catch (error) {
        // Map Mongo duplicate-key errors to a 422 instead of a 500
        if (
            typeof error === 'object' && error !== null &&
            ('code' in error && (error as { code: unknown }).code === 11000 ||
             'name' in error && (error as { name: unknown }).name === 'MongoServerError')
        ) {
            return NextResponse.json({ success: false, message: "User already exist, please sign-in" }, { status: 422 });
        }

        console.error(error);
        return NextResponse.json({
            success: false,
            message: "User creation failed",
        }, { status: 500 });
    }
}
