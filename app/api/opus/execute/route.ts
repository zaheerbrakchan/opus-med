
import { NextResponse } from "next/server";

 const OPUS_API_KEY = process.env.OPUS_API_KEY;

const WORKFLOW_INPUT_KEY = process.env.WORKFLOW_INPUT_KEY;

if (!OPUS_API_KEY) {
  throw new Error("Missing OPUS_API_KEY environment variable");
}
if (!WORKFLOW_INPUT_KEY) {
  throw new Error("Missing WORKFLOW_INPUT_KEY environment variable");
}

export async function POST(req: Request) {
  try {
    const { jobExecutionId, fileUrls } = await req.json();

    console.log("EXECUTE PAYLOAD:", { jobExecutionId, fileUrls });

    if (!jobExecutionId || !fileUrls?.length) {
      return NextResponse.json(
        { error: "Missing jobExecutionId or fileUrls[]" },
        { status: 400 }
      );
    }

    const res = await fetch("https://operator.opus.com/job/execute", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-service-key": String(OPUS_API_KEY),
      },
      body: JSON.stringify({
        jobExecutionId,
        jobPayloadSchemaInstance: {
          [String(WORKFLOW_INPUT_KEY)]: {
            value: fileUrls,
            type: "array_files",
          },
        },
      }),
    });

    console.log("EXECUTE RAW RESPONSE STATUS:", res.status);

    const json = await res.json();
    console.log("EXECUTE RESPONSE JSON:", json);

    return NextResponse.json(json);

  } catch (err) {
    console.error("EXECUTE ERROR:", err);
    return NextResponse.json(
      { error: "Execute failed", detail: String(err) },
      { status: 500 }
    );
  }
}
