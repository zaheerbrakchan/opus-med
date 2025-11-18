"use client";

import React, { useEffect, useState } from "react";

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
    } catch (err) {
      console.log("❌ Failed to parse", err);
    }
  }, []);

  if (!data) {
    return (
      <main className="min-h-[75vh] flex items-center justify-center text-[#103b73]">
        No results found.
      </main>
    );
  }

  return (
    <main className="min-h-[75vh] flex justify-center px-4 py-8 bg-[#f8fafc]">
      <div className="w-full max-w-4xl space-y-12">

        {/* Centered Heading */}
        <div className="bg-white border border-[#e5e9f0] rounded-2xl shadow p-8 text-center">
          <h1 className="text-3xl font-semibold text-[#103b73]">Patient Summary</h1>
          <p className="mt-2 text-[#6c7b8a]">Extracted from workflow output.</p>
        </div>

        {/* Patient */}
        <div className="bg-white border border-[#e5e9f0] rounded-xl p-6 shadow-sm">
          <h3 className="font-semibold mb-4 text-[#103b73] text-lg">Patient</h3>

          <div className="text-sm text-[#2a2f3a] space-y-2">
            <div><strong>Patient Name:</strong> {data.patient_name ?? "Not provided"}</div>
            <div><strong>Date of Birth:</strong> {data.date_of_birth ?? "Not provided"}</div>
            <div><strong>Contact Number:</strong> {data.contact_number ?? "Not provided"}</div>
            <div><strong>Insurance Number:</strong> {data.insurance_number ?? "Not provided"}</div>
          </div>
        </div>

        {/* Clinical */}
        <div className="bg-white border border-[#e5e9f0] rounded-xl p-6 shadow-sm">
          <h3 className="font-semibold mb-4 text-[#103b73] text-lg">Clinical</h3>

          <div className="text-sm text-[#2a2f3a] space-y-3">
            <div><strong>Primary Complaint:</strong> {data.primary_complaint ?? "Not provided"}</div>

            <div>
              <strong>Symptom List:</strong>
              {Array.isArray(data.symptom_list) && data.symptom_list.length > 0 ? (
                <ul className="list-disc ml-6 mt-1">
                  {data.symptom_list.map((s: string, i: number) => (
                    <li key={i}>{s}</li>
                  ))}
                </ul>
              ) : (
                <span className="ml-2 text-gray-500">No symptoms listed.</span>
              )}
            </div>
          </div>
        </div>

        {/* Contact & Address */}
        <div className="bg-white border border-[#e5e9f0] rounded-xl p-6 shadow-sm">
          <h3 className="font-semibold mb-4 text-[#103b73] text-lg">Contact & Address</h3>

          <p className="text-sm text-[#2a2f3a]">
            <strong>Address:</strong> {data.address ?? "Not provided"}
          </p>
        </div>

        {/* Delivery */}
        <div className="bg-white border border-[#e5e9f0] rounded-xl p-6 shadow-sm">
          <h3 className="font-semibold mb-4 text-[#103b73] text-lg">Delivery</h3>

          <p className="text-sm text-[#2a2f3a] mb-1">
            <strong>Delivered To:</strong>{" "}
            {Array.isArray(data.delivered_to)
              ? data.delivered_to.join(", ")
              : data.delivered_to ?? "Not provided"}
          </p>

          <p className="text-sm text-[#2a2f3a]">
            <strong>Delivery Status:</strong> {data.delivery_status ?? "Not provided"}
          </p>
        </div>

        {/* Final Level */}
        <div className="bg-white border border-[#e5e9f0] rounded-xl p-6 shadow-sm">
          <h3 className="font-semibold mb-4 text-[#103b73] text-lg">Final Level</h3>
          <p className="text-sm text-[#2a2f3a]">
            {data.final_level ?? "Not provided"}
          </p>
        </div>

        {/* Final Summary */}
        <div className="bg-white border border-[#e5e9f0] rounded-xl p-6 shadow-sm">
          <h3 className="font-semibold mb-4 text-[#103b73] text-lg">Final Summary</h3>
          <p className="text-sm text-[#2a2f3a] leading-relaxed">
            {data.final_summary ?? "No final summary provided."}
          </p>
        </div>

      </div>
    </main>
  );
}
