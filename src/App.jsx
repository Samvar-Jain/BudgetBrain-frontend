import { useState } from "react";
import UploadForm from "./components/UploadForm";
import CategoryChart from "./components/CategoryChart";
import InsightsPanel from "./components/InsightsPanel";
import GoalsTracker from "./components/GoalsTracker";
import "./index.css";

function App() {
  const [transactions, setTransactions] = useState([]);

  const handleUploadSuccess = (data) => {
    setTransactions(data);
  };

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <h1 className="text-3xl font-bold text-gray-900 mb-6">BudgetBrain</h1>
      <div className="flex flex-col gap-6">
        <UploadForm onUploadSuccess={handleUploadSuccess} />
        <CategoryChart transactions={transactions} />
        <InsightsPanel />
        <GoalsTracker />
      </div>
    </div>
  );
}

export default App;