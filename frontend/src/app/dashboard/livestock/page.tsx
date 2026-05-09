"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import AddAnimalModal from "../../../components/AddAnimalModal";

interface Animal {
  id: string;
  tag_number: string;
  species: string;
  age: number | null;
  weight: number | null;
  created_at: string;
}

export default function LivestockPage() {
  const [animals, setAnimals] = useState<Animal[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [error, setError] = useState("");

  const fetchAnimals = async () => {
    try {
      const token = localStorage.getItem("agrovanta_token");
      if (!token) return;

      const res = await fetch("http://localhost:8000/api/livestock/animals", {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      if (!res.ok) {
        if (res.status === 401) {
          localStorage.removeItem("agrovanta_token");
          localStorage.removeItem("agrovanta_user");
          window.location.href = "/signin";
          return;
        }
        throw new Error("Failed to fetch animals");
      }
      const data = await res.json();
      setAnimals(data);
    } catch (err: unknown) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError("An unknown error occurred");
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAnimals();
  }, []);

  return (
    <div className="flex flex-col h-full w-full">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-white">Livestock Management</h1>
          <p className="text-white/60 mt-1">Manage your animals and track antimicrobial usage.</p>
        </div>
        <button
          onClick={() => setIsModalOpen(true)}
          className="bg-emerald-500 hover:bg-emerald-600 text-white px-5 py-2.5 rounded-xl font-medium transition-colors flex items-center gap-2 shadow-lg shadow-emerald-500/20"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          Add Animal
        </button>
      </div>

      {error && (
        <div className="bg-red-500/20 border border-red-500/50 text-red-200 px-4 py-3 rounded-xl mb-6">
          {error}
        </div>
      )}

      {loading ? (
        <div className="flex-1 flex items-center justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-emerald-500"></div>
        </div>
      ) : animals.length === 0 ? (
        <div className="flex-1 flex flex-col items-center justify-center border-2 border-dashed border-white/10 rounded-2xl p-12 text-center bg-white/5">
          <div className="w-16 h-16 rounded-full bg-white/5 flex items-center justify-center mb-4">
            <svg className="w-8 h-8 text-white/40" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 002-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
            </svg>
          </div>
          <h3 className="text-xl font-medium text-white mb-2">No animals found</h3>
          <p className="text-white/50 max-w-sm mb-6">Get started by adding your first animal to track their health and treatments.</p>
          <button
            onClick={() => setIsModalOpen(true)}
            className="bg-white/10 hover:bg-white/15 text-white px-4 py-2 rounded-lg font-medium transition-colors"
          >
            Add an animal
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {animals.map((animal, index) => (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
              key={animal.id}
              className="bg-white/10 border border-white/10 rounded-2xl p-5 hover:bg-white/15 transition-all cursor-pointer group"
            >
              <div className="flex justify-between items-start mb-4">
                <div className="p-2.5 bg-emerald-500/20 text-emerald-400 rounded-lg">
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                  </svg>
                </div>
                <span className="text-xs font-medium bg-white/10 text-white/80 px-2.5 py-1 rounded-full">
                  {animal.species}
                </span>
              </div>
              <h3 className="text-xl font-bold text-white mb-1">Tag: {animal.tag_number}</h3>
              <div className="flex items-center gap-4 text-sm text-white/60">
                <span>{animal.age ? `${animal.age} mo` : 'N/A'}</span>
                <span className="w-1 h-1 bg-white/20 rounded-full"></span>
                <span>{animal.weight ? `${animal.weight} kg` : 'N/A'}</span>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      {isModalOpen && (
        <AddAnimalModal
          onClose={() => setIsModalOpen(false)}
          onSuccess={() => {
            setIsModalOpen(false);
            fetchAnimals();
          }}
        />
      )}
    </div>
  );
}
