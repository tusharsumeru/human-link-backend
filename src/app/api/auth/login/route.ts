import { NextRequest, NextResponse } from "next/server";
import { getDb } from "@/lib/mongodb";

export async function POST(req: NextRequest) {
  try {
    const { phone, otp } = await req.json();

    if (!phone || !otp) {
      return NextResponse.json({ error: "Phone and OTP are required" }, { status: 400 });
    }

    // OTP is always 121212 for this demo
    if (otp !== "121212") {
      return NextResponse.json({ error: "Invalid OTP" }, { status: 401 });
    }

    const db = await getDb();
    const users = db.collection("users");
    const user = await users.findOne({ phone });

    if (!user) {
      return NextResponse.json({ error: "Phone number not registered" }, { status: 404 });
    }

    // Update last login
    await users.updateOne({ phone }, { $set: { lastLoginAt: new Date() } });

    return NextResponse.json({
      success: true,
      user: {
        id: user._id.toString(),
        name: user.name,
        phone: user.phone,
        gotra: user.gotra,
        native: user.native,
        role: user.role,
        avatar: user.avatar,
        // Full profile fields saved via /api/auth/profile, so a login on any
        // device restores the complete profile.
        bio: user.bio ?? "",
        occupation: user.occupation ?? "",
        matrimonialOptIn: user.matrimonialOptIn ?? false,
        verified: user.verified ?? false,
        photoUrl: user.photoUrl ?? "",
        dob: user.dob ?? "",
        gender: user.gender ?? "",
        address: user.address ?? "",
        masked_aadhaar: user.masked_aadhaar ?? "",
      },
    });
  } catch (err) {
    console.error("Login error:", err);
    return NextResponse.json({ error: "Login failed" }, { status: 500 });
  }
}
