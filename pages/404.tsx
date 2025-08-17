import { useRouter } from 'next/router';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

export default function Custom404() {
  const router = useRouter();
  
  return (
    <div className="min-h-screen flex flex-col items-center justify-center text-center px-4">
      <h1 className="text-4xl font-bold mb-4">404 - Page Not Found</h1>
      <p className="text-lg mb-8">Sorry, the page you are looking for does not exist.</p>
      
      <div className="flex gap-4">
        <Button onClick={() => router.back()} variant="outline">
          Go Back
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
