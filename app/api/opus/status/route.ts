import { NextResponse } from "next/server";

 const OPUS_API_KEY = process.env.OPUS_API_KEY;

 if (!OPUS_API_KEY) {
  throw new Error("Missing OPUS_API_KEY environment variable");
}

export async function POST(req: Request) {
  try {
    const { jobId } = await req.json();   // ✅ use correct key

    if (!jobId) {
      return NextResponse.json(
        { error: "Missing jobId" },
        { status: 400 }
      );
    }

    const res = await fetch(
      `https://operator.opus.com/job/${jobId}/status`,
      {
        method: "GET",
        headers: {
          "x-service-key": String(OPUS_API_KEY),
        },
      }
    );

    const data = await res.json();

    console.log("🔍 RAW STATUS RESPONSE:", data);

    // ✅ Normalize status to uppercase
    const normalizedStatus =
      data.status?.toString().trim().toUpperCase() || "UNKNOWN";

    return NextResponse.json({
      status: normalizedStatus,
      raw: data,
    });
  } catch (err) {
    console.error("STATUS ERROR:", err);
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}
