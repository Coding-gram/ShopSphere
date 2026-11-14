import { Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';

export default function NotFound() {
  return (
    <div className="flex min-h-[65vh] flex-col items-center justify-center px-4 py-24 text-center">
      <p className="font-heading text-[8rem] font-semibold leading-none text-muted-foreground/10 sm:text-[12rem]">
        404
      </p>
      <h1 className="-mt-6 font-heading text-2xl font-semibold text-foreground sm:-mt-8 sm:text-3xl">
        Page Not Found
      </h1>
      <p className="mt-3 max-w-sm text-sm leading-relaxed text-muted-foreground">
        The page you&apos;re looking for doesn&apos;t exist or has been moved.
        Let&apos;s get you back on track.
      </p>
      <Link
        to="/"
        className="mt-8 inline-flex items-center gap-2 rounded-md bg-accent px-6 py-2.5 text-sm font-semibold text-on-accent transition-colors duration-200 hover:bg-accent/90"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to Home
      </Link>
    </div>
  );
}
