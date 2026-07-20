import { useState, useRef } from "react";
import apiClient from "../api/client";
import { Upload, FileSpreadsheet, AlertCircle, CheckCircle2 } from "lucide-react";

function UploadForm({ onUploadSuccess }) {
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);
  const [dragActive, setDragActive] = useState(false);
  const fileInputRef = useRef(null);

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const droppedFile = e.dataTransfer.files[0];
      if (droppedFile.name.endsWith(".csv")) {
        setFile(droppedFile);
        setError(null);
      } else {
        setError("Only CSV files are supported.");
      }
    }
  };

  const handleChange = (e) => {
    e.preventDefault();
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
      setError(null);
    }
  };

  const onButtonClick = () => {
    fileInputRef.current.click();
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!file) {
      setError("Please select a CSV file first.");
      return;
    }

    setLoading(true);
    setError(null);
    setSuccess(false);

    const formData = new FormData();
    formData.append("file", file);

    try {
      const response = await apiClient.post("/upload", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      setSuccess(true);
      onUploadSuccess(response.data);
      // Reset file after brief success indication
      setTimeout(() => {
        setFile(null);
        setSuccess(false);
      }, 3000);
    } catch (err) {
      setError(
        err.response?.data || "Upload failed. Please ensure the backend is running and valid CSV format."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-100 dark:border-slate-700/80 p-6 shadow-sm transition-all duration-300">
      <div className="flex flex-col gap-1 mb-6">
        <h2 className="text-xl font-bold text-slate-800 dark:text-slate-100">Upload Bank Statement</h2>
        <p className="text-sm text-slate-500 dark:text-slate-400">
          Upload your bank statement CSV to categorize your transactions automatically.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div
          onDragEnter={handleDrag}
          onDragOver={handleDrag}
          onDragLeave={handleDrag}
          onDrop={handleDrop}
          onClick={onButtonClick}
          className={`relative group border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-all duration-300 flex flex-col items-center justify-center min-h-[160px] ${
            dragActive
              ? "border-indigo-500 bg-indigo-50/50 dark:bg-indigo-950/20"
              : "border-slate-200 dark:border-slate-700 hover:border-indigo-400 hover:bg-slate-50/50 dark:hover:bg-slate-900/10"
          }`}
        >
          <input
            ref={fileInputRef}
            type="file"
            accept=".csv"
            onChange={handleChange}
            className="hidden"
          />

          {!file ? (
            <>
              <div className="p-3 bg-indigo-50 dark:bg-indigo-950/30 text-indigo-600 dark:text-indigo-400 rounded-full mb-3 group-hover:scale-110 transition-transform duration-300">
                <Upload className="h-6 w-6" />
              </div>
              <p className="text-sm font-semibold text-slate-700 dark:text-slate-200">
                Drag and drop your file here, or{" "}
                <span className="text-indigo-600 dark:text-indigo-400 font-medium">browse</span>
              </p>
              <p className="text-xs text-slate-400 dark:text-slate-500 mt-1">Supports standard bank CSV exports</p>
            </>
          ) : (
            <>
              <div className="p-3 bg-emerald-50 dark:bg-emerald-950/30 text-emerald-600 dark:text-emerald-400 rounded-full mb-3">
                <FileSpreadsheet className="h-6 w-6" />
              </div>
              <p className="text-sm font-semibold text-slate-800 dark:text-slate-200 truncate max-w-xs">
                {file.name}
              </p>
              <p className="text-xs text-slate-400 dark:text-slate-500 mt-1">
                {(file.size / 1024).toFixed(1)} KB • CSV Document
              </p>
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  setFile(null);
                }}
                className="mt-2 text-xs text-slate-500 dark:text-slate-400 hover:text-rose-500 dark:hover:text-rose-400 underline"
              >
                Remove file
              </button>
            </>
          )}
        </div>

        {error && (
          <div className="flex gap-2 items-start p-3 bg-rose-50 dark:bg-rose-950/20 text-rose-600 dark:text-rose-400 rounded-lg text-sm">
            <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
            <span>{String(error)}</span>
          </div>
        )}

        {success && (
          <div className="flex gap-2 items-start p-3 bg-emerald-50 dark:bg-emerald-950/20 text-emerald-600 dark:text-emerald-400 rounded-lg text-sm animate-pulse">
            <CheckCircle2 className="h-4 w-4 shrink-0 mt-0.5" />
            <span>Statement uploaded and categorized successfully!</span>
          </div>
        )}

        <button
          type="submit"
          disabled={loading || !file}
          className="w-full flex items-center justify-center py-2.5 px-4 bg-indigo-600 hover:bg-indigo-700 disabled:bg-slate-100 dark:disabled:bg-slate-700 disabled:text-slate-400 dark:disabled:text-slate-500 text-white font-semibold rounded-xl shadow-sm hover:shadow transition-all duration-300 cursor-pointer disabled:cursor-not-allowed"
        >
          {loading ? (
            <div className="flex items-center gap-2">
              <div className="w-4.5 h-4.5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              <span>Uploading & Classifying...</span>
            </div>
          ) : (
            "Upload & Classify"
          )}
        </button>
      </form>
    </div>
  );
}

export default UploadForm;