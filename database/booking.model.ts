import mongoose, {
  Schema,
  model,
  models,
  type Document,
  type Model,
  type Types,
} from "mongoose";

// ─── Types ────────────────────────────────────────────────────────────────────

/** Plain data shape for the Booking document. */
export interface IBooking {
  /** Reference to the Event this booking belongs to. */
  eventId: Types.ObjectId;
  email: string;
  slug: string;
  createdAt: Date;
  updatedAt: Date;
}

/** Mongoose document type — adds _id, save(), isModified(), etc. */
export type IBookingDocument = IBooking & Document;

// ─── Helpers ──────────────────────────────────────────────────────────────────

/** RFC 5322-inspired regex for basic email format validation. */
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// ─── Schema ───────────────────────────────────────────────────────────────────

const bookingSchema = new Schema<IBookingDocument>(
  {
    // Indexed for fast lookups of all bookings for a given event.
    eventId: {
      type: Schema.Types.ObjectId,
      ref: "Event",
      required: [true, "eventId is required"],
      index: true,
    },
    slug: {
      type: String,
      required: [true, 'Slug is required'],
      trim: true,
    },
    email: {
      type: String,
      required: [true, "Email is required"],
      trim: true,
      lowercase: true,
      validate: {
        validator: (v: string) => EMAIL_REGEX.test(v),
        message: "Invalid email address format",
      },
    },
  },
  {
    // Automatically manages createdAt and updatedAt fields.
    timestamps: true,
  }
);

// ─── Pre-save Hook ────────────────────────────────────────────────────────────

/**
 * Before saving a booking, verify that the referenced Event actually exists.
 * This guards against orphaned bookings caused by stale or fabricated IDs.
 */
bookingSchema.pre<IBookingDocument>("save", async function (this: IBookingDocument) {
  if (this.isModified("eventId")) {
    // Lazy-require to avoid circular dependency issues at module load time.
    const Event = mongoose.models.Event;

    if (!Event) {
      throw new Error(
        "Event model is not registered. Ensure event.model.ts is imported before booking.model.ts."
      );
    }

    const exists = await Event.exists({ _id: this.eventId });

    if (!exists) {
      throw new Error(`Event with id "${this.eventId}" does not exist`);
    }
  }
});

// ─── Model ────────────────────────────────────────────────────────────────────

/**
 * Guard against model re-registration during Next.js hot reloads.
 * `models.Booking` will already exist after the first compile; reuse it.
 */
const Booking: Model<IBookingDocument> =
  (models.Booking as Model<IBookingDocument>) ?? model<IBookingDocument>("Booking", bookingSchema);

export default Booking;
