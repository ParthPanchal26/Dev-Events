import mongoose, {
  Schema,
  model,
  models,
  type Document,
  type Model,
} from "mongoose";

// ─── Types ────────────────────────────────────────────────────────────────────

/** Plain data shape — used for typing lean queries and external consumers. */
export interface IEvent {
  title: string;
  slug: string;
  description: string;
  overview: string;
  image: string;
  venue: string;
  location: string;
  date: string;
  time: string;
  mode: string;
  audience: string;
  agenda: string[];
  organizer: string;
  tags: string[];
  createdAt: Date;
  updatedAt: Date;
}

/** Mongoose document type — adds _id, save(), etc. */
export type IEventDocument = IEvent & Document;

// ─── Helpers ──────────────────────────────────────────────────────────────────

/**
 * Converts a title into a URL-friendly slug.
 * e.g. "Google I/O 2026!" → "google-i-o-2026"
 */
function generateSlug(title: string): string {
  return title
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, "") // strip non-word chars (except spaces and hyphens)
    .replace(/[\s_]+/g, "-")  // replace spaces / underscores with hyphens
    .replace(/-+/g, "-");     // collapse consecutive hyphens
}

/**
 * Normalises a date string to ISO 8601 (YYYY-MM-DD).
 * Accepts human-readable strings like "May 20, 2026".
 * Throws if the value cannot be parsed.
 */
function normaliseDate(raw: string): string {
  const parsed = new Date(raw);
  if (isNaN(parsed.getTime())) {
    throw new Error(`Invalid date value: "${raw}"`);
  }
  return parsed.toISOString().split("T")[0]; // "YYYY-MM-DD"
}

/**
 * Normalises a time string to uppercase and trims whitespace.
 * e.g. "  10:00 am pdt  " → "10:00 AM PDT"
 */
function normaliseTime(raw: string): string {
  return raw.trim().toUpperCase();
}

// ─── Schema ───────────────────────────────────────────────────────────────────

const eventSchema = new Schema<IEventDocument>(
  {
    title: {
      type: String,
      required: [true, "Title is required"],
      trim: true,
    },
    // Slug is auto-generated in the pre-save hook; unique index enforced below.
    slug: {
      type: String,
      unique: true,
      trim: true,
    },
    description: {
      type: String,
      required: [true, "Description is required"],
      trim: true,
    },
    overview: {
      type: String,
      required: [true, "Overview is required"],
      trim: true,
    },
    image: {
      type: String,
      required: [true, "Image URL is required"],
      trim: true,
    },
    venue: {
      type: String,
      required: [true, "Venue is required"],
      trim: true,
    },
    location: {
      type: String,
      required: [true, "Location is required"],
      trim: true,
    },
    date: {
      type: String,
      required: [true, "Date is required"],
    },
    time: {
      type: String,
      required: [true, "Time is required"],
    },
    mode: {
      type: String,
      required: [true, "Mode is required"],
      enum: {
        values: ["online", "offline", "hybrid"],
        message: 'Mode must be "online", "offline", or "hybrid"',
      },
    },
    audience: {
      type: String,
      required: [true, "Audience is required"],
      trim: true,
    },
    agenda: {
      type: [String],
      required: [true, "Agenda is required"],
      validate: {
        validator: (v: string[]) => v.length > 0,
        message: "Agenda must contain at least one item",
      },
    },
    organizer: {
      type: String,
      required: [true, "Organizer is required"],
      trim: true,
    },
    tags: {
      type: [String],
      required: [true, "Tags are required"],
      validate: {
        validator: (v: string[]) => v.length > 0,
        message: "Tags must contain at least one item",
      },
    },
  },
  {
    // Automatically manages createdAt and updatedAt fields.
    timestamps: true,
  }
);

// ─── Pre-save Hook ────────────────────────────────────────────────────────────

eventSchema.pre<IEventDocument>("save", function (this: IEventDocument) {
  // Regenerate slug only when the title has been modified (or on first save).
  if (this.isModified("title")) {
    this.slug = generateSlug(this.title);
  }

  // Normalise date to ISO format (YYYY-MM-DD) on every save.
  if (this.isModified("date")) {
    this.date = normaliseDate(this.date);
  }

  // Normalise time to a consistent uppercase format on every save.
  if (this.isModified("time")) {
    this.time = normaliseTime(this.time);
  }
});

// ─── Model ────────────────────────────────────────────────────────────────────

/**
 * Guard against model re-registration during Next.js hot reloads.
 * `models.Event` will already exist after the first compile; reuse it.
 */
const Event: Model<IEventDocument> =
  (models.Event as Model<IEventDocument>) ?? model<IEventDocument>("Event", eventSchema);

export default Event;
