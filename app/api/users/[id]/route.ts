import { User } from "@/database";
import { connectToDatabase } from "@/lib/mongodb";
import { isValidObjectId, Types } from "mongoose";
import { NextRequest, NextResponse } from "next/server";

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }): Promise<NextResponse> {
    try {
        await connectToDatabase();

        const { id } = await params;

        if (!isValidObjectId(id)) return NextResponse.json({ success: false, message: "Invalid user id" }, { status: 400 });

        const objectId = new Types.ObjectId(id);

        // Exclude password from the returned document
        const user = await User.findById(objectId).select('-password');

        if (!user) return NextResponse.json({ success: false, message: "User not found" }, { status: 404 });

        return NextResponse.json({ success: true, user });

    } catch (error) {
        console.error(error);
        return NextResponse.json({
            success: false,
            message: "Profile fetching failed",
        }, { status: 500 });
    }
}
