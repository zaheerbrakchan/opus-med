import { NextResponse } from "next/server";

export async function POST(req: Request) {
  const form = await req.formData();

  // Your Opus Service Key (x-service-key)
 const OPUS_API_KEY = process.env.OPUS_API_KEY;

  // Correct Workflow ID from your URL
  const WORKFLOW_ID = process.env.WORKFLOW_ID;

  if (!OPUS_API_KEY) {
  throw new Error("Missing OPUS_API_KEY environment variable");
}

if (!WORKFLOW_ID) {
  throw new Error("Missing WORKFLOW_ID environment variable");
}

  const opusForm = new FormData();

  // forward uploaded files to Opus
  const files = form.getAll("patient_documents") as File[];
  files.forEach((file) => opusForm.append("patient_documents", file));

  // additional workflow inputs
  opusForm.append("input", JSON.stringify({ source: "frontend" }));

  // correct Opus API URL + correct header
  const response = await fetch(
    `https://operator.opus.com/v1/${String(WORKFLOW_ID)}/jobs`,
    {
      method: "POST",
      headers: {
        "x-service-key": String(OPUS_API_KEY),
      },
      body: opusForm,
    }
  );

  const result = await response.json();

  console.log("RAW OPUS RESPONSE ____________ → ", result);

  return NextResponse.json(result);
}
