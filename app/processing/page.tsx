"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";

export default function Processing() {
  const router = useRouter();

  const messages = [
    "Uploading files…",
    "Extracting text with OCR…",
    "Analyzing with Opus…",
    "Finalizing results…",
  ];

  const [step, setStep] = useState(0);

  useEffect(() => {
    // Cycle loading messages
    const msgInterval = setInterval(
      () => setStep((s) => (s + 1) % messages.length),
      1800
    );

    // Job ID saved after uploading documents
    const jobId = localStorage.getItem("opus_job_id");

    if (!jobId) {
      console.error("No job ID found — redirecting home");
      router.push("/");
      return;
    }

    async function pollOpus() {
      const res = await fetch("/api/opus/status", {
        method: "POST",
        body: JSON.stringify({ jobId }),
      });

      const data = await res.json();

      console.log("🔍 OPUS STATUS:", data);

      if (data.status === "COMPLETED") {
        // Fetch final results
        const resultRes = await fetch("/api/opus/results", {
          method: "POST",
          body: JSON.stringify({ jobId }),
        });

        const finalOutput = await resultRes.json();

        // Save for results page
        localStorage.setItem("opus_result", JSON.stringify(finalOutput));

        clearInterval(msgInterval);
        router.push("/results");
        return;
      }

      if (data.status === "FAILED") {
        clearInterval(msgInterval);
        router.push("/error");
        return;
      }

      if (data.status === "WAITING_FOR_REVIEW") {
        clearInterval(msgInterval);
        router.push("/review");
        return;
      }

      // Continue polling every 2 seconds
      setTimeout(pollOpus, 5000);
    }

    pollOpus();

    return () => clearInterval(msgInterval);
  }, []);

  return (
    <main className="flex items-center justify-center min-h-[75vh] px-4">
      <div className="bg-white rounded-2xl border border-[#e4e9f2] shadow-md p-10 w-full max-w-md text-center">

        <div className="relative flex flex-col items-center">
          <div className="w-16 h-16 rounded-full border-4 border-[#3b82f6]/20 flex items-center justify-center">
            <Loader2 className="w-6 h-6 text-[#2563eb] animate-spin" />
          </div>
        </div>

        <h2 className="mt-8 text-2xl font-semibold text-[#103b73]">
          Analyzing your documents…
        </h2>

        <p className="mt-3 text-[#6c7b8a] text-lg">
          {messages[step]}
        </p>

        <p className="mt-6 text-sm text-[#8fa1b4]">
          This usually takes a few seconds.
        </p>
      </div>
    </main>
  );
}
