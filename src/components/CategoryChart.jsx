import { Doughnut } from "react-chartjs-2";
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend,
} from "chart.js";
import { ArrowUpRight } from "lucide-react";

ChartJS.register(ArcElement, Tooltip, Legend);

const CATEGORY_COLORS = {
  Food: "#F59E0B",      // Amber
  Transport: "#3B82F6", // Blue
  Travel: "#8B5CF6",    // Violet
  Shopping: "#EC4899",  // Pink
  Bills: "#EF4444",     // Red
  Finance: "#10B981",   // Emerald
  Health: "#14B8A6",    // Teal
  Income: "#22C55E",    // Green
  Other: "#6B7280",     // Gray
};

function CategoryChart({ transactions }) {
  // Only count spending (negative amounts), not income
  const totalsByCategory = {};
  let totalSpending = 0;

  transactions
    .filter((t) => t.amount < 0)
    .forEach((t) => {
      const abs = Math.abs(t.amount);
      totalsByCategory[t.category] = (totalsByCategory[t.category] || 0) + abs;
      totalSpending += abs;
    });

  const sortedCategories = Object.entries(totalsByCategory)
    .map(([name, amount]) => ({
      name,
      amount,
      percentage: totalSpending > 0 ? (amount / totalSpending) * 100 : 0,
      color: CATEGORY_COLORS[name] || "#9CA3AF"
    }))
    .sort((a, b) => b.amount - a.amount);

  const labels = sortedCategories.map(c => c.name);
  const values = sortedCategories.map(c => c.amount);
  const colors = sortedCategories.map(c => c.color);

  if (labels.length === 0) {
    return (
      <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-100 dark:border-slate-700/80 p-6 shadow-sm flex flex-col items-center justify-center min-h-[300px] text-center">
        <div className="p-3 bg-slate-50 dark:bg-slate-900 text-slate-400 dark:text-slate-500 rounded-full mb-3">
          <ArrowUpRight className="h-6 w-6" />
        </div>
        <h3 className="text-md font-semibold text-slate-700 dark:text-slate-300">No Spending Recorded</h3>
        <p className="text-xs text-slate-400 dark:text-slate-500 mt-1 max-w-[200px]">
          Upload a statement or add transactions to view spending breakdowns.
        </p>
      </div>
    );
  }

  const data = {
    labels,
    datasets: [
      {
        data: values,
        backgroundColor: colors,
        borderWidth: 2,
        borderColor: "transparent",
        hoverOffset: 4,
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false, // Use our custom legend instead!
      },
      tooltip: {
        backgroundColor: "#1e293b",
        titleFont: { size: 13, weight: "bold" },
        bodyFont: { size: 12 },
        padding: 10,
        cornerRadius: 8,
        callbacks: {
          label: (context) => {
            const value = context.parsed;
            const pct = ((value / totalSpending) * 100).toFixed(1);
            return ` ₹${value.toLocaleString("en-IN", { minimumFractionDigits: 2 })} (${pct}%)`;
          },
        },
      },
    },
    cutout: "75%",
  };

  return (
    <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-100 dark:border-slate-700/80 p-6 shadow-sm transition-all duration-300 flex flex-col h-full">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-xl font-bold text-slate-800 dark:text-slate-100">Spending Breakdown</h2>
          <p className="text-xs text-slate-400 dark:text-slate-500">Distribution of expenses by category</p>
        </div>
        <div className="text-right">
          <span className="text-xs text-slate-400 dark:text-slate-500 block">Total Expenses</span>
          <span className="text-lg font-bold text-slate-800 dark:text-slate-100">
            ₹{totalSpending.toLocaleString("en-IN", { maximumFractionDigits: 0 })}
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-center flex-1">
        {/* Doughnut Chart */}
        <div className="md:col-span-5 relative flex justify-center items-center h-[200px]">
          <div className="w-full h-full max-h-[180px]">
            <Doughnut data={data} options={options} />
          </div>
          <div className="absolute flex flex-col items-center justify-center">
            <span className="text-xs text-slate-400 dark:text-slate-500">Spend</span>
            <span className="text-xl font-extrabold text-slate-800 dark:text-slate-100">
              ₹{totalSpending.toLocaleString("en-IN", { maximumFractionDigits: 0 })}
            </span>
          </div>
        </div>

        {/* Custom Legend */}
        <div className="md:col-span-7 flex flex-col gap-2 max-h-[220px] overflow-y-auto pr-1">
          {sortedCategories.map((category) => (
            <div
              key={category.name}
              className="flex justify-between items-center p-2 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-900/50 transition-colors duration-200"
            >
              <div className="flex items-center gap-2.5">
                <div
                  className="w-3 h-3 rounded-full shrink-0"
                  style={{ backgroundColor: category.color }}
                ></div>
                <span className="text-sm font-medium text-slate-700 dark:text-slate-200">
                  {category.name}
                </span>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-sm font-semibold text-slate-800 dark:text-slate-100">
                  ₹{category.amount.toLocaleString("en-IN", { maximumFractionDigits: 0 })}
                </span>
                <span className="text-xs text-slate-400 dark:text-slate-500 w-12 text-right">
                  {category.percentage.toFixed(1)}%
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default CategoryChart;