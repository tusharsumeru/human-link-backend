import { NextRequest, NextResponse } from "next/server";

const BASE = process.env.SUREPASS_BASE_URL || "https://kyc-api.surepass.io";
const TOKEN = process.env.SUREPASS_TOKEN;

/// POST /api/aadhaar/generate-otp  body: { id_number: "12-digit aadhaar" }
/// Proxies to Surepass so the API token stays server-side. Returns Surepass's
/// response (which includes data.client_id used by submit-otp).
export async function POST(req: NextRequest) {
  try {
    if (!TOKEN) {
      return NextResponse.json(
        { error: "Aadhaar verification is not configured (missing SUREPASS_TOKEN)" },
        { status: 500 }
      );
    }
    const { id_number } = await req.json();
    if (!id_number || String(id_number).replace(/\D/g, "").length !== 12) {
      return NextResponse.json(
        { error: "A valid 12-digit Aadhaar number is required" },
        { status: 400 }
      );
    }

    const res = await fetch(`${BASE}/api/v1/aadhaar-v2/generate-otp`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${TOKEN}`,
      },
      body: JSON.stringify({ id_number: String(id_number).replace(/\D/g, "") }),
    });

    const data = await res.json().catch(() => ({}));
    return NextResponse.json(data, { status: res.status });
  } catch (err) {
    console.error("Aadhaar generate-otp error:", err);
    return NextResponse.json({ error: "Aadhaar OTP generation failed" }, { status: 500 });
  }
}
