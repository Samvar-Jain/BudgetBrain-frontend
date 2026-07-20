import { useState } from "react";
import apiClient from "../api/client";
import { Sparkles, RefreshCw, Copy, Check, MessageSquareCode } from "lucide-react";

function InsightsPanel({ hasTransactions }) {
  const [insight, setInsight] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [copied, setCopied] = useState(false);

  const fetchInsight = async () => {
    setLoading(true);
    setError(null);
    setInsight(null);
    try {
      const response = await apiClient.get("/insights");
      setInsight(response.data.insight);
    } catch (err) {
      setError(
        err.response?.data?.error || err.response?.data || "Could not generate insights. Try uploading transactions first."
      );
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = () => {
    if (!insight) return;
    navigator.clipboard.writeText(insight);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Helper to format response paragraphs (detecting bold ** text and lists)
  const formatInsightText = (text) => {
    if (!text) return null;
    return text.split("\n").map((paragraph, index) => {
      let trimmed = paragraph.trim();
      if (!trimmed) return <div key={index} className="h-2"></div>;

      // Check if it's a list item
      const isListItem = trimmed.startsWith("* ") || trimmed.startsWith("- ");
      if (isListItem) {
        trimmed = trimmed.substring(2);
      }

      // Replace **text** with bold tags
      const parts = trimmed.split(/\*\*(.*?)\*\*/g);
      const renderedText = parts.map((part, i) => {
        return i % 2 === 1 ? <strong key={i} className="font-semibold text-slate-800 dark:text-slate-100">{part}</strong> : part;
      });

      if (isListItem) {
        return (
          <li key={index} className="ml-4 list-disc text-sm leading-relaxed text-slate-600 dark:text-slate-300 mb-1">
            {renderedText}
          </li>
        );
      }

      return (
        <p key={index} className="text-sm leading-relaxed text-slate-600 dark:text-slate-300 mb-3">
          {renderedText}
        </p>
      );
    });
  };

  return (
    <div className="bg-gradient-to-br from-indigo-900 via-indigo-950 to-slate-900 rounded-2xl border border-indigo-800/30 p-6 shadow-md transition-all duration-300 flex flex-col h-full text-white">
      <div className="flex justify-between items-center mb-6">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-indigo-500/20 text-indigo-300 rounded-xl border border-indigo-500/30 shadow-inner">
            <Sparkles className="h-5 w-5 animate-pulse" />
          </div>
          <div>
            <h2 className="text-xl font-bold tracking-tight">AI Financial Assistant</h2>
            <p className="text-xs text-indigo-300">Powered by Gemini LLM</p>
          </div>
        </div>

        {insight && (
          <div className="flex gap-2">
            <button
              onClick={copyToClipboard}
              className="p-2 bg-indigo-900/40 hover:bg-indigo-800/40 rounded-lg text-indigo-200 transition-colors border border-indigo-800/20"
              title="Copy to clipboard"
            >
              {copied ? <Check className="h-4 w-4 text-emerald-400" /> : <Copy className="h-4 w-4" />}
            </button>
            <button
              onClick={fetchInsight}
              disabled={loading}
              className="p-2 bg-indigo-900/40 hover:bg-indigo-800/40 rounded-lg text-indigo-200 transition-colors border border-indigo-800/20 disabled:opacity-50"
              title="Regenerate"
            >
              <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
            </button>
          </div>
        )}
      </div>

      <div className="flex-1 flex flex-col justify-center min-h-[180px]">
        {!insight && !loading && !error && (
          <div className="text-center py-6">
            <div className="p-3 bg-indigo-950/40 text-indigo-300 rounded-full mb-3 inline-block border border-indigo-800/20">
              <MessageSquareCode className="h-6 w-6" />
            </div>
            <h3 className="text-md font-semibold text-slate-100 mb-1">Generate Financial Insights</h3>
            <p className="text-xs text-indigo-200/70 max-w-[260px] mx-auto mb-5">
              Let AI analyze your transactions to reveal spending behaviors and savings opportunities.
            </p>
            <button
              onClick={fetchInsight}
              disabled={!hasTransactions}
              className="inline-flex items-center gap-2 py-2 px-5 bg-indigo-600 hover:bg-indigo-500 disabled:bg-slate-800 disabled:text-slate-500 disabled:border-slate-700 text-white font-medium text-sm rounded-xl shadow-lg shadow-indigo-950/50 transition-all duration-300 border border-indigo-500/20 cursor-pointer disabled:cursor-not-allowed"
            >
              <Sparkles className="h-4 w-4" />
              Analyze Spending
            </button>
          </div>
        )}

        {loading && (
          <div className="space-y-4 py-4">
            <div className="flex gap-2 items-center text-xs text-indigo-300 font-medium">
              <div className="flex gap-1">
                <span className="w-2 h-2 bg-indigo-400 rounded-full animate-bounce"></span>
                <span className="w-2 h-2 bg-indigo-400 rounded-full animate-bounce [animation-delay:0.2s]"></span>
                <span className="w-2 h-2 bg-indigo-400 rounded-full animate-bounce [animation-delay:0.4s]"></span>
              </div>
              <span>Analyzing patterns and preparing recommendations...</span>
            </div>
            <div className="space-y-2">
              <div className="h-3 bg-indigo-900/40 rounded-md w-full animate-pulse"></div>
              <div className="h-3 bg-indigo-900/40 rounded-md w-11/12 animate-pulse [animation-delay:0.1s]"></div>
              <div className="h-3 bg-indigo-900/40 rounded-md w-5/6 animate-pulse [animation-delay:0.2s]"></div>
              <div className="h-3 bg-indigo-900/40 rounded-md w-3/4 animate-pulse [animation-delay:0.3s]"></div>
            </div>
          </div>
        )}

        {error && (
          <div className="bg-rose-950/20 border border-rose-800/30 p-4 rounded-xl text-sm text-rose-300">
            <p className="font-semibold mb-1">Failed to get insights</p>
            <p className="text-xs text-rose-300/80">{String(error)}</p>
            <button
              onClick={fetchInsight}
              className="mt-3 text-xs bg-rose-900/40 hover:bg-rose-800/40 py-1.5 px-3 rounded-lg font-medium text-rose-200 border border-rose-800/20 transition-all"
            >
              Try Again
            </button>
          </div>
        )}

        {insight && (
          <div className="bg-slate-900/40 border border-indigo-950/60 rounded-xl p-4.5 max-h-[300px] overflow-y-auto pr-2 custom-scrollbar text-left">
            <div className="prose prose-invert prose-sm">
              {formatInsightText(insight)}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default InsightsPanel;