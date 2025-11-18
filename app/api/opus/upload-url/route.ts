

import { NextResponse } from "next/server";

  // Your Opus Service Key (x-service-key)
 const OPUS_API_KEY = process.env.OPUS_API_KEY;

 if (!OPUS_API_KEY) {
  throw new Error("Missing OPUS_API_KEY environment variable");
}

export async function POST() {
  const res = await fetch("https://operator.opus.com/job/file/upload", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-service-key": String(OPUS_API_KEY),
    },
    body: JSON.stringify({
      fileExtension: ".pdf",
      accessScope: "organization",
    }),
  });

  const json = await res.json(); // { presignedUrl, fileUrl }
  

  console.log("🔍 upload url:", json);
  return NextResponse.json(json);
}
