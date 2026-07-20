import { useState, useEffect } from "react";
import apiClient from "../api/client";
import { Target, Plus, Trash2, Calendar, Edit2, Check, X, PiggyBank, Sparkles } from "lucide-react";

function GoalsTracker({ onGoalsUpdated }) {
  const [goals, setGoals] = useState([]);
  const [error, setError] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [editingGoalId, setEditingGoalId] = useState(null);
  const [editAmount, setEditAmount] = useState("");
  const [quickAddAmount, setQuickAddAmount] = useState("");
  const [quickAddGoalId, setQuickAddGoalId] = useState(null);

  const [formData, setFormData] = useState({
    name: "",
    targetAmount: "",
    currentAmount: "",
    deadline: "",
  });

  const fetchGoals = async () => {
    try {
      const response = await apiClient.get("/goals");
      setGoals(response.data);
      if (onGoalsUpdated) {
        onGoalsUpdated(response.data);
      }
    } catch (err) {
      setError("Could not load goals.");
    }
  };

  useEffect(() => {
    fetchGoals();
  }, []);

  const handleFormChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleCreateGoal = async (e) => {
    e.preventDefault();
    try {
      await apiClient.post("/goals", {
        name: formData.name,
        targetAmount: parseFloat(formData.targetAmount),
        currentAmount: parseFloat(formData.currentAmount || 0),
        deadline: formData.deadline || null,
      });
      setFormData({ name: "", targetAmount: "", currentAmount: "", deadline: "" });
      setShowForm(false);
      fetchGoals();
    } catch (err) {
      setError("Could not create goal.");
    }
  };

  const handleDeleteGoal = async (id) => {
    try {
      await apiClient.delete(`/goals/${id}`);
      fetchGoals();
    } catch (err) {
      setError("Could not delete goal.");
    }
  };

  const handleQuickAdd = async (goal) => {
    const amountToAdd = parseFloat(quickAddAmount);
    if (isNaN(amountToAdd) || amountToAdd <= 0) return;

    try {
      await apiClient.put(`/goals/${goal.id}`, {
        name: goal.name,
        targetAmount: goal.targetAmount,
        currentAmount: goal.currentAmount + amountToAdd,
        deadline: goal.deadline,
      });
      setQuickAddGoalId(null);
      setQuickAddAmount("");
      fetchGoals();
    } catch (err) {
      setError("Could not update goal amount.");
    }
  };

  const handleUpdateCurrentAmount = async (goal, newAmount) => {
    const parsedAmount = parseFloat(newAmount);
    if (isNaN(parsedAmount) || parsedAmount < 0) return;

    try {
      await apiClient.put(`/goals/${goal.id}`, {
        name: goal.name,
        targetAmount: goal.targetAmount,
        currentAmount: parsedAmount,
        deadline: goal.deadline,
      });
      setEditingGoalId(null);
      setEditAmount("");
      fetchGoals();
    } catch (err) {
      setError("Could not update goal.");
    }
  };

  // Helper to format days remaining
  const getDaysRemaining = (deadlineStr) => {
    if (!deadlineStr) return null;
    const deadline = new Date(deadlineStr);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const diffTime = deadline - today;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    if (diffDays < 0) return "Overdue";
    if (diffDays === 0) return "Ends today";
    if (diffDays === 1) return "1 day left";
    return `${diffDays} days left`;
  };

  return (
    <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-100 dark:border-slate-700/80 p-6 shadow-sm transition-all duration-300">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-xl font-bold text-slate-800 dark:text-slate-100">Savings Goals</h2>
          <p className="text-xs text-slate-400 dark:text-slate-500">Track and manage your target savings goals</p>
        </div>
        <button
          onClick={() => setShowForm(!showForm)}
          className={`flex items-center gap-1.5 text-xs font-semibold py-2 px-3.5 rounded-xl cursor-pointer shadow-sm hover:shadow transition-all duration-300 ${
            showForm
              ? "bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-200"
              : "bg-indigo-600 hover:bg-indigo-700 text-white"
          }`}
        >
          {showForm ? (
            <>
              <X className="h-3.5 w-3.5" />
              Cancel
            </>
          ) : (
            <>
              <Plus className="h-3.5 w-3.5" />
              Add Goal
            </>
          )}
        </button>
      </div>

      {showForm && (
        <form onSubmit={handleCreateGoal} className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6 p-5 bg-slate-50 dark:bg-slate-900/40 border border-slate-100 dark:border-slate-700/50 rounded-2xl animate-fadeIn">
          <div className="sm:col-span-2">
            <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1">Goal Name</label>
            <input
              type="text"
              name="name"
              placeholder="e.g., Emergency Fund, New Laptop, Tesla Model Y"
              value={formData.name}
              onChange={handleFormChange}
              required
              className="w-full border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 rounded-xl p-2.5 text-sm text-slate-800 dark:text-slate-100 focus:outline-none focus:border-indigo-500 transition-colors"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1">Target Amount (₹)</label>
            <input
              type="number"
              name="targetAmount"
              placeholder="e.g., 50000"
              value={formData.targetAmount}
              onChange={handleFormChange}
              required
              min="1"
              className="w-full border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 rounded-xl p-2.5 text-sm text-slate-800 dark:text-slate-100 focus:outline-none focus:border-indigo-500 transition-colors"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1">Current Saved (₹)</label>
            <input
              type="number"
              name="currentAmount"
              placeholder="e.g., 5000"
              value={formData.currentAmount}
              onChange={handleFormChange}
              min="0"
              className="w-full border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 rounded-xl p-2.5 text-sm text-slate-800 dark:text-slate-100 focus:outline-none focus:border-indigo-500 transition-colors"
            />
          </div>

          <div className="sm:col-span-2">
            <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1">Target Deadline</label>
            <input
              type="date"
              name="deadline"
              value={formData.deadline}
              onChange={handleFormChange}
              className="w-full border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 rounded-xl p-2.5 text-sm text-slate-800 dark:text-slate-100 focus:outline-none focus:border-indigo-500 transition-colors"
            />
          </div>

          <div className="sm:col-span-2 mt-2">
            <button
              type="submit"
              className="w-full flex items-center justify-center gap-1.5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-xl text-sm shadow-sm hover:shadow cursor-pointer transition-all"
            >
              <Target className="h-4 w-4" />
              Save Goal
            </button>
          </div>
        </form>
      )}

      {error && (
        <div className="mb-4 p-3 bg-rose-50 dark:bg-rose-950/20 text-rose-600 dark:text-rose-400 rounded-lg text-sm flex gap-2 items-center">
          <span className="w-1.5 h-1.5 rounded-full bg-rose-500"></span>
          <span>{error}</span>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {goals.length === 0 && !showForm && (
          <div className="md:col-span-2 text-center py-8 border border-dashed border-slate-200 dark:border-slate-700 rounded-2xl">
            <PiggyBank className="h-8 w-8 text-slate-300 dark:text-slate-600 mx-auto mb-2" />
            <p className="text-sm font-medium text-slate-600 dark:text-slate-400">No savings goals yet</p>
            <p className="text-xs text-slate-400 dark:text-slate-500 mt-0.5">Click "Add Goal" to kickstart your savings target.</p>
          </div>
        )}

        {goals.map((goal) => {
          const pct = goal.targetAmount > 0 ? Math.min(100, (goal.currentAmount / goal.targetAmount) * 100) : 0;
          const daysRemaining = getDaysRemaining(goal.deadline);
          
          return (
            <div
              key={goal.id}
              className="group relative border border-slate-100 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-900/10 rounded-2xl p-5 hover:bg-white dark:hover:bg-slate-800 hover:border-slate-200 dark:hover:border-slate-600/80 hover:shadow-md hover:-translate-y-0.5 transition-all duration-300 flex flex-col justify-between"
            >
              {/* Header info */}
              <div>
                <div className="flex justify-between items-start gap-4 mb-2">
                  <div className="flex items-center gap-2">
                    <div className={`p-2 rounded-lg ${pct >= 100 ? "bg-emerald-50 dark:bg-emerald-950/30 text-emerald-600 dark:text-emerald-400" : "bg-indigo-50 dark:bg-indigo-950/30 text-indigo-600 dark:text-indigo-400"}`}>
                      <PiggyBank className="h-4.5 w-4.5" />
                    </div>
                    <span className="font-bold text-slate-800 dark:text-slate-100 leading-tight">
                      {goal.name}
                    </span>
                  </div>
                  <button
                    onClick={() => handleDeleteGoal(goal.id)}
                    className="opacity-0 group-hover:opacity-100 text-slate-400 hover:text-rose-500 p-1 rounded-md hover:bg-slate-100 dark:hover:bg-slate-700/50 transition-all cursor-pointer"
                    title="Delete Goal"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>

                {/* Progress bar */}
                <div className="mt-4">
                  <div className="w-full bg-slate-200 dark:bg-slate-700 rounded-full h-2.5 mb-1.5 overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all duration-500 ease-out ${
                        pct >= 100
                          ? "bg-gradient-to-r from-emerald-400 to-teal-500 shadow-sm"
                          : pct >= 50
                          ? "bg-gradient-to-r from-indigo-500 to-indigo-600"
                          : "bg-gradient-to-r from-amber-400 to-amber-500"
                      }`}
                      style={{ width: `${pct}%` }}
                    ></div>
                  </div>

                  {/* Amounts */}
                  <div className="flex justify-between items-baseline mb-3">
                    <div className="flex items-baseline gap-1">
                      {editingGoalId === goal.id ? (
                        <div className="flex items-center gap-1.5">
                          <input
                            type="number"
                            value={editAmount}
                            onChange={(e) => setEditAmount(e.target.value)}
                            placeholder={goal.currentAmount}
                            className="w-20 border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 rounded p-1 text-xs text-slate-800 dark:text-slate-100"
                          />
                          <button
                            onClick={() => handleUpdateCurrentAmount(goal, editAmount)}
                            className="p-1 bg-emerald-500 text-white rounded hover:bg-emerald-600"
                          >
                            <Check className="h-3 w-3" />
                          </button>
                          <button
                            onClick={() => setEditingGoalId(null)}
                            className="p-1 bg-slate-300 dark:bg-slate-600 text-slate-700 dark:text-slate-300 rounded hover:bg-slate-400"
                          >
                            <X className="h-3 w-3" />
                          </button>
                        </div>
                      ) : (
                        <>
                          <span className="text-sm font-bold text-slate-800 dark:text-slate-100">
                            ₹{goal.currentAmount.toLocaleString("en-IN")}
                          </span>
                          <span className="text-xxs text-slate-400 dark:text-slate-500">saved</span>
                          <button
                            onClick={() => {
                              setEditingGoalId(goal.id);
                              setEditAmount(goal.currentAmount);
                            }}
                            className="ml-1 opacity-0 group-hover:opacity-100 text-slate-400 hover:text-indigo-500 transition-opacity"
                            title="Edit amount saved"
                          >
                            <Edit2 className="h-3 w-3" />
                          </button>
                        </>
                      )}
                    </div>
                    <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">
                      of ₹{goal.targetAmount.toLocaleString("en-IN")}
                    </span>
                  </div>
                </div>
              </div>

              {/* Bottom bar with status */}
              <div className="flex justify-between items-center border-t border-slate-100 dark:border-slate-750 pt-3 mt-1.5">
                <div className="flex items-center gap-1.5 text-xxs font-medium text-slate-400 dark:text-slate-500">
                  <Calendar className="h-3.5 w-3.5 text-slate-300 dark:text-slate-600" />
                  {goal.deadline ? (
                    <span className={daysRemaining === "Overdue" ? "text-rose-500 font-semibold" : ""}>
                      {goal.deadline} ({daysRemaining})
                    </span>
                  ) : (
                    <span>No deadline</span>
                  )}
                </div>

                <div className="flex items-center gap-2">
                  <span className={`text-xs font-extrabold ${pct >= 100 ? "text-emerald-500" : "text-indigo-500 dark:text-indigo-400"}`}>
                    {pct.toFixed(0)}%
                  </span>
                  
                  {pct < 100 && (
                    <div className="relative">
                      {quickAddGoalId === goal.id ? (
                        <div className="absolute right-0 bottom-0 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-xl rounded-xl p-2 z-10 flex items-center gap-1.5 animate-scaleUp">
                          <input
                            type="number"
                            value={quickAddAmount}
                            onChange={(e) => setQuickAddAmount(e.target.value)}
                            placeholder="Add amount"
                            className="w-18 border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 rounded-lg p-1 text-xs text-slate-800 dark:text-slate-100 focus:outline-none"
                            autoFocus
                          />
                          <button
                            onClick={() => handleQuickAdd(goal)}
                            className="py-1 px-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs"
                          >
                            Add
                          </button>
                          <button
                            onClick={() => setQuickAddGoalId(null)}
                            className="p-1 bg-slate-100 dark:bg-slate-700 text-slate-500 rounded-lg"
                          >
                            <X className="h-3 w-3" />
                          </button>
                        </div>
                      ) : (
                        <button
                          onClick={() => {
                            setQuickAddGoalId(goal.id);
                            setQuickAddAmount("");
                          }}
                          className="py-1 px-2.5 bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400 hover:bg-indigo-600 hover:text-white rounded-lg text-xxs font-bold transition-all cursor-pointer"
                        >
                          Quick Save
                        </button>
                      )}
                    </div>
                  )}

                  {pct >= 100 && (
                    <span className="flex items-center gap-0.5 py-0.5 px-2 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 rounded-lg text-xxs font-bold">
                      <Sparkles className="h-3 w-3" />
                      Goal Met
                    </span>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default GoalsTracker;