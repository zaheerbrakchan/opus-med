"use client";
import { useState, useRef } from "react";
import { UploadCloud, File, X } from "lucide-react";
import { useRouter } from "next/navigation";

export default function UploadPage() {
  const router = useRouter();
  const fileRef = useRef<HTMLInputElement>(null);
  const [files, setFiles] = useState<File[]>([]);

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
          />
        </div>

        {/* File List */}
        <div className="mt-6 space-y-3">
          {files.map((f, i) => (
            <div key={i} className="file-item flex items-center justify-between">
              <div className="flex items-center gap-3 text-soft">
                <File className="w-5" />
                <span className="font-medium">{f.name}</span>
              </div>

              <button
                onClick={() =>
                  setFiles((prev) => prev.filter((_, x) => x !== i))
                }
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
            if (files.length === 0)
              return alert("Please upload at least one file!");

            /** ------------------------------------
             * 1. INITIATE JOB
             * -----------------------------------**/
            const initRes = await fetch("/api/opus/initiate", {
              method: "POST",
            });
            const { jobExecutionId } = await initRes.json();
            console.log("Job Initiated:", jobExecutionId);

            const uploadedFileUrls: string[] = [];

            /** ------------------------------------
             * 2. UPLOAD EACH FILE TO OPUS S3
             * -----------------------------------**/
            for (const file of files) {
              const urlRes = await fetch("/api/opus/upload-url", {
                method: "POST",
              });

              const data = await urlRes.json();
              console.log("UPLOAD URL RESPONSE:", data);

              const presignedUrl = data.presignedUrl;
              const fileUrl = data.fileUrl; // store this for execute

              // Upload file to S3 bucket
              await fetch(presignedUrl, {
                method: "PUT",
                headers: {
                  "Content-Type": file.type || "application/octet-stream",
                },
                body: file,
              });

              uploadedFileUrls.push(fileUrl);
            }

            /** ------------------------------------
             * 3. EXECUTE WORKFLOW WITH fileUrls
             * -----------------------------------**/
            await fetch("/api/opus/execute", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                jobExecutionId,
                fileUrls: uploadedFileUrls,
              }),
            });

            /** ------------------------------------
             * 4. SAVE job ID → go to processing
             * -----------------------------------**/
            localStorage.setItem("opus_job_id", jobExecutionId);
            router.push("/processing");
          }}
        >
          Start Analysis →
        </button>
      </div>
    </div>
  );
}
