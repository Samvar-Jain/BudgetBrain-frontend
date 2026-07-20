import { useState, useEffect } from "react";
import { 
  LayoutDashboard, 
  ReceiptText, 
  Target, 
  Brain, 
  Moon, 
  Sun, 
  TrendingUp, 
  TrendingDown, 
  DollarSign, 
  Search, 
  Calendar, 
  ChevronLeft, 
  ChevronRight, 
  Trash2, 
  Plus, 
  Filter,
  ArrowUpRight,
  Sparkles,
  RefreshCw,
  Clock,
  Briefcase
} from "lucide-react";
import UploadForm from "./components/UploadForm";
import CategoryChart from "./components/CategoryChart";
import InsightsPanel from "./components/InsightsPanel";
import GoalsTracker from "./components/GoalsTracker";
import "./index.css";

const CATEGORIES = [
  "Food",
  "Transport",
  "Travel",
  "Shopping",
  "Bills",
  "Finance",
  "Health",
  "Income",
  "Other"
];

function App() {
  const [transactions, setTransactions] = useState(() => {
    const saved = localStorage.getItem("budgetbrain_transactions");
    return saved ? JSON.parse(saved) : [];
  });

  const [goals, setGoals] = useState([]);
  
  const [isDarkMode, setIsDarkMode] = useState(() => {
    const saved = localStorage.getItem("budgetbrain_darkmode");
    return saved === "true";
  });

  const [activeTab, setActiveTab] = useState("overview");

  // Filter & Search states
  const [searchQuery, setSearchQuery] = useState("");
  const [filterCategory, setFilterCategory] = useState("All");
  const [filterType, setFilterType] = useState("All");
  const [filterMethod, setFilterMethod] = useState("All");
  const [sortBy, setSortBy] = useState("date-desc");
  const [currentPage, setCurrentPage] = useState(1);

  // Manual Transaction Form
  const [showManualForm, setShowManualForm] = useState(false);
  const [manualForm, setManualForm] = useState({
    date: new Date().toISOString().split("T")[0],
    description: "",
    amount: "",
    category: "Food",
  });

  // Load / Save states
  useEffect(() => {
    localStorage.setItem("budgetbrain_transactions", JSON.stringify(transactions));
  }, [transactions]);

  useEffect(() => {
    localStorage.setItem("budgetbrain_darkmode", isDarkMode);
    if (isDarkMode) {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  }, [isDarkMode]);

  // Sync goals list from goals tracker state changes
  const handleGoalsUpdated = (updatedGoals) => {
    setGoals(updatedGoals);
  };

  const handleUploadSuccess = (data) => {
    // Append or replace? Let's replace if it's a fresh file, or merge. Let's merge unique ones, or overwrite.
    // Overwriting is standard for "uploading statement" since it represents the whole period.
    setTransactions(data);
    setCurrentPage(1);
  };

  const handleClearAllTransactions = () => {
    if (window.confirm("Are you sure you want to clear all transactions? This will reset your dashboard.")) {
      setTransactions([]);
      localStorage.removeItem("budgetbrain_transactions");
    }
  };

  const handleDeleteTransaction = (id) => {
    setTransactions(transactions.filter(t => t.id !== id));
  };

  const handleManualSubmit = (e) => {
    e.preventDefault();
    if (!manualForm.description || !manualForm.amount) return;

    const newTx = {
      id: Date.now() + Math.random(), // Unique mock ID
      date: manualForm.date,
      description: manualForm.description,
      amount: manualForm.category === "Income" ? Math.abs(parseFloat(manualForm.amount)) : -Math.abs(parseFloat(manualForm.amount)),
      category: manualForm.category,
      classificationMethod: "Manual",
      confidence: 1.0,
    };

    setTransactions([newTx, ...transactions]);
    setShowManualForm(false);
    setManualForm({
      date: new Date().toISOString().split("T")[0],
      description: "",
      amount: "",
      category: "Food",
    });
  };

  // Financial Stats Calculations
  const totalIncome = transactions
    .filter((t) => t.amount > 0)
    .reduce((sum, t) => sum + t.amount, 0);

  const totalExpenses = transactions
    .filter((t) => t.amount < 0)
    .reduce((sum, t) => sum + Math.abs(t.amount), 0);

  const netSavings = totalIncome - totalExpenses;
  const savingsRate = totalIncome > 0 ? (netSavings / totalIncome) * 100 : 0;

  // Goals progress summary
  const averageGoalProgress = goals.length > 0
    ? goals.reduce((sum, g) => sum + Math.min(100, (g.currentAmount / g.targetAmount) * 100), 0) / goals.length
    : 0;

  // Reset pagination on filter change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, filterCategory, filterType, filterMethod, sortBy]);

  // Filtering transactions
  const filteredTransactions = transactions.filter((t) => {
    const matchSearch = t.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
                        t.category.toLowerCase().includes(searchQuery.toLowerCase());
    const matchCategory = filterCategory === "All" || t.category === filterCategory;
    const matchType = filterType === "All" || 
                      (filterType === "Income" && t.amount > 0) ||
                      (filterType === "Expense" && t.amount < 0);
    const matchMethod = filterMethod === "All" || 
                        (filterMethod === "ML" && t.classificationMethod !== "Manual") ||
                        (filterMethod === "Manual" && t.classificationMethod === "Manual");
                        
    return matchSearch && matchCategory && matchType && matchMethod;
  });

  // Sorting transactions
  const sortedTransactions = [...filteredTransactions].sort((a, b) => {
    if (sortBy === "date-desc") return new Date(b.date) - new Date(a.date);
    if (sortBy === "date-asc") return new Date(a.date) - new Date(b.date);
    if (sortBy === "amount-desc") return b.amount - a.amount;
    if (sortBy === "amount-asc") return a.amount - b.amount;
    return 0;
  });

  // Pagination
  const ITEMS_PER_PAGE = 10;
  const totalPages = Math.ceil(sortedTransactions.length / ITEMS_PER_PAGE) || 1;
  const paginatedTransactions = sortedTransactions.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  return (
    <div className="flex min-h-screen bg-slate-50 dark:bg-slate-900 text-slate-800 dark:text-slate-100 font-sans transition-colors duration-300">
      
      {/* Sidebar navigation */}
      <aside className="w-64 border-r border-slate-200/60 dark:border-slate-800 bg-white dark:bg-slate-950 flex flex-col justify-between shrink-0">
        <div>
          {/* Logo brand */}
          <div className="p-6 flex items-center gap-3 border-b border-slate-100 dark:border-slate-900">
            <div className="p-2 bg-gradient-to-tr from-indigo-500 to-indigo-600 rounded-xl text-white shadow-sm">
              <Brain className="h-6 w-6" />
            </div>
            <div>
              <h1 className="text-lg font-bold tracking-tight bg-gradient-to-r from-slate-900 to-slate-700 dark:from-white dark:to-slate-300 bg-clip-text text-transparent">
                BudgetBrain
              </h1>
              <span className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider block">Financial Hub</span>
            </div>
          </div>

          {/* Navigation Links */}
          <nav className="p-4 space-y-1">
            <button
              onClick={() => setActiveTab("overview")}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold transition-all duration-200 cursor-pointer ${
                activeTab === "overview"
                  ? "bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400"
                  : "text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-900/50 hover:text-slate-800 dark:hover:text-slate-200"
              }`}
            >
              <LayoutDashboard className="h-4.5 w-4.5" />
              Overview
            </button>
            <button
              onClick={() => setActiveTab("transactions")}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold transition-all duration-200 cursor-pointer ${
                activeTab === "transactions"
                  ? "bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400"
                  : "text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-900/50 hover:text-slate-800 dark:hover:text-slate-200"
              }`}
            >
              <ReceiptText className="h-4.5 w-4.5" />
              Transactions
              {transactions.length > 0 && (
                <span className="ml-auto bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-450 text-[10px] py-0.5 px-2 rounded-full font-bold">
                  {transactions.length}
                </span>
              )}
            </button>
            <button
              onClick={() => setActiveTab("goals")}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold transition-all duration-200 cursor-pointer ${
                activeTab === "goals"
                  ? "bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400"
                  : "text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-900/50 hover:text-slate-800 dark:hover:text-slate-200"
              }`}
            >
              <Target className="h-4.5 w-4.5" />
              Savings Goals
              {goals.length > 0 && (
                <span className="ml-auto bg-emerald-50 dark:bg-emerald-950/30 text-emerald-600 dark:text-emerald-400 text-[10px] py-0.5 px-2 rounded-full font-bold">
                  {goals.length}
                </span>
              )}
            </button>
            <button
              onClick={() => setActiveTab("insights")}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold transition-all duration-200 cursor-pointer ${
                activeTab === "insights"
                  ? "bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400"
                  : "text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-900/50 hover:text-slate-800 dark:hover:text-slate-200"
              }`}
            >
              <Brain className="h-4.5 w-4.5" />
              AI Insights
            </button>
          </nav>
        </div>

        {/* Footer info & theme toggle */}
        <div className="p-4 border-t border-slate-100 dark:border-slate-900 space-y-4">
          <div className="flex items-center justify-between p-2 rounded-xl bg-slate-50 dark:bg-slate-900/50 border border-slate-100 dark:border-slate-850">
            <span className="text-xs font-semibold text-slate-550 dark:text-slate-400 pl-2">Theme Mode</span>
            <button
              onClick={() => setIsDarkMode(!isDarkMode)}
              className="p-2 bg-white dark:bg-slate-850 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-355 rounded-lg border border-slate-200 dark:border-slate-750/50 shadow-sm transition-all cursor-pointer"
            >
              {isDarkMode ? <Sun className="h-4 w-4 text-amber-500" /> : <Moon className="h-4 w-4 text-indigo-500" />}
            </button>
          </div>

          <div className="flex items-center gap-3 p-1">
            <div className="h-10 w-10 rounded-full bg-gradient-to-tr from-indigo-500 to-indigo-600 flex items-center justify-center text-white font-bold shadow">
              SJ
            </div>
            <div>
              <h4 className="text-sm font-bold text-slate-800 dark:text-slate-200">Samvar Jain</h4>
              <span className="text-[10px] text-slate-400 dark:text-slate-500 font-medium">Standard Account</span>
            </div>
          </div>
        </div>
      </aside>

      {/* Main content viewport */}
      <main className="flex-1 flex flex-col min-w-0 overflow-y-auto h-screen custom-scrollbar">
        {/* Top Header */}
        <header className="py-5 px-8 border-b border-slate-200/50 dark:border-slate-800/80 bg-white dark:bg-slate-950 flex items-center justify-between sticky top-0 z-10">
          <div>
            <h2 className="text-lg font-bold text-slate-800 dark:text-slate-200">
              {activeTab === "overview" && "Financial Dashboard"}
              {activeTab === "transactions" && "Transaction Ledger"}
              {activeTab === "goals" && "Savings Goals Planner"}
              {activeTab === "insights" && "AI Financial Copilot"}
            </h2>
            <p className="text-xs text-slate-400 dark:text-slate-500">
              {activeTab === "overview" && "Welcome back! Here is a high-level summary of your funds."}
              {activeTab === "transactions" && "View, filter, and audit all transaction classifications."}
              {activeTab === "goals" && "Plan and track target funds for emergency reserves or items."}
              {activeTab === "insights" && "Ask Gemini AI to analyze patterns and suggest saving optimizations."}
            </p>
          </div>
          <div className="flex items-center gap-3">
            {transactions.length > 0 && (
              <button
                onClick={handleClearAllTransactions}
                className="flex items-center gap-1.5 text-xs font-semibold py-2 px-3.5 bg-rose-50 hover:bg-rose-100 dark:bg-rose-950/20 dark:hover:bg-rose-900/30 text-rose-600 dark:text-rose-400 rounded-xl cursor-pointer transition-all border border-rose-100 dark:border-rose-900/30"
              >
                <Trash2 className="h-3.5 w-3.5" />
                Clear Ledger
              </button>
            )}
            {activeTab !== "overview" && (
              <button
                onClick={() => setActiveTab("overview")}
                className="text-xs font-semibold py-2 px-3.5 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-xl transition-all cursor-pointer"
              >
                Back to Dashboard
              </button>
            )}
          </div>
        </header>

        {/* Inner page content container */}
        <div className="p-8 flex-1">
          {/* TAB 1: OVERVIEW */}
          {activeTab === "overview" && (
            <div className="space-y-8 animate-fadeIn">
              {/* Financial KPI Cards Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
                
                {/* Net Savings */}
                <div className="bg-white dark:bg-slate-800 p-5 rounded-2xl border border-slate-100 dark:border-slate-700/80 shadow-sm relative overflow-hidden flex flex-col justify-between min-h-[110px]">
                  <div>
                    <span className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider block">Net Savings</span>
                    <h3 className={`text-2xl font-extrabold tracking-tight mt-1 ${netSavings >= 0 ? "text-slate-800 dark:text-white" : "text-rose-500"}`}>
                      ₹{netSavings.toLocaleString("en-IN", { minimumFractionDigits: 2 })}
                    </h3>
                  </div>
                  <div className="flex items-center gap-1.5 mt-2">
                    <div className={`p-1 rounded-md text-xxs font-bold flex items-center ${netSavings >= 0 ? "bg-emerald-50 dark:bg-emerald-950/30 text-emerald-600 dark:text-emerald-400" : "bg-rose-50 dark:bg-rose-950/30 text-rose-600 dark:text-rose-455"}`}>
                      {netSavings >= 0 ? <TrendingUp className="h-3 w-3 mr-0.5" /> : <TrendingDown className="h-3 w-3 mr-0.5" />}
                      {savingsRate.toFixed(1)}% Rate
                    </div>
                    <span className="text-[10px] text-slate-450 dark:text-slate-500 font-medium">overall saving index</span>
                  </div>
                  <div className="absolute right-4 top-4 p-2 bg-indigo-50 dark:bg-indigo-950/40 text-indigo-500 rounded-xl">
                    <DollarSign className="h-5 w-5" />
                  </div>
                </div>

                {/* Total Income */}
                <div className="bg-white dark:bg-slate-800 p-5 rounded-2xl border border-slate-100 dark:border-slate-700/80 shadow-sm relative overflow-hidden flex flex-col justify-between min-h-[110px]">
                  <div>
                    <span className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider block">Total Income</span>
                    <h3 className="text-2xl font-extrabold tracking-tight text-slate-800 dark:text-white mt-1">
                      ₹{totalIncome.toLocaleString("en-IN", { minimumFractionDigits: 2 })}
                    </h3>
                  </div>
                  <div className="flex items-center gap-1.5 mt-2">
                    <div className="p-1 bg-emerald-50 dark:bg-emerald-950/30 text-emerald-600 dark:text-emerald-400 rounded-md text-xxs font-bold flex items-center">
                      <TrendingUp className="h-3 w-3 mr-0.5" />
                      Inflow
                    </div>
                    <span className="text-[10px] text-slate-450 dark:text-slate-500 font-medium">salary & deposits</span>
                  </div>
                  <div className="absolute right-4 top-4 p-2 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-500 rounded-xl">
                    <TrendingUp className="h-5 w-5" />
                  </div>
                </div>

                {/* Total Expenses */}
                <div className="bg-white dark:bg-slate-800 p-5 rounded-2xl border border-slate-100 dark:border-slate-700/80 shadow-sm relative overflow-hidden flex flex-col justify-between min-h-[110px]">
                  <div>
                    <span className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider block">Total Expenses</span>
                    <h3 className="text-2xl font-extrabold tracking-tight text-slate-800 dark:text-white mt-1">
                      ₹{totalExpenses.toLocaleString("en-IN", { minimumFractionDigits: 2 })}
                    </h3>
                  </div>
                  <div className="flex items-center gap-1.5 mt-2">
                    <div className="p-1 bg-rose-50 dark:bg-rose-950/30 text-rose-600 dark:text-rose-455 rounded-md text-xxs font-bold flex items-center">
                      <TrendingDown className="h-3 w-3 mr-0.5" />
                      Outflow
                    </div>
                    <span className="text-[10px] text-slate-450 dark:text-slate-500 font-medium">all negative spending</span>
                  </div>
                  <div className="absolute right-4 top-4 p-2 bg-rose-50 dark:bg-rose-950/40 text-rose-500 rounded-xl">
                    <TrendingDown className="h-5 w-5" />
                  </div>
                </div>

                {/* Savings Goals Index */}
                <div className="bg-white dark:bg-slate-800 p-5 rounded-2xl border border-slate-100 dark:border-slate-700/80 shadow-sm relative overflow-hidden flex flex-col justify-between min-h-[110px]">
                  <div>
                    <span className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider block">Goal Target Index</span>
                    <h3 className="text-2xl font-extrabold tracking-tight text-slate-800 dark:text-white mt-1">
                      {averageGoalProgress.toFixed(0)}%
                    </h3>
                  </div>
                  <div className="mt-2">
                    <div className="w-full bg-slate-200 dark:bg-slate-750 rounded-full h-1.5 overflow-hidden">
                      <div className="bg-indigo-600 h-full rounded-full" style={{ width: `${averageGoalProgress}%` }}></div>
                    </div>
                    <div className="flex justify-between text-[9px] text-slate-400 mt-1 font-medium">
                      <span>{goals.length} Active Target Goals</span>
                    </div>
                  </div>
                  <div className="absolute right-4 top-4 p-2 bg-violet-50 dark:bg-violet-950/40 text-violet-500 rounded-xl">
                    <Target className="h-5 w-5" />
                  </div>
                </div>

              </div>

              {/* Main dashboard body widgets grid */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
                
                {/* Left Column widgets (Charts + AI insights) */}
                <div className="lg:col-span-8 space-y-8">
                  
                  {/* Category Spending distribution */}
                  <CategoryChart transactions={transactions} />

                  {/* AI Copilot insights (if uploaded, show directly; else show instructions) */}
                  <InsightsPanel hasTransactions={transactions.length > 0} />

                  {/* Savings Goals tracker summary overlay */}
                  <GoalsTracker onGoalsUpdated={handleGoalsUpdated} />

                </div>

                {/* Right Column widgets (Upload Card + Recent Ledger activity) */}
                <div className="lg:col-span-4 space-y-8">
                  
                  {/* File Dropzone card */}
                  <UploadForm onUploadSuccess={handleUploadSuccess} />

                  {/* Recent Activity Table Card */}
                  <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-100 dark:border-slate-700/80 p-5 shadow-sm">
                    <div className="flex justify-between items-center mb-4">
                      <div>
                        <h3 className="text-sm font-bold text-slate-800 dark:text-slate-100">Recent Activity</h3>
                        <p className="text-[10px] text-slate-400 dark:text-slate-500">Last 5 ledger activities</p>
                      </div>
                      <button
                        onClick={() => setActiveTab("transactions")}
                        className="text-xs text-indigo-600 hover:text-indigo-700 dark:text-indigo-400 font-bold hover:underline cursor-pointer"
                      >
                        View All
                      </button>
                    </div>

                    <div className="space-y-3">
                      {transactions.length === 0 ? (
                        <p className="text-xs text-slate-450 dark:text-slate-500 text-center py-6">
                          No recent transactions. Upload a CSV to get started.
                        </p>
                      ) : (
                        transactions.slice(0, 5).map((t, idx) => (
                          <div
                            key={t.id || idx}
                            className="flex justify-between items-center p-2.5 rounded-xl bg-slate-50/50 dark:bg-slate-900/10 border border-slate-100/60 dark:border-slate-750/30 hover:bg-slate-50 dark:hover:bg-slate-900/50 transition-colors"
                          >
                            <div className="min-w-0 flex-1 pr-3">
                              <span className="text-xs font-semibold text-slate-750 dark:text-slate-200 block truncate leading-snug">
                                {t.description}
                              </span>
                              <div className="flex gap-2 items-center mt-1">
                                <span className="text-[9px] font-bold py-0.5 px-1.5 bg-slate-150 dark:bg-slate-800 text-slate-550 dark:text-slate-400 rounded">
                                  {t.category}
                                </span>
                                <span className="text-[9px] text-slate-400 flex items-center gap-0.5">
                                  <Calendar className="h-2.5 w-2.5" />
                                  {t.date}
                                </span>
                              </div>
                            </div>
                            <span className={`text-xs font-extrabold shrink-0 ${t.amount < 0 ? "text-rose-500" : "text-emerald-500"}`}>
                              {t.amount < 0 ? "-" : "+"}₹{Math.abs(t.amount).toLocaleString("en-IN", { minimumFractionDigits: 1 })}
                            </span>
                          </div>
                        ))
                      )}
                    </div>

                  </div>

                </div>

              </div>
            </div>
          )}

          {/* TAB 2: TRANSACTIONS */}
          {activeTab === "transactions" && (
            <div className="space-y-6 animate-fadeIn">
              
              {/* Filter controls panel */}
              <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-100 dark:border-slate-700/80 p-5 shadow-sm space-y-4">
                
                {/* Search Bar + Add Manual Action */}
                <div className="flex flex-col sm:flex-row gap-3 items-stretch">
                  <div className="relative flex-1">
                    <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                    <input
                      type="text"
                      placeholder="Search transactions by merchant, description, or category..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="w-full pl-10 pr-4 py-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-sm focus:outline-none focus:border-indigo-500 transition-colors text-slate-800 dark:text-slate-100"
                    />
                  </div>
                  <button
                    onClick={() => setShowManualForm(!showManualForm)}
                    className="flex items-center justify-center gap-1.5 py-2.5 px-4 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-sm font-semibold shadow-sm hover:shadow cursor-pointer transition-all shrink-0"
                  >
                    <Plus className="h-4 w-4" />
                    Add Transaction
                  </button>
                </div>

                {/* Collapsible Manual Transaction Entry Form */}
                {showManualForm && (
                  <form onSubmit={handleManualSubmit} className="grid grid-cols-1 sm:grid-cols-4 gap-4 p-5 bg-slate-50 dark:bg-slate-900/40 border border-slate-200/50 dark:border-slate-700/50 rounded-xl animate-scaleUp">
                    <div>
                      <label className="block text-xxs font-bold uppercase tracking-wider text-slate-400 mb-1">Date</label>
                      <input
                        type="date"
                        value={manualForm.date}
                        onChange={(e) => setManualForm({ ...manualForm, date: e.target.value })}
                        required
                        className="w-full border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 rounded-lg p-2 text-xs focus:outline-none focus:border-indigo-500"
                      />
                    </div>
                    <div className="sm:col-span-2">
                      <label className="block text-xxs font-bold uppercase tracking-wider text-slate-400 mb-1">Description / Merchant</label>
                      <input
                        type="text"
                        placeholder="e.g. Swiggy Order, Salary Deposit"
                        value={manualForm.description}
                        onChange={(e) => setManualForm({ ...manualForm, description: e.target.value })}
                        required
                        className="w-full border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 rounded-lg p-2 text-xs focus:outline-none focus:border-indigo-500"
                      />
                    </div>
                    <div>
                      <label className="block text-xxs font-bold uppercase tracking-wider text-slate-400 mb-1">Amount (₹)</label>
                      <input
                        type="number"
                        placeholder="e.g. 450"
                        value={manualForm.amount}
                        onChange={(e) => setManualForm({ ...manualForm, amount: e.target.value })}
                        required
                        min="0.01"
                        step="0.01"
                        className="w-full border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 rounded-lg p-2 text-xs focus:outline-none focus:border-indigo-500"
                      />
                    </div>
                    <div>
                      <label className="block text-xxs font-bold uppercase tracking-wider text-slate-400 mb-1">Category</label>
                      <select
                        value={manualForm.category}
                        onChange={(e) => setManualForm({ ...manualForm, category: e.target.value })}
                        className="w-full border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 rounded-lg p-2 text-xs focus:outline-none focus:border-indigo-500"
                      >
                        {CATEGORIES.map(cat => (
                          <option key={cat} value={cat}>{cat}</option>
                        ))}
                      </select>
                    </div>

                    <div className="sm:col-span-4 flex justify-end gap-2.5 mt-2">
                      <button
                        type="button"
                        onClick={() => setShowManualForm(false)}
                        className="px-3.5 py-1.5 border border-slate-200 dark:border-slate-700 rounded-lg text-xs font-semibold hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        className="px-5 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-semibold cursor-pointer shadow-sm"
                      >
                        Save Transaction
                      </button>
                    </div>
                  </form>
                )}

                {/* Filter dropdown selections */}
                <div className="flex flex-wrap gap-4 pt-2 border-t border-slate-100 dark:border-slate-700/50">
                  
                  {/* Category Filter */}
                  <div className="flex items-center gap-2">
                    <span className="text-xxs font-bold text-slate-400 dark:text-slate-500 uppercase">Category:</span>
                    <select
                      value={filterCategory}
                      onChange={(e) => setFilterCategory(e.target.value)}
                      className="border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 rounded-lg p-1.5 text-xs focus:outline-none text-slate-700 dark:text-slate-300"
                    >
                      <option value="All">All Categories</option>
                      {CATEGORIES.map(c => (
                        <option key={c} value={c}>{c}</option>
                      ))}
                    </select>
                  </div>

                  {/* Flow Type Filter */}
                  <div className="flex items-center gap-2">
                    <span className="text-xxs font-bold text-slate-400 dark:text-slate-500 uppercase">Flow Type:</span>
                    <select
                      value={filterType}
                      onChange={(e) => setFilterType(e.target.value)}
                      className="border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 rounded-lg p-1.5 text-xs focus:outline-none text-slate-700 dark:text-slate-300"
                    >
                      <option value="All">All Flows</option>
                      <option value="Income">Income / Credit</option>
                      <option value="Expense">Expense / Debit</option>
                    </select>
                  </div>

                  {/* Audit Method Filter */}
                  <div className="flex items-center gap-2">
                    <span className="text-xxs font-bold text-slate-400 dark:text-slate-500 uppercase">Method:</span>
                    <select
                      value={filterMethod}
                      onChange={(e) => setFilterMethod(e.target.value)}
                      className="border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 rounded-lg p-1.5 text-xs focus:outline-none text-slate-700 dark:text-slate-300"
                    >
                      <option value="All">All Methods</option>
                      <option value="ML">ML Classified</option>
                      <option value="Manual">Manual Entries</option>
                    </select>
                  </div>

                  {/* Sort Order Filter */}
                  <div className="flex items-center gap-2 sm:ml-auto">
                    <span className="text-xxs font-bold text-slate-400 dark:text-slate-500 uppercase">Sort by:</span>
                    <select
                      value={sortBy}
                      onChange={(e) => setSortBy(e.target.value)}
                      className="border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 rounded-lg p-1.5 text-xs focus:outline-none text-slate-700 dark:text-slate-300"
                    >
                      <option value="date-desc">Newest Date</option>
                      <option value="date-asc">Oldest Date</option>
                      <option value="amount-desc">Highest Amount</option>
                      <option value="amount-asc">Lowest Amount</option>
                    </select>
                  </div>

                </div>

              </div>

              {/* Transactions list table card */}
              <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-100 dark:border-slate-700/80 shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="bg-slate-50/70 dark:bg-slate-900/30 border-b border-slate-150 dark:border-slate-750 text-xxs font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">
                        <th className="py-3 px-5">Date</th>
                        <th className="py-3 px-5">Description</th>
                        <th className="py-3 px-5">Category</th>
                        <th className="py-3 px-5">Audit Method</th>
                        <th className="py-3 px-5 text-right">Amount</th>
                        <th className="py-3 px-5 text-center">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 dark:divide-slate-750/50">
                      {paginatedTransactions.length === 0 ? (
                        <tr>
                          <td colSpan="6" className="py-12 px-5 text-center text-sm text-slate-500 dark:text-slate-400">
                            No transactions found matching the filters.
                          </td>
                        </tr>
                      ) : (
                        paginatedTransactions.map((t) => (
                          <tr
                            key={t.id}
                            className="hover:bg-slate-50/50 dark:hover:bg-slate-900/20 transition-colors text-xs text-slate-750 dark:text-slate-200"
                          >
                            <td className="py-3.5 px-5 font-medium whitespace-nowrap">
                              <span className="flex items-center gap-1.5">
                                <Calendar className="h-3.5 w-3.5 text-slate-350 dark:text-slate-650" />
                                {t.date}
                              </span>
                            </td>
                            <td className="py-3.5 px-5 font-semibold max-w-xs truncate" title={t.description}>
                              {t.description}
                            </td>
                            <td className="py-3.5 px-5">
                              <span className="inline-block py-0.5 px-2 bg-slate-100 dark:bg-slate-750 text-slate-600 dark:text-slate-300 font-bold rounded text-[10px]">
                                {t.category}
                              </span>
                            </td>
                            <td className="py-3.5 px-5">
                              <div className="flex items-center gap-1.5">
                                <span className={`text-[10px] py-0.5 px-1.5 rounded font-bold ${
                                  t.classificationMethod === "Manual"
                                    ? "bg-slate-50 dark:bg-slate-900 text-slate-500 border border-slate-200 dark:border-slate-750"
                                    : "bg-indigo-50 dark:bg-indigo-950/30 text-indigo-600 dark:text-indigo-400"
                                }`}>
                                  {t.classificationMethod || "Model"}
                                </span>
                                {t.confidence && t.classificationMethod !== "Manual" && (
                                  <span className={`text-[9px] font-bold ${
                                    t.confidence > 0.85 
                                      ? "text-emerald-500" 
                                      : t.confidence > 0.6 
                                      ? "text-amber-500" 
                                      : "text-slate-400"
                                  }`}>
                                    {(t.confidence * 100).toFixed(0)}% conf
                                  </span>
                                )}
                              </div>
                            </td>
                            <td className={`py-3.5 px-5 font-bold text-right text-sm whitespace-nowrap ${
                              t.amount < 0 ? "text-rose-500" : "text-emerald-500"
                            }`}>
                              {t.amount < 0 ? "-" : "+"}₹{Math.abs(t.amount).toLocaleString("en-IN", { minimumFractionDigits: 2 })}
                            </td>
                            <td className="py-3.5 px-5 text-center">
                              <button
                                onClick={() => handleDeleteTransaction(t.id)}
                                className="p-1 hover:bg-rose-50 dark:hover:bg-rose-950/20 text-slate-400 hover:text-rose-500 rounded transition-colors cursor-pointer"
                                title="Delete Transaction"
                              >
                                <Trash2 className="h-4 w-4" />
                              </button>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>

                {/* Table Pagination footer */}
                {totalPages > 1 && (
                  <div className="py-4 px-6 border-t border-slate-100 dark:border-slate-750 flex items-center justify-between bg-slate-50/50 dark:bg-slate-900/10">
                    <span className="text-xxs text-slate-400 dark:text-slate-500 font-semibold">
                      Showing {(currentPage - 1) * ITEMS_PER_PAGE + 1} - {Math.min(currentPage * ITEMS_PER_PAGE, sortedTransactions.length)} of {sortedTransactions.length} results
                    </span>
                    <div className="flex gap-1.5">
                      <button
                        onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                        disabled={currentPage === 1}
                        className="p-1.5 border border-slate-200 dark:border-slate-750 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 disabled:opacity-40 disabled:hover:bg-transparent transition-colors cursor-pointer"
                      >
                        <ChevronLeft className="h-4 w-4" />
                      </button>
                      {Array.from({ length: totalPages }).map((_, i) => (
                        <button
                          key={i}
                          onClick={() => setCurrentPage(i + 1)}
                          className={`w-7.5 h-7.5 flex items-center justify-center rounded-lg text-xs font-bold transition-all cursor-pointer ${
                            currentPage === i + 1
                              ? "bg-indigo-600 text-white shadow-sm"
                              : "border border-slate-200 dark:border-slate-750 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-650 dark:text-slate-350"
                          }`}
                        >
                          {i + 1}
                        </button>
                      ))}
                      <button
                        onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                        disabled={currentPage === totalPages}
                        className="p-1.5 border border-slate-200 dark:border-slate-750 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 disabled:opacity-40 disabled:hover:bg-transparent transition-colors cursor-pointer"
                      >
                        <ChevronRight className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                )}

              </div>

            </div>
          )}

          {/* TAB 3: GOALS */}
          {activeTab === "goals" && (
            <div className="space-y-6 animate-fadeIn">
              <GoalsTracker onGoalsUpdated={handleGoalsUpdated} />
            </div>
          )}

          {/* TAB 4: INSIGHTS */}
          {activeTab === "insights" && (
            <div className="space-y-6 animate-fadeIn max-w-4xl mx-auto">
              <InsightsPanel hasTransactions={transactions.length > 0} />
            </div>
          )}

        </div>
      </main>
    </div>
  );
}

export default App;