"use client";

import React, { Suspense } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { usePathname } from 'next/navigation';

// Wrapper for any client components that use search params
function ClientComponentWrapper() {
  // The component that uses useSearchParams would go here
  const pathname = usePathname();
  return <p className="text-muted-foreground mb-4">Current path: {pathname}</p>;
}

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  console.error(error); // Log the error to console
  return (
    <div className="min-h-screen flex flex-col items-center justify-center text-center px-4">
      <Suspense fallback={<div>Loading...</div>}>
        <ClientComponentWrapper />
      </Suspense>

      <h1 className="text-4xl font-bold mb-4">Something went wrong!</h1>
      <p className="text-lg mb-8">We apologize for the inconvenience.</p>
      
      <div className="flex gap-4">
        <Button onClick={reset} variant="outline">
          Try again
        </Button>
        
        <Link href="/">
          <Button>
            Return to Home
          </Button>
        </Link>
      </div>
    </div>
  );
}
