"use client";

import React, { Suspense } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';

// Search params wrapper component
function SearchParamsWrapper() {
  // Any component that uses useSearchParams would go here
  return null;
}

export default function NotFound() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center text-center px-4">
      <Suspense fallback={<div>Loading...</div>}>
        <SearchParamsWrapper />
      </Suspense>
      
      <h1 className="text-4xl font-bold mb-4">404 - Page Not Found</h1>
      <p className="text-lg mb-8">Sorry, the page you are looking for does not exist.</p>
      
      <Link href="/">
        <Button>
          Return to Home
        </Button>
      </Link>
    </div>
  );
}
