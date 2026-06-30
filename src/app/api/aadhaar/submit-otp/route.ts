import { NextRequest, NextResponse } from "next/server";

const BASE = process.env.SUREPASS_BASE_URL || "https://kyc-api.surepass.io";
const TOKEN = process.env.SUREPASS_TOKEN;

/// POST /api/aadhaar/submit-otp  body: { client_id, otp }
/// Proxies to Surepass. On success returns the verified Aadhaar KYC data
/// (full_name, dob, gender, address, etc.).
export async function POST(req: NextRequest) {
  try {
    if (!TOKEN) {
      return NextResponse.json(
        { error: "Aadhaar verification is not configured (missing SUREPASS_TOKEN)" },
        { status: 500 }
      );
    }
    const { client_id, otp } = await req.json();
    if (!client_id || !otp) {
      return NextResponse.json(
        { error: "client_id and otp are required" },
        { status: 400 }
      );
    }

    const res = await fetch(`${BASE}/api/v1/aadhaar-v2/submit-otp`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${TOKEN}`,
      },
      body: JSON.stringify({ client_id, otp: String(otp) }),
    });

    const data = await res.json().catch(() => ({}));
    return NextResponse.json(data, { status: res.status });
  } catch (err) {
    console.error("Aadhaar submit-otp error:", err);
    return NextResponse.json({ error: "Aadhaar OTP verification failed" }, { status: 500 });
  }
}
