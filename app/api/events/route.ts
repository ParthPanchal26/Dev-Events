import { Event } from "@/database";
import { connectToDatabase } from "@/lib/mongodb";
import { NextRequest, NextResponse } from "next/server";
import { v2 as cloudinary } from 'cloudinary'

export async function POST(req: NextRequest) {
    try {
        await connectToDatabase();

        const formData = await req.formData();

        let event;

        try {
            event = Object.fromEntries(formData.entries());
        } catch (error) {
            return NextResponse.json({ message: 'Invalid JSON data format' }, { status: 400 })
        }

        // Validate the image field is a real File with an accepted MIME type and sane size.
        const fileCandidate = formData.get('image');
        if (!(fileCandidate instanceof File) || fileCandidate.size === 0) {
            return NextResponse.json({ message: 'Image file is required' }, { status: 400 });
        }
        if (!fileCandidate.type.startsWith('image/')) {
            return NextResponse.json({ message: 'Uploaded file must be an image' }, { status: 400 });
        }
        const MAX_IMAGE_SIZE = 5 * 1024 * 1024; // 5 MB
        if (fileCandidate.size > MAX_IMAGE_SIZE) {
            return NextResponse.json({ message: 'Image must be smaller than 5 MB' }, { status: 400 });
        }
        const file = fileCandidate;

        // Parse array fields — return 400 on malformed JSON instead of letting it bubble to 500.
        let tags: string[];
        let agenda: string[];
        try {
            tags = JSON.parse(formData.get('tags') as string);
            agenda = JSON.parse(formData.get('agenda') as string);
        } catch {
            return NextResponse.json({ message: 'Malformed JSON for tags/agenda' }, { status: 400 });
        }

        const arrayBuffer = await file.arrayBuffer();
        const buffer = Buffer.from(arrayBuffer);

        const uploadResult = await new Promise((resolve, reject) => {
            cloudinary.uploader.upload_stream({ resource_type: 'image', folder: 'DevEvent' }, (error, results) => {
                if (error) return reject(error);
                resolve(results)
            }).end(buffer)
        })

        event.image = (uploadResult as { secure_url: string }).secure_url;

        const createEvent = await Event.create({ ...event, tags: tags, agenda: agenda });

        return NextResponse.json({ message: 'Event created successfully', event: createEvent }, { status: 201 })

    } catch (error) {
        console.log(error)
        return NextResponse.json(
            {
                message: 'Event creation failed',
                error: error instanceof Error ? error.message : 'Unknown'
            }, { status: 500 })
    }
}

export async function GET() {
    try {
        await connectToDatabase();

        const events = await Event.find().sort({ createdAt: -1 })

        return NextResponse.json({ message: 'Events fetched successfully', events }, { status: 200 })
    } catch (error) {
        return NextResponse.json({ message: 'Event fetching failed' }, { status: 500 })
    }
}
