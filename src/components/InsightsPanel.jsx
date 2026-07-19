import { useState } from "react";
import apiClient from "../api/client";

function InsightsPanel() {
  const [insight, setInsight] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchInsight = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await apiClient.get("/insights");
      setInsight(response.data.insight);
    } catch (err) {
      setError(
        err.response?.data || "Could not generate insight. Try uploading transactions first."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6 max-w-md">
      <h2 className="text-xl font-bold text-gray-800 mb-4">AI Insights</h2>
      <button
        onClick={fetchInsight}
        disabled={loading}
        className="bg-purple-600 hover:bg-purple-700 disabled:bg-gray-400 text-white font-semibold py-2 px-4 rounded transition-colors mb-4"
      >
        {loading ? "Thinking..." : "Get Insight"}
      </button>
      {insight && (
        <p className="text-gray-700 leading-relaxed">{insight}</p>
      )}
      {error && (
        <p className="text-red-600 text-sm">{String(error)}</p>
      )}
    </div>
  );
}

export default InsightsPanel;