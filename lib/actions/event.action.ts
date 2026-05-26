"use server";

import { Event } from "@/database";
import { connectToDatabase } from "../mongodb";

export const getSimilarEventsBySlug = async (slug: string) => {
    try {
        await connectToDatabase();

        const event = await Event.findOne({ slug })

        if (!event) return [];

        return await Event.find({ _id: { $ne: event?._id}, tags: { $in: event?.tags } } ).lean()
    } catch (error) {
        console.error(
            `[getSimilarEventsBySlug] Event lookup failed for slug="${slug}":`,
            error instanceof Error ? error.message : error
        );
        return [];
    }
}