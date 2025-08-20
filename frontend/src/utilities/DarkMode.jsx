import React, { useState, useEffect } from "react";

const DarkMode = () => {
  const [isDark, setIsDark] = useState(
    () => localStorage.getItem("theme") === "dark"
  );

  useEffect(() => {
    document.documentElement.classList.toggle("dark", isDark);
    localStorage.setItem("theme", isDark ? "dark" : "light");
  }, [isDark]);
  return (
    <div className="fixed z-50">
      <button
        onClick={() => setIsDark(!isDark)}
        className="text-sm  px-3 py-1 rounded bg-gray-200 dark:text-white dark:bg-gray-900"
      >
        {isDark ? "☀ Light" : "🌙 Dark"}
      </button>
    </div>
  );
};

export default DarkMode;
