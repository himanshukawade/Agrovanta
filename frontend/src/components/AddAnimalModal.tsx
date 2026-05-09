"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";

interface AddAnimalModalProps {
  onClose: () => void;
  onSuccess: () => void;
}

interface Farm {
  id: string;
  name: string;
}

export default function AddAnimalModal({ onClose, onSuccess }: AddAnimalModalProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [farms, setFarms] = useState<Farm[]>([]);
  
  const [formData, setFormData] = useState({
    farm_id: "",
    species: "cattle",
    tag_number: "",
    age: "",
    weight: ""
  });

  useEffect(() => {
    // Fetch user's farms to populate dropdown
    const fetchFarms = async () => {
      try {
        const token = localStorage.getItem("agrovanta_token");
        const res = await fetch("http://localhost:8000/api/farms", {
          headers: { Authorization: `Bearer ${token}` }
        });
        if (res.ok) {
          const data = await res.json();
          setFarms(data);
          if (data.length > 0) {
            setFormData(prev => ({ ...prev, farm_id: data[0].id }));
          } else {
            // If no farm exists, auto-create a default one
            createDefaultFarm(token);
          }
        } else if (res.status === 401) {
          localStorage.removeItem("agrovanta_token");
          localStorage.removeItem("agrovanta_user");
          window.location.href = "/signin";
        }
      } catch (err) {
        console.error("Failed to fetch farms", err);
      }
    };
    fetchFarms();
  }, []);

  const createDefaultFarm = async (token: string | null) => {
    try {
      const res = await fetch("http://localhost:8000/api/farms", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ name: "My Farm", location: "Headquarters" })
      });
      if (res.ok) {
        const farm = await res.json();
        setFarms([farm]);
        setFormData(prev => ({ ...prev, farm_id: farm.id }));
      }
    } catch (err) {
      console.error("Failed to create default farm", err);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const token = localStorage.getItem("agrovanta_token");
      const res = await fetch("http://localhost:8000/api/livestock/animals", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          farm_id: formData.farm_id,
          species: formData.species,
          tag_number: formData.tag_number,
          age: formData.age ? parseInt(formData.age) : null,
          weight: formData.weight ? parseFloat(formData.weight) : null
        })
      });

      if (!res.ok) {
        if (res.status === 401) {
          localStorage.removeItem("agrovanta_token");
          localStorage.removeItem("agrovanta_user");
          window.location.href = "/signin";
          return;
        }
        const data = await res.json();
        throw new Error(data.detail || "Failed to add animal");
      }

      onSuccess();
    } catch (err: unknown) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError("An unknown error occurred");
      }
      setLoading(false);
    }
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center px-4 sm:px-0">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="absolute inset-0 bg-black/60 backdrop-blur-sm"
          onClick={onClose}
        ></motion.div>
        
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          className="relative w-full max-w-lg bg-slate-800 border border-white/10 rounded-2xl shadow-2xl overflow-hidden"
        >
          <div className="px-6 py-4 border-b border-white/10 flex items-center justify-between bg-slate-900/50">
            <h3 className="text-xl font-bold text-white">Add New Animal</h3>
            <button onClick={onClose} className="text-white/50 hover:text-white transition-colors">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          <form onSubmit={handleSubmit} className="p-6 space-y-4">
            {error && (
              <div className="bg-red-500/20 text-red-200 p-3 rounded-lg text-sm border border-red-500/30">
                {error}
              </div>
            )}

            <div className="space-y-4">
              {farms.length > 0 && (
                <div>
                  <label className="block text-sm font-medium text-white/70 mb-1">Select Farm</label>
                  <select
                    required
                    value={formData.farm_id}
                    onChange={e => setFormData({ ...formData, farm_id: e.target.value })}
                    className="w-full bg-slate-900/50 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-emerald-500 transition-colors appearance-none"
                  >
                    {farms.map(farm => (
                      <option key={farm.id} value={farm.id}>{farm.name}</option>
                    ))}
                  </select>
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-white/70 mb-1">Tag Number (Unique)</label>
                <input
                  type="text"
                  required
                  value={formData.tag_number}
                  onChange={e => setFormData({ ...formData, tag_number: e.target.value })}
                  placeholder="e.g. TG-1042"
                  className="w-full bg-slate-900/50 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-white/30 focus:outline-none focus:border-emerald-500 transition-colors"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-white/70 mb-1">Species</label>
                  <select
                    required
                    value={formData.species}
                    onChange={e => setFormData({ ...formData, species: e.target.value })}
                    className="w-full bg-slate-900/50 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-emerald-500 transition-colors appearance-none"
                  >
                    <option value="cattle">Cattle</option>
                    <option value="sheep">Sheep</option>
                    <option value="goat">Goat</option>
                    <option value="pig">Pig</option>
                    <option value="poultry">Poultry</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-white/70 mb-1">Age (Months)</label>
                  <input
                    type="number"
                    min="0"
                    value={formData.age}
                    onChange={e => setFormData({ ...formData, age: e.target.value })}
                    placeholder="e.g. 24"
                    className="w-full bg-slate-900/50 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-white/30 focus:outline-none focus:border-emerald-500 transition-colors"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-white/70 mb-1">Weight (kg)</label>
                <input
                  type="number"
                  step="0.1"
                  min="0"
                  value={formData.weight}
                  onChange={e => setFormData({ ...formData, weight: e.target.value })}
                  placeholder="e.g. 550.5"
                  className="w-full bg-slate-900/50 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-white/30 focus:outline-none focus:border-emerald-500 transition-colors"
                />
              </div>
            </div>

            <div className="mt-8 flex justify-end gap-3">
              <button
                type="button"
                onClick={onClose}
                className="px-5 py-2.5 rounded-xl font-medium text-white/70 hover:bg-white/5 transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading}
                className="bg-emerald-500 hover:bg-emerald-600 disabled:opacity-50 text-white px-6 py-2.5 rounded-xl font-medium transition-colors shadow-lg shadow-emerald-500/20 flex items-center justify-center min-w-[120px]"
              >
                {loading ? (
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                ) : (
                  "Save Animal"
                )}
              </button>
            </div>
          </form>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
