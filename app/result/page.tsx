"use client";

import React, { useState } from "react";
//import { ChevronDown, DocumentText, Heart, Pill } from "lucide-react";
import { ChevronDown, FileText, Heart, Pill } from "lucide-react";

const sample = {
  patient: { name: "John Doe", age: 49, sex: "Male" },
  conditions: ["Type 2 Diabetes", "Hypertension"],
  latest_lab_values: { HbA1c: "8.4%", LDL: "165 mg/dL" },
  medications: [
    { name: "Metformin", dose: "500 mg", frequency: "2x daily" },
    { name: "Amlodipine", dose: "5 mg", frequency: "1x daily" },
  ],
  red_flags: ["Elevated HbA1c", "High LDL"],
  doctor_summary:
    "Patient shows elevated HbA1c and LDL; recommend medication adjustment and cardiology follow-up.",
};

export default function Results() {
  const [showJson, setShowJson] = useState(false);

  return (
    <main className="min-h-[75vh] flex justify-center px-4">
      <div className="w-full max-w-5xl space-y-10">

        {/* Header Card */}
        <div className="bg-white border border-[#e5e9f0] rounded-2xl shadow p-6 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-semibold text-[#103b73]">Results</h1>
            <p className="mt-1 text-[#6c7b8a]">Insights extracted from your uploaded documents</p>
          </div>

          <div className="flex items-center gap-3">
            <button className="bg-[#3b82f6] text-white px-5 py-2 rounded-lg shadow hover:bg-[#2563eb]">
              Export PDF
            </button>
            <button className="bg-white border px-4 py-2 rounded-lg text-[#103b73] font-medium">
              Share
            </button>
          </div>
        </div>

        {/* Info Cards Section */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">

          {/* Patient Info */}
          <div className="bg-white border border-[#e5e9f0] rounded-xl p-5 shadow-sm">
            <h3 className="font-semibold mb-3 flex items-center gap-2 text-[#103b73]">
              <FileText className="w-5 h-5" />
 Patient Info
            </h3>
            <div className="text-sm text-[#2a2f3a] space-y-1">
              <div><strong>Name:</strong> {sample.patient.name}</div>
              <div><strong>Age:</strong> {sample.patient.age}</div>
              <div><strong>Sex:</strong> {sample.patient.sex}</div>
            </div>
          </div>

          {/* Conditions */}
          <div className="bg-white border border-[#e5e9f0] rounded-xl p-5 shadow-sm">
            <h3 className="font-semibold mb-3 flex items-center gap-2 text-[#103b73]">
              <Heart className="w-5 h-5" /> Conditions & Red Flags
            </h3>

            <div className="space-y-2 text-sm">
              {sample.conditions.map((c) => (
                <div key={c} className="text-[#2a2f3a]">• {c}</div>
              ))}
            </div>

            <div className="mt-3">
              {sample.red_flags.map((r) => (
                <span
                  key={r}
                  className="inline-block mr-2 mt-1 px-3 py-1 rounded-full text-sm bg-red-100 text-red-700"
                >
                  {r}
                </span>
              ))}
            </div>
          </div>

          {/* Medications */}
          <div className="bg-white border border-[#e5e9f0] rounded-xl p-5 shadow-sm">
            <h3 className="font-semibold mb-3 flex items-center gap-2 text-[#103b73]">
              <Pill className="w-5 h-5" /> Medications
            </h3>

            <div className="space-y-2 text-sm text-[#2a2f3a]">
              {sample.medications.map((m) => (
                <div key={m.name}>
                  <strong>{m.name}</strong> — {m.dose} • {m.frequency}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Summary Card */}
        <div className="bg-white border border-[#e5e9f0] rounded-2xl p-6 shadow">
          <h3 className="font-semibold text-[#103b73]">Doctor Summary</h3>

          <p className="mt-3 text-[#2a2f3a] leading-relaxed">
            {sample.doctor_summary}
          </p>

          <div className="mt-5 flex items-center justify-between">
            <p className="text-sm text-[#6c7b8a]">Patient-friendly summary available</p>

            <button
              onClick={() => setShowJson(!showJson)}
              className="flex items-center gap-2 bg-white border px-3 py-2 rounded-lg text-sm text-[#103b73]"
            >
              Raw JSON
              <ChevronDown
                className={`w-4 h-4 transition-transform ${
                  showJson ? "rotate-180" : ""
                }`}
              />
            </button>
          </div>

          {showJson && (
            <pre className="mt-4 bg-[#f5f9fc] border border-[#e5e9f0] p-4 rounded-lg text-sm max-h-80 overflow-auto">
              {JSON.stringify(sample, null, 2)}
            </pre>
          )}
        </div>
      </div>
    </main>
  );
}
