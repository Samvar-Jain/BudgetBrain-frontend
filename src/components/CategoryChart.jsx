import { Doughnut } from "react-chartjs-2";
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend,
} from "chart.js";

ChartJS.register(ArcElement, Tooltip, Legend);

const CATEGORY_COLORS = {
  Food: "#F59E0B",
  Transport: "#3B82F6",
  Travel: "#8B5CF6",
  Shopping: "#EC4899",
  Bills: "#EF4444",
  Finance: "#10B981",
  Health: "#14B8A6",
  Income: "#22C55E",
  Other: "#6B7280",
};

function CategoryChart({ transactions }) {
  // Only count spending (negative amounts), not income
  const totalsByCategory = {};
  transactions
    .filter((t) => t.amount < 0)
    .forEach((t) => {
      const abs = Math.abs(t.amount);
      totalsByCategory[t.category] = (totalsByCategory[t.category] || 0) + abs;
    });

  const labels = Object.keys(totalsByCategory);
  const values = Object.values(totalsByCategory);
  const colors = labels.map((label) => CATEGORY_COLORS[label] || "#9CA3AF");

  if (labels.length === 0) {
    return null;
  }

  const data = {
    labels,
    datasets: [
      {
        data: values,
        backgroundColor: colors,
        borderWidth: 2,
        borderColor: "#ffffff",
      },
    ],
  };

  const options = {
    responsive: true,
    plugins: {
      legend: {
        position: "right",
      },
      tooltip: {
        callbacks: {
          label: (context) => {
            const value = context.parsed;
            const total = values.reduce((a, b) => a + b, 0);
            const pct = ((value / total) * 100).toFixed(1);
            return `${context.label}: ₹${value.toFixed(2)} (${pct}%)`;
          },
        },
      },
    },
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6 max-w-md">
      <h2 className="text-xl font-bold text-gray-800 mb-4">Spending by Category</h2>
      <Doughnut data={data} options={options} />
    </div>
  );
}

export default CategoryChart;