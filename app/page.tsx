"use client";

import { useState, useRef } from "react";
import { UploadCloud, File as FileIcon, X } from "lucide-react";
import { useRouter } from "next/navigation";

export default function UploadPage() {
  const router = useRouter();
  const fileRef = useRef<HTMLInputElement | null>(null);
  // explicit DOM File type
  const [files, setFiles] = useState<Array<File>>([]);

  function addFiles(list: FileList | null) {
    if (!list) return;
    setFiles((prev) => [...prev, ...Array.from(list)]);
  }

  return (
    <div className="max-w-3xl mx-auto mt-12 space-y-10">
      {/* Title Section */}
      <div className="text-center space-y-3">
        <h1 className="text-4xl font-bold text-[#103b73]">
          Upload Your Medical Documents
        </h1>
        <p className="text-soft text-lg">
          Opus AI will extract insights with clinical-grade accuracy.
        </p>
      </div>

      {/* Upload Box Wrapper */}
      <div className="bg-white rounded-2xl border border-[#e6edf5] shadow-sm p-10">
        <div
          className="dropzone cursor-pointer h-56 flex flex-col justify-center"
          onClick={() => fileRef.current?.click()}
          onDragOver={(e) => e.preventDefault()}
          onDrop={(e) => {
            e.preventDefault();
            addFiles(e.dataTransfer.files);
          }}
        >
          <UploadCloud className="w-12 h-12 mx-auto text-[#6a7c90]" />
          <p className="mt-3 text-lg font-medium">Drop files here</p>
          <p className="text-soft text-sm">or click to browse</p>

          <input
            type="file"
            multiple
            ref={fileRef}
            className="hidden"
            onChange={(e) => addFiles(e.target.files)}
            accept="application/pdf"
          />
        </div>

        {/* File List */}
        <div className="mt-6 space-y-3">
          {files.map((f, i) => (
            <div key={i} className="file-item flex items-center justify-between">
              <div className="flex items-center gap-3 text-soft">
                <FileIcon className="w-5" />
                <span className="font-medium">{f.name}</span>
              </div>

              <button
                onClick={() => setFiles((prev) => prev.filter((_, x) => x !== i))}
                className="hover:text-red-500 transition"
              >
                <X className="w-4" />
              </button>
            </div>
          ))}
        </div>

        {/* Start Button */}
        <button
          className="btn btn-primary w-full text-lg mt-8 py-4 rounded-xl shadow-sm cursor-pointer"
          onClick={async () => {
            if (files.length === 0) return alert("Please upload at least one file!");

            try {
              /** ------------------------------------
               * 1. INITIATE JOB
               * -----------------------------------**/
              const initRes = await fetch("/api/opus/initiate", { method: "POST" });
              if (!initRes.ok) {
                const t = await initRes.text();
                console.error("Initiate failed:", t);
                return alert("Failed to initiate job. Check console.");
              }
              const { jobExecutionId } = await initRes.json();
              console.log("Job Initiated:", jobExecutionId);

              const uploadedFileUrls: string[] = [];

              /** ------------------------------------
               * 2. UPLOAD EACH FILE (server-proxied)
               * -----------------------------------**/
              for (const file of files) {
                const fd = new FormData();
                fd.append("file", file);

                // call server route that does presign + PUT to S3 (server-side)
                const uploadRes = await fetch("/api/opus/upload-url", {
                  method: "POST",
                  body: fd,
                });

                if (!uploadRes.ok) {
                  const text = await uploadRes.text();
                  console.error("Upload proxy failed:", text);
                  return alert("Upload failed. Check server logs.");
                }

                const uploadJson = await uploadRes.json();
                console.log("UPLOAD PROXY RESPONSE:", uploadJson);

                // File URL may be returned directly or inside presignResponse; try common keys
                const fileUrl =
                  uploadJson.fileUrl ??
                  uploadJson.file_url ??
                  uploadJson.presignResponse?.fileUrl ??
                  uploadJson.presignResponse?.file_url ??
                  uploadJson.presignedUrl; // in some flows fileUrl==presigned URL (rare)

                if (!fileUrl) {
                  console.error("No fileUrl returned by upload proxy:", uploadJson);
                  return alert("Upload succeeded but no file URL returned from server.");
                }

                uploadedFileUrls.push(fileUrl);
              }

              /** ------------------------------------
               * 3. EXECUTE WORKFLOW WITH fileUrls
               * -----------------------------------**/
              const execRes = await fetch("/api/opus/execute", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                  jobExecutionId,
                  fileUrls: uploadedFileUrls,
                }),
              });

              if (!execRes.ok) {
                const t = await execRes.text();
                console.error("Execute failed:", t);
                return alert("Failed to start workflow. Check console.");
              }

              /** ------------------------------------
               * 4. SAVE job ID → go to processing
               * -----------------------------------**/
              localStorage.setItem("opus_job_id", jobExecutionId);
              router.push("/processing");
            } catch (err) {
              console.error("Upload flow error:", err);
              alert("Error during upload flow. See console for details.");
            }
          }}
        >
          Start Analysis →
        </button>
      </div>
    </div>
  );
}
