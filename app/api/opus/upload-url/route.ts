// app/api/opus/upload/route.ts
import { NextResponse } from "next/server";

const OPUS_API_KEY = process.env.OPUS_API_KEY;
if (!OPUS_API_KEY) {
  throw new Error("Missing OPUS_API_KEY environment variable");
}

export async function POST(req: Request) {
  try {
    // Read incoming formData (file from browser)
    const form = await req.formData();
    const file = form.get("file") as File | null;

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

    // 1) Ask Opus for presigned upload URL
    const presignRes = await fetch("https://operator.opus.com/job/file/upload", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-service-key": String(OPUS_API_KEY),
      },
      body: JSON.stringify({
        fileExtension: ".pdf",
        accessScope: "organization",
        // optional: filename or mime_type if Opus supports it
        filename: (file as any).name ?? "upload.pdf",
        mime_type: (file as any).type ?? "application/pdf",
      }),
    });

    if (!presignRes.ok) {
      const text = await presignRes.text();
      console.error("Presign error:", text);
      return NextResponse.json({ error: "Failed to get presigned URL", details: text }, { status: 500 });
    }

    const presignJson = await presignRes.json();
    // presignJson usually contains something like: { presignedUrl, fileUrl } or { uploadUrl, fileKey } depending on Opus
    // We'll try to detect the fields:
    const presignedUrl = presignJson.presignedUrl ?? presignJson.uploadUrl ?? presignJson.uploadUrlSigned ?? presignJson.upload_url;
    const fileUrl = presignJson.fileUrl ?? presignJson.fileUrl ?? presignJson.fileUrl ?? presignJson.file_url ?? presignJson.fileUrl;

    if (!presignedUrl) {
      console.error("No presigned URL in response:", presignJson);
      return NextResponse.json({ error: "No presigned URL returned by Opus", details: presignJson }, { status: 500 });
    }

    // 2) Upload to S3 server-side
    // Convert file (web File) to ArrayBuffer and send as body
    const arrayBuffer = await file.arrayBuffer();

    const uploadRes = await fetch(String(presignedUrl), {
      method: "PUT",
      // S3 presigned PUT usually expects Content-Type header to match original MIME
      headers: {
        "Content-Type": (file as any).type || "application/pdf"
        // do NOT set CORS headers here; server-side calls don't need CORS.
      },
      body: arrayBuffer,
    });

    if (!uploadRes.ok) {
      const text = await uploadRes.text();
      console.error("S3 upload failed:", uploadRes.status, text);
      return NextResponse.json({ error: "S3 upload failed", details: text }, { status: 500 });
    }

    // return the public file URL (or fileKey) to the client
    return NextResponse.json({
      fileUrl: fileUrl ?? presignJson.fileKey ?? null,
      presignResponse: presignJson,
    });
  } catch (err) {
    console.error("UPLOAD PROXY ERROR:", err);
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}
