// src/AIWorkspace.jsx
import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import dataset from "./alpie_frontend_dataset.json";

// Simple avatars (you can swap with images later)
const AVATARS = {
  user: "👤",
  system: "🤖",
};

export default function AIWorkspace() {
  const [search, setSearch] = useState("");
  const [memory, setMemory] = useState(() => {
    const saved = localStorage.getItem("memory");
    return saved ? JSON.parse(saved) : [];
  });
  const [darkMode, setDarkMode] = useState(false);
  const [toast, setToast] = useState(null);

  useEffect(() => {
    localStorage.setItem("memory", JSON.stringify(memory));
  }, [memory]);

  // Keyboard shortcut: "M" for pin/unpin
  useEffect(() => {
    const handler = (e) => {
      if (e.key.toLowerCase() === "m") {
        const hovered = document.querySelector("[data-hovered='true']");
        if (hovered) {
          const id = parseInt(hovered.dataset.id, 10);
          toggleMemory(id);
        }
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [memory]);

  const toggleMemory = (id) => {
    if (memory.includes(id)) {
      setMemory(memory.filter((m) => m !== id));
      showToast("❌ Removed from Memory");
    } else {
      setMemory([...memory, id]);
      showToast("✅ Pinned to Memory");
    }
  };

  const showToast = (msg) => {
    setToast(msg);
    setTimeout(() => setToast(null), 2000);
  };

  const filtered = dataset.filter(
    (note) =>
      note.title.toLowerCase().includes(search.toLowerCase()) ||
      note.description.toLowerCase().includes(search.toLowerCase()) ||
      note.tags.some((t) => t.toLowerCase().includes(search.toLowerCase()))
  );

  return (
    <div
      className={
        darkMode
          ? "dark bg-gray-900 text-white min-h-screen"
          : "bg-gray-100 text-gray-900 min-h-screen"
      }
    >
      {/* Header */}
      <header className="flex items-center justify-between p-4 shadow bg-white dark:bg-gray-800">
        <h1 className="text-xl font-bold">🧠 Alpie AI Workspace</h1>
        <button
          onClick={() => setDarkMode(!darkMode)}
          className="px-3 py-1 bg-gray-200 dark:bg-gray-700 rounded-lg shadow"
        >
          {darkMode ? "🌞 Light Mode" : "🌙 Dark Mode"}
        </button>
      </header>

      <main className="flex h-[calc(100vh-60px)]">
        {/* Chat area */}
        <div className="flex-1 p-6 overflow-y-auto space-y-4">
          <input
            type="text"
            placeholder="🔎 Search messages..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full mb-4 p-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600"
          />

          <AnimatePresence>
            {filtered.map((note, idx) => (
              <motion.div
                key={note.id}
                data-id={note.id}
                data-hovered="false"
                onMouseEnter={(e) => (e.currentTarget.dataset.hovered = "true")}
                onMouseLeave={(e) => (e.currentTarget.dataset.hovered = "false")}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.2 }}
                className={`flex items-start gap-3 p-4 rounded-2xl shadow-md ${
                  idx % 2 === 0
                    ? "bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                    : "bg-gradient-to-r from-indigo-500 to-purple-600 text-white"
                }`}
              >
                {/* Avatar */}
                <div className="text-2xl">
                  {idx % 2 === 0 ? AVATARS.user : AVATARS.system}
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold">{note.title}</h3>
                  <p className="text-sm">{note.description}</p>
                  <div className="flex flex-wrap gap-2 mt-2">
                    {note.tags.map((tag, i) => (
                      <span
                        key={i}
                        className="text-xs px-2 py-0.5 rounded-full bg-blue-200 text-blue-800 dark:bg-indigo-500 dark:text-white"
                      >
                        #{tag}
                      </span>
                    ))}
                  </div>
                </div>
                {/* Pin button */}
                <button
                  onClick={() => toggleMemory(note.id)}
                  className="ml-2 px-3 py-1 text-sm bg-yellow-400 rounded-lg shadow hover:bg-yellow-500 text-gray-900"
                >
                  {memory.includes(note.id) ? "Unpin" : "Pin"}
                </button>
                {/* Shortcut hint */}
                <span className="text-xs bg-gray-400 dark:bg-gray-600 px-2 py-0.5 rounded-lg ml-2 text-white">
                  M
                </span>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>

        {/* Memory panel */}
        <aside className="w-80 p-6 border-l bg-gray-50 dark:bg-gray-900 dark:border-gray-700 overflow-y-auto">
          <h2 className="font-bold mb-4">📌 Memory</h2>
          {memory.length === 0 ? (
            <p className="text-sm text-gray-500">No pinned messages yet.</p>
          ) : (
            memory.map((id) => {
              const note = dataset.find((n) => n.id === id);
              return (
                <motion.div
                  key={id}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="mb-3 p-3 bg-white dark:bg-gray-800 rounded-lg shadow"
                >
                  <h3 className="font-semibold">{note.title}</h3>
                  <p className="text-xs">{note.description}</p>
                </motion.div>
              );
            })
          )}
        </aside>
      </main>

      {/* Toast notification */}
      <AnimatePresence>
        {toast && (
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 50 }}
            className="fixed bottom-6 right-6 px-4 py-2 bg-black text-white rounded-lg shadow-lg"
          >
            {toast}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
