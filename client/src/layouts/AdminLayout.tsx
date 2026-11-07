import { Outlet } from 'react-router-dom';

export default function AdminLayout() {
  // Phase 6: Full admin layout with sidebar, stats header, responsive nav
  return (
    <div className="flex min-h-screen bg-muted/30">
      <aside className="hidden w-64 border-r border-border bg-card lg:block">
        <div className="p-6">
          <h2 className="font-heading text-xl font-semibold">ShopSphere</h2>
          <p className="text-xs text-muted-foreground">Admin Dashboard</p>
        </div>
      </aside>
      <div className="flex-1">
        <header className="border-b border-border bg-card px-6 py-4">
          <p className="text-sm text-muted-foreground">Admin Panel</p>
        </header>
        <main className="p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
}

