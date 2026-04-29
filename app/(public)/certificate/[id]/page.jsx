"use client";

import { Button } from "@/components/ui/button";
import axios from "axios";
import { Award, Download, Printer, ShieldCheck } from "lucide-react";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";

export default function CertificateViewPage() {
  const { id } = useParams();
  const [cert, setCert] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const { data } = await axios.get(`/api/v1/certificates/verify/${id}`);
        if (data.success) setCert(data.certificate);
      } finally { setLoading(false); }
    })();
  }, [id]);

  if (loading) return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
  if (!cert) return <div className="min-h-screen flex items-center justify-center text-center">Certificate not found.</div>;

  const dateStr = new Date(cert.issuedAt).toLocaleDateString("en-US", {
    year: "numeric", month: "long", day: "numeric",
  });

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 to-violet-50 dark:from-gray-950 dark:to-indigo-950 py-10 px-4 print:p-0 print:bg-white">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center justify-end gap-2 mb-4 print:hidden">
          <Button variant="outline" onClick={() => window.print()}><Printer size={15} className="mr-1.5" /> Print</Button>
          <Button onClick={() => window.print()} className="bg-gradient-to-r from-indigo-500 to-violet-500 text-white">
            <Download size={15} className="mr-1.5" /> Save as PDF
          </Button>
        </div>

        {/* Certificate body */}
        <div className="relative rounded-2xl overflow-hidden bg-white shadow-2xl print:shadow-none print:rounded-none">
          {/* Border ornaments */}
          <div className="absolute inset-0 border-[12px] border-double border-indigo-200 m-3 rounded-xl pointer-events-none" />
          <div className="absolute top-0 left-0 right-0 h-2 bg-gradient-to-r from-indigo-500 via-violet-500 to-blue-500" />
          <div className="absolute bottom-0 left-0 right-0 h-2 bg-gradient-to-r from-blue-500 via-violet-500 to-indigo-500" />

          <div className="px-8 md:px-16 py-16 text-center">
            <div className="inline-block">
              <div className="text-xs font-bold tracking-[8px] text-indigo-600 uppercase mb-3">TPI CPC</div>
              <h1 className="text-3xl md:text-5xl font-extrabold text-gray-900 mb-1 font-serif">Certificate</h1>
              <p className="text-sm tracking-widest text-gray-500 uppercase">of {cert.type === "course" ? "Completion" : "Participation"}</p>
            </div>

            <div className="my-10 flex items-center justify-center">
              <div className="flex-1 border-t border-gray-300 max-w-[120px]" />
              <Award size={42} className="text-amber-500 mx-4" />
              <div className="flex-1 border-t border-gray-300 max-w-[120px]" />
            </div>

            <p className="text-sm text-gray-500 mb-3">This is to certify that</p>
            <h2 className="text-3xl md:text-4xl font-extrabold text-gray-900 mb-3 font-serif tracking-wide">{cert.recipientName}</h2>
            <p className="text-base text-gray-600 leading-relaxed max-w-2xl mx-auto">
              has successfully {cert.type === "course" ? "completed" : "participated in"}{" "}
              <strong className="text-indigo-700">"{cert.referenceTitle}"</strong>
              {cert.instructor && <> conducted by <strong>{cert.instructor}</strong></>}
              {cert.grade && <> with a grade of <strong>{cert.grade}</strong></>}
              {" "}organised by TPI CPC — Computer & Programming Club.
            </p>

            <div className="mt-12 grid grid-cols-2 gap-8 max-w-xl mx-auto text-left">
              <div>
                <div className="border-b border-gray-400 pb-1 mb-2 h-12 flex items-end font-serif italic text-2xl text-indigo-700">TPI CPC</div>
                <p className="text-xs text-gray-500 uppercase tracking-wider font-semibold">Authorised Signature</p>
              </div>
              <div>
                <div className="border-b border-gray-400 pb-1 mb-2 h-12 flex items-end font-bold text-gray-900 text-lg">{dateStr}</div>
                <p className="text-xs text-gray-500 uppercase tracking-wider font-semibold">Date Issued</p>
              </div>
            </div>

            <div className="mt-10 flex items-center justify-center gap-2 text-xs text-gray-500">
              <ShieldCheck size={14} className="text-green-500" />
              Certificate ID: <span className="font-mono font-semibold text-gray-700">{cert.number}</span>
            </div>
            <p className="mt-1 text-[11px] text-gray-400">Verify at {typeof window !== "undefined" && window.location.host}/certificate/{cert.number}</p>
          </div>
        </div>
      </div>
    </div>
  );
}
