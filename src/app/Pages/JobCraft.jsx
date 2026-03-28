import { useEffect, useRef, useState } from "react";
import { Target } from "lucide-react";
import { GoogleGenAI } from "@google/genai";
import ResumeChatbot from "../ResumeChatbot";

const ai = new GoogleGenAI({
  apiKey: process.env.NEXT_PUBLIC_GEMINI_API_KEY,
});

// ─── Helpers ─────────────────────────────────────────────────────────────────

const normalizeHtmlResponse = (rawHtml) => {
  if (!rawHtml || typeof rawHtml !== "string") {
    console.error("[normalizeHtml] Input is empty or not a string. typeof:", typeof rawHtml);
    return "";
  }
  const normalized = rawHtml
    .replace(/^```html\s*/i, "")
    .replace(/^```\s*/i, "")
    .replace(/\s*```$/i, "")
    .trim();
  console.log("[normalizeHtml] Raw length:", rawHtml.length, "→ Normalized length:", normalized.length);
  console.log("[normalizeHtml] First 300 chars:\n", normalized.slice(0, 300));
  return normalized;
};

const isLikelyHtmlDocument = (html) => {
  const lower = (html || "").toLowerCase();
  const hasDoctype = lower.includes("<!doctype html");
  const hasHtmlTags = lower.includes("<html") && lower.includes("</html>");
  const valid = hasDoctype || hasHtmlTags;
  console.log("[isLikelyHtml] hasDoctype:", hasDoctype, "| hasHtmlTags:", hasHtmlTags, "| valid:", valid);
  if (!valid) {
    console.error("[isLikelyHtml] Content does not look like HTML. First 500 chars:\n", html?.slice(0, 500));
  }
  return valid;
};

const convertFileToBase64 = (file) => {
  return new Promise((resolve, reject) => {
    console.log("[base64] Reading file:", file.name, "| size:", file.size, "| type:", file.type);
    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result;
      if (typeof result !== "string") {
        reject(new Error("FileReader result is not a string."));
        return;
      }
      const b64 = result.split(",")[1];
      console.log("[base64] Done. Base64 length:", b64?.length);
      resolve(b64);
    };
    reader.onerror = (e) => {
      console.error("[base64] FileReader error:", e);
      reject(new Error("Could not read the PDF file."));
    };
    reader.readAsDataURL(file);
  });
};

const buildGeminiPrompt = (jobDescription) => `
You are an elite ATS resume optimization writer and visual resume designer.

Task:
1. Read the provided resume PDF.
2. Rewrite and tailor the resume to match the target job description below.
3. Return ONLY a complete, valid HTML document with embedded CSS in a <style> tag.

Target Job Description:
"""
${jobDescription}
"""

Hard requirements:
- Do not fabricate employers, education, dates, titles, achievements, or certifications.
- Improve wording, impact bullets, and section relevance while staying truthful to source content.
- Integrate relevant ATS keywords from the job description naturally.
- Keep language concise, professional, and quantifiable where source evidence exists.
- Use strong action verbs and achievement-driven bullet points.

Required section order (include only if source has data):
1. Header (name, contact, links)
2. Professional Summary (2-4 lines tailored to role)
3. Skills (grouped; ATS terms included)
4. Experience (reverse-chronological, 3-5 bullets per role)
5. Education
6. Projects / Certifications

HTML and styling requirements:
- Return a full HTML document: <!doctype html><html><head>...</head><body>...</body></html>
- Include all styling inside one <style> tag in <head>. No external stylesheets.
- Use print-friendly A4 layout.
- Use a clean modern palette, high contrast, and readable typography.
- Keep margins balanced and spacing compact for resume density.
- No markdown, no code fences, no explanations, no JSON.

Output format:
- Return HTML only. Nothing before <!doctype and nothing after </html>.
`;

// ─── PDF Conversion ───────────────────────────────────────────────────────────
//
// ROOT CAUSE OF ALL PREVIOUS FAILURES — two bugs working together:
//
// BUG 1: html2pdf().from(domElement) CLONES the element internally.
//   The clone is detached from the DOM → no layout computed →
//   getBoundingClientRect() returns zeros → html2canvas captures a blank canvas.
//   Every fix we tried (opacity, position, z-index) was applied to OUR node,
//   which html2pdf discards immediately. Completely irrelevant.
//
//   FIX: use html2pdf().from(htmlString, 'string')
//   html2pdf creates and manages its OWN container for the string,
//   appends it to the document itself, and handles all layout.
//   No DOM manipulation needed from our side. No containers. No positioning.
//
// BUG 2: await worker.get('pdf') resolves to the Worker object, NOT jsPDF.
//   Calling .output('blob') on the Worker is undefined → null blob → blank file.
//
//   FIX: extract the blob INSIDE .then(pdf => ...) where `pdf` IS the jsPDF instance.
//   This is the documented pattern in the html2pdf.js source and issues tracker.

const convertHtmlToPdfBlob = async (htmlContent) => {
  console.log("[pdf] ── convertHtmlToPdfBlob START ──");
  console.log("[pdf] htmlContent length:", htmlContent.length);

  // Step 1: Load html2pdf
  console.log("[pdf] Importing html2pdf.js...");
  const html2pdfModule = await import("html2pdf.js");
  const html2pdf = html2pdfModule.default || html2pdfModule;
  console.log("[pdf] html2pdf typeof:", typeof html2pdf);
  if (typeof html2pdf !== "function") {
    throw new Error("[pdf] html2pdf.js did not load as a function. Got: " + typeof html2pdf);
  }
  console.log("[pdf] html2pdf loaded OK.");

  // Step 2: Configure options
  const opt = {
    margin: [10, 10, 10, 10],
    filename: "refined_resume.pdf",
    image: { type: "jpeg", quality: 0.98 },
    html2canvas: {
      scale: 2,
      useCORS: true,
      backgroundColor: "#ffffff",
      logging: true, // shows html2canvas internals in DevTools
    },
    jsPDF: { unit: "mm", format: "a4", orientation: "portrait" },
  };
  console.log("[pdf] Options:", JSON.stringify(opt));

  // Step 3: Convert HTML string → PDF blob
  //
  // We use from(htmlContent, 'string') — NOT from(domElement).
  // Then we use .toPdf().get('pdf').then(pdf => pdf.output('blob'))
  // where inside .then(), `pdf` is the actual jsPDF instance.
  //
  // DO NOT do: const result = await worker.get('pdf'); result.output('blob')
  // That gives you the Worker, not jsPDF.

  console.log("[pdf] Starting html2pdf chain: .from(string).toPdf().get('pdf')...");

  let pdfBlob = null;
  let pdfBlobError = null;

  await html2pdf()
    .set(opt)
    .from(htmlContent, "string")
    .toPdf()
    .get("pdf")
    .then((pdf) => {
      console.log("[pdf] Inside .then() — typeof pdf:", typeof pdf);
      console.log("[pdf] pdf constructor name:", pdf?.constructor?.name);
      console.log("[pdf] pdf.output is a function?", typeof pdf?.output === "function");

      if (typeof pdf?.output !== "function") {
        pdfBlobError = new Error(
          "[pdf] pdf.output is not a function. pdf is: " + JSON.stringify(pdf)
        );
        return;
      }

      const blob = pdf.output("blob");
      console.log("[pdf] pdf.output('blob') returned:", blob?.constructor?.name, "| size:", blob?.size);
      pdfBlob = blob;
    })
    .catch((err) => {
      console.error("[pdf] html2pdf chain threw an error:", err);
      pdfBlobError = err;
    });

  if (pdfBlobError) {
    throw pdfBlobError;
  }

  if (!pdfBlob) {
    throw new Error("[pdf] pdfBlob is null after html2pdf chain. Check html2canvas logs above.");
  }

  if (!(pdfBlob instanceof Blob)) {
    throw new Error("[pdf] pdfBlob is not a Blob instance. typeof: " + typeof pdfBlob);
  }

  if (pdfBlob.size < 1024) {
    throw new Error(
      `[pdf] PDF is suspiciously small (${pdfBlob.size} bytes). ` +
      "The canvas was likely blank. Check html2canvas logs in DevTools."
    );
  }

  console.log("[pdf] ── SUCCESS. Blob size:", pdfBlob.size, "bytes ──");
  return pdfBlob;
};

// ─── Component ────────────────────────────────────────────────────────────────

const JobCraft = () => {
  const [mode, setMode] = useState("refine");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [file, setFile] = useState(null);
  const [jobDescription, setJobDescription] = useState("");
  const [pdfBlobUrl, setPdfBlobUrl] = useState("");
  const [showPreview, setShowPreview] = useState(false);

  // Keep the active blob URL in a ref so we can revoke the PREVIOUS one
  // without touching the one the iframe is currently loading.
  // The original useEffect([summary]) revoked on every state change,
  // which races against the iframe — fixed here by only revoking on replace/unmount.
  const activeBlobUrlRef = useRef(null);

  useEffect(() => {
    return () => {
      if (activeBlobUrlRef.current) {
        console.log("[cleanup] Unmount: revoking blob URL:", activeBlobUrlRef.current);
        URL.revokeObjectURL(activeBlobUrlRef.current);
        activeBlobUrlRef.current = null;
      }
    };
  }, []);

  const handleFileChange = (e) => {
    const selected = e.target.files?.[0];
    if (selected && selected.type === "application/pdf") {
      console.log("[file] Accepted:", selected.name, "| size:", selected.size);
      setFile(selected);
      setError("");
    } else {
      console.warn("[file] Rejected. type:", selected?.type);
      setError("Please select a valid PDF file.");
      setFile(null);
    }
  };

  const handleRefineResume = async () => {
    console.log("[refine] ══ START ══");
    setLoading(true);
    setError("");
    setShowPreview(false);

    try {
      // ── Validate ────────────────────────────────────────────────────────
      if (!file) throw new Error("No file selected.");
      if (!jobDescription.trim()) throw new Error("Job description is empty.");
      if (!process.env.NEXT_PUBLIC_GEMINI_API_KEY) {
        throw new Error("NEXT_PUBLIC_GEMINI_API_KEY is not set.");
      }
      console.log("[refine] Validation passed.");

      // ── Step 1: File → base64 ───────────────────────────────────────────
      console.log("[refine] Step 1: Converting PDF to base64...");
      const base64Pdf = await convertFileToBase64(file);
      console.log("[refine] Step 1 done. base64 length:", base64Pdf.length);

      // ── Step 2: Call Gemini ─────────────────────────────────────────────
      console.log("[refine] Step 2: Calling Gemini (gemini-2.5-flash)...");
      const geminiResponse = await ai.models.generateContent({
        model: "gemini-2.5-flash",
        contents: [
          {
            role: "user",
            parts: [
              { text: buildGeminiPrompt(jobDescription.trim()) },
              { inlineData: { mimeType: "application/pdf", data: base64Pdf } },
            ],
          },
        ],
        config: { temperature: 0.2, topP: 0.95 },
      });
      console.log("[refine] Step 2 done.");
      console.log("[refine] geminiResponse keys:", Object.keys(geminiResponse || {}));
      console.log("[refine] geminiResponse.text type:", typeof geminiResponse?.text);
      console.log("[refine] geminiResponse.text length:", geminiResponse?.text?.length);

      if (!geminiResponse?.text) {
        console.error("[refine] Full geminiResponse:", JSON.stringify(geminiResponse));
        throw new Error(
          "Gemini returned no text. Possible causes: bad API key, quota exceeded, " +
          "safety filter triggered, or wrong model name. See console for full response."
        );
      }

      // ── Step 3: Normalize + validate HTML ──────────────────────────────
      console.log("[refine] Step 3: Normalizing HTML...");
      const refinedHtml = normalizeHtmlResponse(geminiResponse.text);
      if (!refinedHtml) throw new Error("HTML string is empty after normalization.");
      if (!isLikelyHtmlDocument(refinedHtml)) {
        throw new Error("Gemini did not return a valid HTML document. See console for raw output.");
      }
      console.log("[refine] Step 3 done.");

      // ── Step 4: HTML → PDF blob ─────────────────────────────────────────
      console.log("[refine] Step 4: Converting HTML to PDF blob...");
      const pdfBlob = await convertHtmlToPdfBlob(refinedHtml);
      console.log("[refine] Step 4 done. Blob size:", pdfBlob.size, "bytes");

      // ── Step 5: Create object URL ───────────────────────────────────────
      if (activeBlobUrlRef.current) {
        console.log("[refine] Revoking old blob URL:", activeBlobUrlRef.current);
        URL.revokeObjectURL(activeBlobUrlRef.current);
      }
      const url = URL.createObjectURL(pdfBlob);
      activeBlobUrlRef.current = url;
      console.log("[refine] Step 5 done. Blob URL:", url);

      setPdfBlobUrl(url);
      setShowPreview(true);
      console.log("[refine] ══ COMPLETE ══");
    } catch (err) {
      console.error("[refine] ══ ERROR ══", err);
      setError(err?.message || "Unexpected error. Open DevTools console for details.");
    } finally {
      setLoading(false);
    }
  };

  const handleDownload = () => {
    if (!pdfBlobUrl) return;
    console.log("[download] Triggering download from URL:", pdfBlobUrl);
    const a = document.createElement("a");
    a.href = pdfBlobUrl;
    a.download = "refined_resume.pdf";
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  const resetRefine = () => {
    if (activeBlobUrlRef.current) {
      URL.revokeObjectURL(activeBlobUrlRef.current);
      activeBlobUrlRef.current = null;
    }
    setMode("refine");
    setError("");
    setFile(null);
    setJobDescription("");
    setPdfBlobUrl("");
    setShowPreview(false);
  };

  return (
    <div className="max-w-4xl mx-auto p-4 sm:p-8 rounded-xl shadow-lg">
      {/* Header */}
      <div className="text-center mb-8">
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium mb-6 border border-[#ff6b6b]/20">
          <Target className="w-4 h-4" />
          Job Craft Mode
        </div>
        <h2 className="text-3xl font-bold mb-4">Craft Your Perfect Resume</h2>
        <p>
          {mode === "refine"
            ? "Upload your resume and job description to get insights"
            : "Build a new resume from scratch"}
        </p>
      </div>

      {/* Mode tabs */}
      <div className="flex mb-6 border-b border-[#000] pb-4 gap-4">
        <button
          onClick={resetRefine}
          className={`px-5 py-2.5 rounded-lg transition-all duration-200 font-medium ${
            mode === "refine" ? "border-4" : "hover:border-4 border-[#000000]"
          }`}
        >
          Refine Existing
        </button>
        <button
          onClick={() => {
            setMode("build");
            setError("");
            setPdfBlobUrl("");
            setShowPreview(false);
          }}
          className={`px-5 py-2.5 rounded-lg transition-all duration-200 font-medium mr-2 ${
            mode === "build" ? "border-4 border-[#000]" : "hover:border-4"
          }`}
        >
          Build Resume
        </button>
      </div>

      {mode === "build" && <ResumeChatbot />}

      {/* Refine panel */}
      {mode === "refine" && (
        <div className="space-y-6 p-5 sm:p-6 rounded-lg border border-[#4a5568]">
          <h3 className="text-lg font-semibold my-4">Upload your existing resume (PDF)</h3>

          {/* File picker */}
          <div className="flex flex-col sm:flex-row sm:items-center gap-4">
            <label className="border-2 px-5 py-2 rounded-lg cursor-pointer transition-colors duration-200 inline-flex items-center justify-center font-medium">
              <svg
                className="w-5 h-5 mr-2"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
                />
              </svg>
              Choose File
              <input
                type="file"
                accept=".pdf"
                onChange={handleFileChange}
                className="hidden"
              />
            </label>
            {file && <span className="text-sm sm:text-base">{file.name}</span>}
          </div>

          {/* Job description */}
          <div>
            <label className="block text-sm font-medium my-2">Job Description</label>
            <textarea
              rows={6}
              placeholder="Paste job description..."
              value={jobDescription}
              onChange={(e) => setJobDescription(e.target.value)}
              className="w-full px-4 py-2.5 border border-[#4a5568] rounded-lg focus:ring-2 focus:ring-[#ff6b6b] focus:border-[#ff6b6b] outline-none transition-all bg-white text-black placeholder-gray-500"
            />
          </div>

          {/* Submit */}
          <button
            onClick={handleRefineResume}
            disabled={loading || !file || !jobDescription}
            className="bg-[#ff6b6b] text-white mt-4 px-6 py-2.5 rounded-lg hover:bg-[#ff5252] transition-colors duration-200 shadow-md disabled:bg-[#4a5568] disabled:cursor-not-allowed font-medium"
          >
            {loading ? (
              <span className="flex items-center justify-center">
                <svg
                  className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  />
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  />
                </svg>
                Processing...
              </span>
            ) : (
              "Refine Resume"
            )}
          </button>

          {error && (
            <p className="text-red-600 mt-2 text-sm">⚠ {error}</p>
          )}
        </div>
      )}

      {/* Results */}
      {pdfBlobUrl && mode === "refine" && (
        <div className="mt-8">
          <div className="flex flex-wrap gap-3 mb-4">
            <button
              onClick={() => setShowPreview((p) => !p)}
              className="bg-[#ff6b6b] text-white px-6 py-2.5 rounded-lg hover:bg-[#ff5252] transition-colors duration-200 shadow-md font-medium"
            >
              {showPreview ? "Hide Preview" : "Preview PDF"}
            </button>
            <button
              onClick={handleDownload}
              className="bg-[#4a5568] text-white px-6 py-2.5 rounded-lg hover:bg-[#5a6578] transition-colors duration-200 shadow-md font-medium"
            >
              Download PDF
            </button>
          </div>

          {showPreview && (
            <div className="p-6 sm:p-8 bg-[#2d3748] border border-[#4a5568] shadow-lg rounded-lg">
              <iframe
                src={pdfBlobUrl}
                width="100%"
                height="800px"
                title="Resume Preview"
                className="border rounded bg-white"
              />
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default JobCraft;