import {
  Schema,
  model,
  models,
  type Document,
  type Model,
} from "mongoose";

// ─── Types ────────────────────────────────────────────────────────────────────

/** Plain data shape — used for typing lean queries and external consumers. */
export interface IUser {
  // Authentication
  firstName: string;
  lastName: string;
  email: string;
  password: string;

  // Profile
  profileImage: string;
  pronouns?: string;
  headline?: string;
  externalLinks: string[];
  profileViews: number;
  about?: string;

  // Employment
  isEmployee: boolean;
  companyName?: string;
  jobStartDate?: Date;
  jobEndDate?: Date;
  isPresentCompany: boolean;
  jobDescription?: string;

  // Education
  collegeName?: string;
  degreeName?: string;
  grade?: number;

  // Skills
  skills: string[];

  // System
  createdAt: Date;
  updatedAt: Date;
}

/** Mongoose document type — adds _id, save(), etc. */
export type IUserDocument = IUser & Document;

// ─── Helpers ──────────────────────────────────────────────────────────────────

/** RFC 5322-inspired regex for basic email format validation. */
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/** Default avatar used when no profileImage is provided. */
const DEFAULT_PROFILE_IMAGE = process.env.NEXT_PUBLIC_STATIC_PROFILE_IMAGE;

// ─── Schema ───────────────────────────────────────────────────────────────────

const userSchema = new Schema<IUserDocument>(
  {
    // ── Authentication ──────────────────────────────────────────────────────
    firstName: {
      type: String,
      required: [true, "First name is required"],
      trim: true,
    },
    lastName: {
      type: String,
      required: [true, "Last name is required"],
      trim: true,
    },
    email: {
      type: String,
      required: [true, "Email is required"],
      unique: true,
      lowercase: true,
      trim: true,
      validate: {
        validator: (v: string) => EMAIL_REGEX.test(v),
        message: "Invalid email address format",
      },
    },
    password: {
      type: String,
      required: [true, "Password is required"],
    },

    // ── Profile ─────────────────────────────────────────────────────────────
    profileImage: {
      type: String,
      default: DEFAULT_PROFILE_IMAGE,
      trim: true,
    },
    pronouns: {
      type: String,
      trim: true,
      default: null,
    },
    headline: {
      type: String,
      trim: true,
      default: null,
    },
    externalLinks: {
      type: [String],
      default: [],
      validate: {
        validator: (v: string[]) => v.length <= 3,
        message: "A maximum of 3 external links is allowed",
      },
    },
    profileViews: {
      type: Number,
      default: 0,
    },
    about: {
      type: String,
      trim: true,
      default: null,
    },

    // ── Employment ──────────────────────────────────────────────────────────
    isEmployee: {
      type: Boolean,
      default: false,
    },
    companyName: {
      type: String,
      trim: true,
      default: null,
    },
    jobStartDate: {
      type: Date,
      default: null,
    },
    jobEndDate: {
      type: Date,
      default: null,
    },
    isPresentCompany: {
      type: Boolean,
      default: false,
    },
    jobDescription: {
      type: String,
      trim: true,
      default: null,
    },

    // ── Education ───────────────────────────────────────────────────────────
    collegeName: {
      type: String,
      trim: true,
      default: null,
    },
    degreeName: {
      type: String,
      trim: true,
      default: null,
    },
    grade: {
      type: Number,
      default: null,
      min: [0.0, "Grade must be at least 0.0"],
      max: [10.0, "Grade cannot exceed 10.0"],
    },

    // ── Skills ──────────────────────────────────────────────────────────────
    skills: {
      type: [String],
      default: [],
    },
  },
  {
    // Automatically manages createdAt and updatedAt fields.
    timestamps: true,
  }
);

// ─── Pre-save Hook ────────────────────────────────────────────────────────────

userSchema.pre<IUserDocument>("save", function (this: IUserDocument) {
  // Normalise optional string fields: treat blank strings as null so queries
  // like `{ headline: null }` behave consistently.
  const optionalStringFields: (keyof IUserDocument)[] = [
    "pronouns",
    "headline",
    "about",
    "companyName",
    "jobDescription",
    "collegeName",
    "degreeName",
  ];

  for (const field of optionalStringFields) {
    const value = this[field];
    if (typeof value === "string" && value.trim() === "") {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (this as any)[field] = null;
    }
  }
});

// ─── Model ────────────────────────────────────────────────────────────────────

/**
 * Guard against model re-registration during Next.js hot reloads.
 * `models.User` will already exist after the first compile; reuse it.
 */
const User: Model<IUserDocument> =
  (models.User as Model<IUserDocument>) ?? model<IUserDocument>("User", userSchema);

export default User;
