import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true
    },

    email: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      lowercase: true,
      match: [/\S+@\S+\.\S+/, "Invalid email"]
    },

    password: {
      type: String,
      required: true
      
    },

    refreshToken: {
      type: String,
      default: null
    },

    role: {
      type: String,
      enum: ["user", "seller", "admin"],
      default: "user"
    }
    ,
    addresses: [
      {
        label: { type: String },
        recipientName: { type: String, required: true },
        line1: { type: String, required: true },
        line2: { type: String },
        city: { type: String, required: true },
        state: { type: String },
        postalCode: { type: String, required: true },
        country: { type: String, required: true },
        phone: { type: String },
        isDefault: { type: Boolean, default: false }
      }
    ]
  },
  { timestamps: true }
);
// Enforce at most one admin at the database level: create a partial unique index
// that only applies when `role: 'admin'`. This prevents race conditions where
// two documents could briefly be assigned admin concurrently.
userSchema.index(
  { role: 1 },
  { unique: true, partialFilterExpression: { role: 'admin' } }
);

const User = mongoose.model("User", userSchema);
export default User;
