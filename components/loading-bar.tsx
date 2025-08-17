"use client";

import { useEffect, useState } from "react";
import { usePathname, useSearchParams } from "next/navigation";

export default function LoadingBar() {
  const [isLoading, setIsLoading] = useState(false);
  const pathname = usePathname();
  const searchParams = useSearchParams();

  useEffect(() => {
    // Function to show loading state
    const handleStart = () => {
      setIsLoading(true);
    };

    // Function to hide loading state
    const handleComplete = () => {
      // Short delay to ensure animation completes smoothly
      setTimeout(() => {
        setIsLoading(false);
        window.isRouteChanging = false;
      }, 300);
    };

    // Add event listeners for route change start
    document.addEventListener("routeChangeStart", handleStart);
    
    // Add event listeners for route change complete and error
    document.addEventListener("routeChangeComplete", handleComplete);
    document.addEventListener("routeChangeError", handleComplete);

    return () => {
      // Clean up event listeners
      document.removeEventListener("routeChangeStart", handleStart);
      document.removeEventListener("routeChangeComplete", handleComplete);
      document.removeEventListener("routeChangeError", handleComplete);
    };
  }, []);

  // Reset loading state when pathname or searchParams change
  useEffect(() => {
    // If we're on a new page, finish the loading state
    if (window.isRouteChanging) {
      document.dispatchEvent(new Event("routeChangeComplete"));
    }
  }, [pathname, searchParams]);

  if (!isLoading) return null;

  return (
    <div className="fixed top-0 left-0 right-0 z-50 h-1 bg-blue-100">
      <div 
        className="h-full bg-gradient-to-r from-blue-500 to-purple-600 animate-loading-bar"
        style={{ width: "100%" }}
      />
    </div>
  );
}
