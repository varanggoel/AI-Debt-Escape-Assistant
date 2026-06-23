"use client";

export default function AnalyzerPage() {
  const url = process.env.NEXT_PUBLIC_STREAMLIT_URL;

  if (!url) {
    return (
      <div className="text-center py-20 text-gray-500 dark:text-gray-400">
        Streamlit URL not configured. Set <code className="px-1 py-0.5 rounded bg-gray-100 dark:bg-gray-800">NEXT_PUBLIC_STREAMLIT_URL</code>.
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
          Document Analyzer
        </h1>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">
          Upload a bank statement, CIBIL report, or loan document for AI analysis.
        </p>
      </div>
      <iframe
        src={url}
        className="w-full rounded-2xl border border-gray-200 dark:border-gray-700"
        style={{ height: "80vh" }}
        title="Debt Document Analyzer"
      />
    </div>
  );
}
