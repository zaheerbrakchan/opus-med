import { NextResponse } from "next/server";

 const OPUS_API_KEY = process.env.OPUS_API_KEY;

 if (!OPUS_API_KEY) {
  throw new Error("Missing OPUS_API_KEY environment variable");
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const jobId = body.jobId;

    const response = await fetch(
      `https://operator.opus.com/job/${jobId}/results`,
      {
        method: "GET",
        headers: {
          "x-service-key": String(OPUS_API_KEY)
        }
      }
    );

    const json = await response.json();

    console.log("🟦 RAW OPUS RESULT:", JSON.stringify(json, null, 2));

    return NextResponse.json(json);
  } catch (err) {
    console.error("❌ RESULTS API ERROR:", err);
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}
