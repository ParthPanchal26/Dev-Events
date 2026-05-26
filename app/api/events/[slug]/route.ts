import { Event } from "@/database";
import { connectToDatabase } from "@/lib/mongodb";
import { NextRequest, NextResponse } from "next/server";

// Valid slug: lowercase letters, digits, and hyphens only, 2–100 chars.
// Matches the format produced by generateSlug() in event.model.ts.
const SLUG_REGEX = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
const SLUG_MAX_LENGTH = 100;

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
): Promise<NextResponse> {
  try {
    const { slug } = await params;

    // ── Slug validation ──────────────────────────────────────────────────────

    // Guard against empty / missing slug (e.g. route matched with blank segment).
    if (!slug || slug.trim() === "") {
      return NextResponse.json(
        { message: "Slug is required" },
        { status: 400 }
      );
    }

    // Reject slugs that exceed a reasonable length to prevent DB abuse.
    if (slug.length > SLUG_MAX_LENGTH) {
      return NextResponse.json(
        { message: `Slug must not exceed ${SLUG_MAX_LENGTH} characters` },
        { status: 400 }
      );
    }

    // Reject slugs that don't match the expected URL-safe format.
    // This blocks path-traversal attempts, injections, and obviously invalid values.
    if (!SLUG_REGEX.test(slug)) {
      return NextResponse.json(
        {
          message:
            "Invalid slug format. Only lowercase letters, digits, and hyphens are allowed",
        },
        { status: 400 }
      );
    }

    // ── Database lookup ──────────────────────────────────────────────────────

    await connectToDatabase();

    const event = await Event.findOne({ slug }).lean();

    if (!event) {
      return NextResponse.json({ message: "Event not found" }, { status: 404 });
    }

    return NextResponse.json({ event }, { status: 200 });
  } catch (error) {
    console.error("[GET /api/events/[slug]]", error);
    return NextResponse.json(
      { message: "Failed to fetch event" },
      { status: 500 }
    );
  }
}
