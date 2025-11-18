"use client";

import React, { useEffect, useState } from "react";
import { ChevronDown, ChevronUp } from "lucide-react";

type OpusRaw = {
  jobResultsPayloadSchema: Record<
    string,
    {
      variable_name?: string;
      display_name?: string;
      value?: any;
    }
  >;
};

export default function Results() {
  const [data, setData] = useState<any>(null);

  // track open state for all sections (including right column)
  const [openSections, setOpenSections] = useState<Record<string, boolean>>({
    patient: true,
    clinical: true,
    delivery: true,
    contact: true,
    finalLevel: true,
    finalSummary: true,
  });

  useEffect(() => {
    const stored = localStorage.getItem("opus_result");
    if (!stored) return;

    try {
      const parsed: OpusRaw = JSON.parse(stored);
      const schema = parsed.jobResultsPayloadSchema || {};
      const normalized: Record<string, any> = {};

      Object.values(schema).forEach((entry: any) => {
        const varName = (entry.variable_name || "").toLowerCase();
        const dispName = (entry.display_name || "").toLowerCase();
        const value = entry.value;

        if (varName) normalized[varName] = value;
        if (dispName) normalized[dispName] = value;
      });

      const findByKeywords = (...keywords: string[]) => {
        const key = Object.keys(schema).find((k) => {
          const e = schema[k];
          const combined = `${(e.variable_name || "")} ${(e.display_name || "")}`.toLowerCase();
          return keywords.every((kw) => combined.includes(kw.toLowerCase()));
        });
        return key ? schema[key].value : undefined;
      };

      const result: any = {
        patient_name:
          normalized["patient_name"] ||
          normalized["workflow_output_dtscli1gj"] ||
          findByKeywords("patient", "name"),
        address:
          normalized["address"] ||
          normalized["workflow_output_xoxkt942p"] ||
          findByKeywords("address"),
        symptom_list:
          normalized["symptom_list"] ||
          normalized["workflow_output_nbfq9d3gv"] ||
          findByKeywords("symptom", "list"),
        date_of_birth:
          normalized["date_of_birth"] ||
          normalized["workflow_output_uldpmv6zk"] ||
          findByKeywords("date", "birth"),
        contact_number:
          normalized["contact_number"] ||
          normalized["workflow_output_xo4npvsgw"] ||
          findByKeywords("contact", "number"),
        insurance_number:
          normalized["insurance_number"] ||
          normalized["workflow_output_l7ew88e9v"] ||
          findByKeywords("insurance", "number"),
        primary_complaint:
          normalized["primary_complaint"] ||
          normalized["workflow_output_z54c5uxt5"] ||
          findByKeywords("primary", "complaint"),
        delivered_to:
          normalized["delivered_to"] ||
          findByKeywords("delivered", "to"),
        delivery_status:
          normalized["delivery_status"] ||
          findByKeywords("delivery", "status"),
        final_level:
          normalized["workflow_output_mqwzthhuv"] ||
          normalized["final_level"] ||
          findByKeywords("final", "level"),
        final_summary:
          normalized["workflow_output_liqneup3o"] ||
          normalized["final_summary"] ||
          findByKeywords("final", "summary"),
      };

      if (result.symptom_list && !Array.isArray(result.symptom_list)) {
        if (typeof result.symptom_list === "string") {
          result.symptom_list = result.symptom_list
            .split(/[,;]\s*/)
            .map((s: string) => s.trim())
            .filter(Boolean);
        } else {
          result.symptom_list = [result.symptom_list];
        }
      }

      Object.keys(result).forEach((k) => {
        if (result[k] === "") result[k] = undefined;
      });

      setData(result);
      // keep default openSections as defined in useState
    } catch (err) {
      console.log("❌ Failed to parse", err);
    }
  }, []);

  function colorForLevel(level?: string) {
    const l = (level || "").toLowerCase();
    if (l.includes("critical") || l.includes("emergency")) return "bg-red-100 text-red-700";
    if (l.includes("urgent")) return "bg-amber-100 text-amber-800";
    if (l.includes("non") || l.includes("routine") || l.includes("low")) return "bg-green-100 text-green-800";
    return "bg-gray-100 text-gray-800";
  }

  function toggleSection(key: string) {
    setOpenSections((s) => ({ ...s, [key]: !s[key] }));
  }

  if (!data) {
    return (
      <main className="min-h-[65vh] flex items-center justify-center text-[#103b73]">
        No results found.
      </main>
    );
  }

  return (
    <main className="min-h-[75vh] flex justify-center px-4 py-8 bg-[#f7fafc]">
      <div className="w-full max-w-5xl space-y-6">
        {/* Centered header */}
        <div className="bg-white border border-[#e6eef6] rounded-2xl shadow p-6 text-center">
          <h1 className="text-3xl font-semibold text-[#103b73]">Patient Summary</h1>
        </div>

        {/* main grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="md:col-span-2 space-y-4">
            {/* Patient */}
            <section className="bg-white border border-[#e6eef6] rounded-xl p-4">
              <header className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-[#103b73]">Patient</h3>
                <button
                  onClick={() => toggleSection("patient")}
                  className="p-2 rounded-md bg-white border border-gray-200 hover:bg-gray-50 shadow-sm"
                  aria-label="Toggle Patient section"
                >
                  {openSections.patient ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
                </button>
              </header>

              {openSections.patient && (
<div className="mt-3 text-sm text-[#2a2f3a] space-y-2">

  <div className="flex gap-3">
    <span className="w-40 text-gray-600">Name :</span>
    <span className="ml-2">{data.patient_name ?? "Not provided"}</span>
  </div>

  <div className="flex gap-3">
    <span className="w-40 text-gray-600">Date of birth :</span>
    <span className="ml-2">{data.date_of_birth ?? "Not provided"}</span>
  </div>

  <div className="flex gap-3">
    <span className="w-40 text-gray-600">Contact number :</span>
    <span className="ml-2">{data.contact_number ?? "Not provided"}</span>
  </div>

  <div className="flex gap-3">
    <span className="w-40 text-gray-600">Insurance number :</span>
    <span className="ml-2">{data.insurance_number ?? "Not provided"}</span>
  </div>

</div>


              )}
            </section>

            {/* Clinical */}
            <section className="bg-white border border-[#e6eef6] rounded-xl p-4">
              <header className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-[#103b73]">Clinical</h3>
                <button
                  onClick={() => toggleSection("clinical")}
                  className="p-2 rounded-md bg-white border border-gray-200 hover:bg-gray-50 shadow-sm"
                  aria-label="Toggle Clinical section"
                >
                  {openSections.clinical ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
                </button>
              </header>

              {openSections.clinical && (
                <div className="mt-3 text-sm text-[#2a2f3a] space-y-3">
                  <div><strong>Primary complaint:</strong> {data.primary_complaint ?? "Not provided"}</div>

                  <div>
                    <strong>Symptom list:</strong>
                    {Array.isArray(data.symptom_list) && data.symptom_list.length > 0 ? (
                      <ul className="list-disc ml-6 mt-1 space-y-1">
                        {data.symptom_list.map((s: string, i: number) => (
                          <li key={i}>{s}</li>
                        ))}
                      </ul>
                    ) : (
                      <div className="ml-0 text-sm text-gray-500 mt-1">No symptoms listed.</div>
                    )}
                  </div>
                </div>
              )}
            </section>

            {/* Delivery */}
            <section className="bg-white border border-[#e6eef6] rounded-xl p-4">
              <header className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-[#103b73]">Delivery</h3>
                <button
                  onClick={() => toggleSection("delivery")}
                  className="p-2 rounded-md bg-white border border-gray-200 hover:bg-gray-50 shadow-sm"
                  aria-label="Toggle Delivery section"
                >
                  {openSections.delivery ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
                </button>
              </header>

              {openSections.delivery && (
                <div className="mt-3 text-sm text-[#2a2f3a] space-y-2">
                  <div><strong>Delivered to:</strong> {Array.isArray(data.delivered_to) ? data.delivered_to.join(", ") : data.delivered_to ?? "Not provided"}</div>
                  <div><strong>Delivery status:</strong> {data.delivery_status ?? "Not provided"}</div>
                </div>
              )}
            </section>
          </div>

          {/* right column */}
          <aside className="space-y-4">
            <section className="bg-white border border-[#e6eef6] rounded-xl p-4">
              <header className="flex items-center justify-between">
                <h4 className="text-sm font-semibold text-[#103b73]">Contact & Address</h4>
                <button
                  onClick={() => toggleSection("contact")}
                  className="p-2 rounded-md bg-white border border-gray-200 hover:bg-gray-50 shadow-sm"
                  aria-label="Toggle Contact section"
                >
                  {openSections.contact ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
                </button>
              </header>

              {openSections.contact && <p className="mt-2 text-sm text-[#2a2f3a]">{data.address ?? "Not provided"}</p>}
            </section>

            <section className="bg-white border border-[#e6eef6] rounded-xl p-4">
              <header className="flex items-center justify-between">
                <h4 className="text-sm font-semibold text-[#103b73]">Final Level</h4>
                <button
                  onClick={() => toggleSection("finalLevel")}
                  className="p-2 rounded-md bg-white border border-gray-200 hover:bg-gray-50 shadow-sm"
                  aria-label="Toggle Final Level section"
                >
                  {openSections.finalLevel ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
                </button>
              </header>

              {openSections.finalLevel && (
                <div className="mt-2">
                  <div className={`inline-block px-3 py-2 rounded-md text-sm font-medium ${colorForLevel(data.final_level)}`}>
                    {data.final_level ?? "Not provided"}
                  </div>
                </div>
              )}
            </section>

            <section className="bg-white border border-[#e6eef6] rounded-xl p-4">
              <header className="flex items-center justify-between">
                <h4 className="text-sm font-semibold text-[#103b73]">Final Summary</h4>
                <button
                  onClick={() => toggleSection("finalSummary")}
                  className="p-2 rounded-md bg-white border border-gray-200 hover:bg-gray-50 shadow-sm"
                  aria-label="Toggle Final Summary section"
                >
                  {openSections.finalSummary ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
                </button>
              </header>

              {openSections.finalSummary && (
                <p className="mt-2 text-sm text-[#2a2f3a] leading-relaxed">{data.final_summary ?? "No final summary provided."}</p>
              )}
            </section>
          </aside>
        </div>
      </div>
    </main>
  );
}
