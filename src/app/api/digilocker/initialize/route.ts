import { NextRequest, NextResponse } from "next/server";

const BASE = process.env.SUREPASS_BASE_URL || "https://kyc-api.surepass.app";
const TOKEN = process.env.SUREPASS_TOKEN;
const REDIRECT = process.env.SUREPASS_REDIRECT_URL || "";

/// POST /api/digilocker/initialize
/// Starts a DigiLocker session (token stays server-side) and returns Surepass's
/// response (data.client_id + the hosted URL the app opens) along with the
/// redirect_url the app should watch for to detect completion.
export async function POST(req: NextRequest) {
  try {
    if (!TOKEN) {
      return NextResponse.json(
        { error: "DigiLocker is not configured (missing SUREPASS_TOKEN)" },
        { status: 500 }
      );
    }
    // Allow the caller to override branding/flow flags if needed.
    const body = await req.json().catch(() => ({}));
    const data = {
      signup_flow: true,
      skip_main_screen: false,
      ...(REDIRECT ? { redirect_url: REDIRECT } : {}),
      ...(body?.data ?? {}),
    };

    const res = await fetch(`${BASE}/api/v1/digilocker/initialize`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${TOKEN}`,
      },
      body: JSON.stringify({ data }),
    });

    const sp = await res.json().catch(() => ({}));
    return NextResponse.json({ ...sp, redirect_url: REDIRECT }, {
      status: res.status,
    });
  } catch (err) {
    console.error("DigiLocker initialize error:", err);
    return NextResponse.json(
      { error: "DigiLocker initialization failed" },
      { status: 500 }
    );
  }
}
