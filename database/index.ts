/**
 * Central export point for all database models.
 * Import from here instead of individual model files to keep imports clean.
 *
 * Usage:
 *   import { Event, Booking, User } from "@/database";
 */

export { default as Event } from "./event.model";
export { default as Booking } from "./booking.model";
export { default as User } from "./user.model";

// Re-export types for consumers that need them without importing the models directly.
export type { IEvent, IEventDocument } from "./event.model";
export type { IBooking, IBookingDocument } from "./booking.model";
export type { IUser, IUserDocument } from "./user.model";
