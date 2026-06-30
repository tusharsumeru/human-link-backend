import { NextRequest, NextResponse } from "next/server";
import { getDb } from "@/lib/mongodb";

export async function PATCH(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      phone, gotra, native, bio, occupation, matrimonialOptIn,
      dob, gender, address, masked_aadhaar, verified,
    } = body;

    if (!phone) {
      return NextResponse.json({ error: "Phone is required to identify user" }, { status: 400 });
    }

    const db = await getDb();
    const update: Record<string, unknown> = { updatedAt: new Date() };
    if (gotra    !== undefined) update.gotra    = gotra;
    if (native   !== undefined) update.native   = native;
    if (bio      !== undefined) update.bio      = bio;
    if (occupation !== undefined) update.occupation = occupation;
    if (matrimonialOptIn !== undefined) update.matrimonialOptIn = matrimonialOptIn;
    // Aadhaar (DigiLocker) verified KYC. Never store the full Aadhaar number.
    if (dob            !== undefined) update.dob            = dob;
    if (gender         !== undefined) update.gender         = gender;
    if (address        !== undefined) update.address        = address;
    if (masked_aadhaar !== undefined) update.masked_aadhaar = masked_aadhaar;
    if (verified       !== undefined) update.verified       = verified;

    const result = await db.collection("users").updateOne(
      { phone },
      { $set: update }
    );

    if (result.matchedCount === 0) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("Profile PATCH error:", err);
    return NextResponse.json({ error: "Update failed" }, { status: 500 });
  }
}
