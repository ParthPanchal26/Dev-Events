import { User } from "@/database";
import { connectToDatabase } from "@/lib/mongodb";
import { isValidObjectId, ObjectId } from "mongoose";
import { NextRequest, NextResponse } from "next/server";

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: ObjectId }> }): Promise<NextResponse> {
    try {
        await connectToDatabase();

        const { id } = await params;

        if (!isValidObjectId(id)) return NextResponse.json({ success: false, message: "Invalid user id" }, { status: 400 })

        const user = await User.findById({ _id: id });

        if (!user) return NextResponse.json({ success: false, message: "User not found" }, { status: 404 })

        return NextResponse.json({ success: true, user });

    } catch (error) {
        console.log(error);
        return NextResponse.json({
            success: false,
            message: "Profile fetching failed",
            error: error instanceof Error ? error.message : 'Unknown'
        }, { status: 500 });
    }
}