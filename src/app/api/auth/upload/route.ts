import { NextRequest, NextResponse } from "next/server";
import { getDb } from "@/lib/mongodb";

/// POST /api/auth/upload
/// Body: { phone, type: "selfie"|"id"|"familyDoc", data: base64, contentType? }
/// Stores the image (base64) in the `userFiles` collection, keyed by
/// phone+type. For a selfie it also sets `users.photoUrl` so the profile photo
/// follows the user across devices.
export async function POST(req: NextRequest) {
  try {
    const { phone, type, data, contentType } = await req.json();

    if (!phone || !type || !data) {
      return NextResponse.json(
        { error: "phone, type and data are required" },
        { status: 400 }
      );
    }

    const db = await getDb();
    await db.collection("userFiles").updateOne(
      { phone, type },
      {
        $set: {
          phone,
          type,
          data,
          contentType: contentType || "image/jpeg",
          updatedAt: new Date(),
        },
      },
      { upsert: true }
    );

    const url = `/api/auth/file?phone=${encodeURIComponent(
      phone
    )}&type=${encodeURIComponent(type)}`;

    if (type === "selfie") {
      await db
        .collection("users")
        .updateOne({ phone }, { $set: { photoUrl: url, updatedAt: new Date() } });
    }

    return NextResponse.json({ success: true, url });
  } catch (err) {
    console.error("Upload error:", err);
    return NextResponse.json({ error: "Upload failed" }, { status: 500 });
  }
}
