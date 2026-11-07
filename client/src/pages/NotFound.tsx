import { Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';

export default function NotFound() {
  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center px-4 py-24 text-center">
      <p className="text-7xl font-heading font-semibold text-muted-foreground/30 sm:text-9xl">
        404
      </p>
      <h1 className="mt-4 font-heading text-2xl font-semibold text-foreground sm:text-3xl">
        Page Not Found
      </h1>
      <p className="mt-3 max-w-sm text-sm text-muted-foreground">
        The page you&apos;re looking for doesn&apos;t exist or has been moved.
      </p>
      <Link
        to="/"
        className="mt-8 inline-flex items-center gap-2 rounded-md bg-primary px-6 py-2.5 text-sm font-medium text-on-primary transition-colors hover:bg-secondary"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to Home
      </Link>
    </div>
  );
}

