"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { ReactNode, useEffect } from "react";

interface NavigationLinkProps {
  href: string;
  children: ReactNode;
  className?: string;
}

// Extend Window interface to include our custom property
declare global {
  interface Window {
    isRouteChanging?: boolean;
  }
}

export default function NavigationLink({ href, children, className }: NavigationLinkProps) {
  const router = useRouter();

  useEffect(() => {
    // Create a function to dispatch the routeChangeComplete event
    const completeNavigation = () => {
      if (window.isRouteChanging) {
        document.dispatchEvent(new Event("routeChangeComplete"));
      }
    };

    // Set up an event listener for when the new page content has loaded
    window.addEventListener('load', completeNavigation);
    
    // Clean up
    return () => {
      window.removeEventListener('load', completeNavigation);
    };
  }, []);

  const handleClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
    e.preventDefault();
    
    // Add loading state to window for global access
    window.isRouteChanging = true;
    
    // Dispatch custom events for loading bar
    document.dispatchEvent(new Event("routeChangeStart"));
    
    // Navigate after a small delay to show loading state
    setTimeout(() => {
      router.push(href);
    }, 100);
  };

  return (
    <Link 
      href={href} 
      onClick={handleClick} 
      className={className}
    >
      {children}
    </Link>
  );
}
