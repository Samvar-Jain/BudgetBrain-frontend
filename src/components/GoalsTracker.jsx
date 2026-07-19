import { useState, useEffect } from "react";
import apiClient from "../api/client";

function GoalsTracker() {
  const [goals, setGoals] = useState([]);
  const [error, setError] = useState(null);
  const [showForm, setShowForm] = useState(false);
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
        deadline: formData.deadline,
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

  return (
    <div className="bg-white rounded-lg shadow-md p-6 max-w-md">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-bold text-gray-800">Savings Goals</h2>
        <button
          onClick={() => setShowForm(!showForm)}
          className="text-sm bg-green-600 hover:bg-green-700 text-white font-semibold py-1 px-3 rounded"
        >
          {showForm ? "Cancel" : "+ New Goal"}
        </button>
      </div>

      {showForm && (
        <form onSubmit={handleCreateGoal} className="flex flex-col gap-2 mb-4 p-3 bg-gray-50 rounded">
          <input
            type="text"
            name="name"
            placeholder="Goal name (e.g. Emergency Fund)"
            value={formData.name}
            onChange={handleFormChange}
            required
            className="border border-gray-300 rounded p-2 text-sm"
          />
          <input
            type="number"
            name="targetAmount"
            placeholder="Target amount"
            value={formData.targetAmount}
            onChange={handleFormChange}
            required
            className="border border-gray-300 rounded p-2 text-sm"
          />
          <input
            type="number"
            name="currentAmount"
            placeholder="Current amount saved"
            value={formData.currentAmount}
            onChange={handleFormChange}
            className="border border-gray-300 rounded p-2 text-sm"
          />
          <input
            type="date"
            name="deadline"
            value={formData.deadline}
            onChange={handleFormChange}
            className="border border-gray-300 rounded p-2 text-sm"
          />
          <button
            type="submit"
            className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 rounded text-sm"
          >
            Save Goal
          </button>
        </form>
      )}

      {error && <p className="text-red-600 text-sm mb-2">{error}</p>}

      <div className="flex flex-col gap-3">
        {goals.length === 0 && !showForm && (
          <p className="text-gray-500 text-sm">No goals yet. Add one to get started.</p>
        )}
        {goals.map((goal) => {
          const pct = Math.min(100, (goal.currentAmount / goal.targetAmount) * 100);
          return (
            <div key={goal.id} className="border border-gray-200 rounded p-3">
              <div className="flex justify-between items-start mb-1">
                <span className="font-semibold text-gray-800">{goal.name}</span>
                <button
                  onClick={() => handleDeleteGoal(goal.id)}
                  className="text-red-500 hover:text-red-700 text-xs"
                >
                  Delete
                </button>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2 mb-1">
                <div
                  className="bg-green-500 h-2 rounded-full transition-all"
                  style={{ width: `${pct}%` }}
                ></div>
              </div>
              <div className="flex justify-between text-xs text-gray-600">
                <span>₹{goal.currentAmount.toLocaleString()} / ₹{goal.targetAmount.toLocaleString()}</span>
                <span>{pct.toFixed(0)}%</span>
                {goal.deadline && <span>by {goal.deadline}</span>}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default GoalsTracker;