import { useState } from "react";
import apiClient from "../api/client";

function UploadForm({ onUploadSuccess }) {
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!file) {
      setError("Please select a CSV file first.");
      return;
    }

    setLoading(true);
    setError(null);

    const formData = new FormData();
    formData.append("file", file);

    try {
      const response = await apiClient.post("/upload", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      onUploadSuccess(response.data);
    } catch (err) {
      setError(
        err.response?.data || "Upload failed. Check that the backend is running."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4 p-6 bg-white rounded-lg shadow-md max-w-md">
      <h2 className="text-xl font-bold text-gray-800">Upload Bank Statement</h2>
      <input
        type="file"
        accept=".csv"
        onChange={(e) => setFile(e.target.files[0])}
        className="border border-gray-300 rounded p-2 text-sm"
      />
      <button
        type="submit"
        disabled={loading}
        className="bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white font-semibold py-2 px-4 rounded transition-colors"
      >
        {loading ? "Uploading..." : "Upload & Classify"}
      </button>
      {error && (
        <p className="text-red-600 text-sm">{String(error)}</p>
      )}
    </form>
  );
}

export default UploadForm;