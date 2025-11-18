
import { NextResponse } from "next/server";

 const OPUS_API_KEY = process.env.OPUS_API_KEY;

const WORKFLOW_ID = process.env.WORKFLOW_ID;

if (!OPUS_API_KEY) {
  throw new Error("Missing OPUS_API_KEY environment variable");
}

if (!WORKFLOW_ID) {
  throw new Error("Missing WORKFLOW_ID environment variable");
}

export async function POST() {
  try {
    const res = await fetch("https://operator.opus.com/job/initiate", {
      method: "POST",
      headers: {
        "x-service-key": String(OPUS_API_KEY),
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        workflowId: String(WORKFLOW_ID),
        title: "Patient Document Processing",
        description: "Triggered from frontend",
      }),
    });

    const json = await res.json();

    console.log("🔍 initiate json:", json);
    return NextResponse.json(json);
  } catch (err) {
    console.error("INITIATE ERROR:", err);
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}
