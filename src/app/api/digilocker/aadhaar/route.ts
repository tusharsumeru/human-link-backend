import { NextRequest, NextResponse } from "next/server";

const BASE = process.env.SUREPASS_BASE_URL || "https://kyc-api.surepass.app";
const TOKEN = process.env.SUREPASS_TOKEN;

/// GET /api/digilocker/aadhaar?client_id=digilocker_xxx
/// Downloads the verified Aadhaar data for a completed DigiLocker session.
export async function GET(req: NextRequest) {
  try {
    if (!TOKEN) {
      return NextResponse.json(
        { error: "DigiLocker is not configured (missing SUREPASS_TOKEN)" },
        { status: 500 }
      );
    }
    const clientId = new URL(req.url).searchParams.get("client_id");
    if (!clientId) {
      return NextResponse.json({ error: "client_id is required" }, { status: 400 });
    }

    const res = await fetch(
      `${BASE}/api/v1/digilocker/download-aadhaar/${encodeURIComponent(clientId)}`,
      {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${TOKEN}`,
        },
      }
    );

    const data = await res.json().catch(() => ({}));
    return NextResponse.json(data, { status: res.status });
  } catch (err) {
    console.error("DigiLocker download-aadhaar error:", err);
    return NextResponse.json(
      { error: "Could not fetch Aadhaar data" },
      { status: 500 }
    );
  }
}
