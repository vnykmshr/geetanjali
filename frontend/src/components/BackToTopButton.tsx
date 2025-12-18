import { useState, useEffect } from "react";
import { ArrowUpIcon } from "./icons";

const SCROLL_THRESHOLD = 400;

/**
 * Floating button that appears after scrolling down.
 * Smoothly scrolls back to top when clicked.
 */
export function BackToTopButton() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setVisible(window.scrollY > SCROLL_THRESHOLD);
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  if (!visible) return null;

  return (
    <button
      onClick={scrollToTop}
      className="fixed bottom-20 right-6 md:bottom-6 z-40 w-12 h-12 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-full shadow-lg hover:shadow-xl hover:bg-gray-50 dark:hover:bg-gray-700 transition-all flex items-center justify-center"
      aria-label="Back to top"
    >
      <ArrowUpIcon className="w-5 h-5 text-gray-600 dark:text-gray-300" />
    </button>
  );
}
