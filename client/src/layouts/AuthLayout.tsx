import { Outlet, Link } from 'react-router-dom';

export default function AuthLayout() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="w-full max-w-md space-y-8">
        <div className="text-center">
          <Link to="/" className="inline-block">
            <h1 className="font-heading text-3xl font-semibold tracking-tight text-primary">
              ShopSphere
            </h1>
          </Link>
        </div>
        <div className="rounded-lg border border-border bg-card p-8 shadow-sm">
          <Outlet />
        </div>
      </div>
    </div>
  );
}

