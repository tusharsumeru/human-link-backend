import { NextRequest, NextResponse } from "next/server";
import { getDb } from "@/lib/mongodb";

/// GET /api/auth/file?phone=...&type=selfie|id|familyDoc
/// Returns the stored image as binary so it can be loaded with a normal
/// <img>/Image.network from anywhere.
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const phone = searchParams.get("phone");
    const type = searchParams.get("type");

    if (!phone || !type) {
      return NextResponse.json(
        { error: "phone and type are required" },
        { status: 400 }
      );
    }

    const db = await getDb();
    const doc = await db.collection("userFiles").findOne({ phone, type });
    if (!doc || !doc.data) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    const buffer = Buffer.from(doc.data as string, "base64");
    return new NextResponse(new Uint8Array(buffer), {
      status: 200,
      headers: {
        "Content-Type": (doc.contentType as string) || "image/jpeg",
        "Cache-Control": "public, max-age=3600",
      },
    });
  } catch (err) {
    console.error("File GET error:", err);
    return NextResponse.json({ error: "Failed to load file" }, { status: 500 });
  }
}
