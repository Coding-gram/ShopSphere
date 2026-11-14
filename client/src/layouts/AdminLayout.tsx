import { ClipboardList, ExternalLink, FolderTree, LayoutDashboard, Package } from 'lucide-react';
import { NavLink, Outlet } from 'react-router-dom';
import { cn } from '@/lib/utils';

export default function AdminLayout() {
  return (
    <div className="flex min-h-screen bg-muted/30">
      <aside className="hidden w-64 border-r border-border bg-card lg:block">
        <div className="p-6">
          <h2 className="font-heading text-xl font-semibold">ShopSphere</h2>
          <p className="text-xs text-muted-foreground">Admin Dashboard</p>
        </div>
        <nav className="px-3" aria-label="Admin navigation">
          <NavLink to="/admin" end className={({ isActive }) => cn('flex min-h-11 items-center gap-3 rounded-md px-3 text-sm font-medium transition-colors hover:bg-muted', isActive ? 'bg-muted text-accent' : 'text-foreground')}><LayoutDashboard className="h-4 w-4" aria-hidden="true" />Dashboard</NavLink>
          <NavLink to="/admin/products" className={({ isActive }) => cn('flex min-h-11 items-center gap-3 rounded-md px-3 text-sm font-medium transition-colors hover:bg-muted', isActive ? 'bg-muted text-accent' : 'text-foreground')}><Package className="h-4 w-4" aria-hidden="true" />Products</NavLink>
          <NavLink to="/admin/categories" className={({ isActive }) => cn('flex min-h-11 items-center gap-3 rounded-md px-3 text-sm font-medium transition-colors hover:bg-muted', isActive ? 'bg-muted text-accent' : 'text-foreground')}><FolderTree className="h-4 w-4" aria-hidden="true" />Categories</NavLink>
          <NavLink to="/admin/orders" className={({ isActive }) => cn('flex min-h-11 items-center gap-3 rounded-md px-3 text-sm font-medium transition-colors hover:bg-muted', isActive ? 'bg-muted text-accent' : 'text-foreground')}><ClipboardList className="h-4 w-4" aria-hidden="true" />Orders</NavLink>
        </nav>
      </aside>
      <div className="flex-1">
        <header className="flex min-h-16 items-center justify-between gap-4 border-b border-border bg-card px-4 py-3 sm:px-6">
          <p className="text-sm text-muted-foreground">Admin Panel</p>
          <div className="flex items-center gap-4"><NavLink to="/admin" end className={({ isActive }) => cn('text-sm font-medium lg:hidden', isActive ? 'text-accent' : 'text-foreground')}>Dashboard</NavLink><NavLink to="/admin/products" className={({ isActive }) => cn('text-sm font-medium lg:hidden', isActive ? 'text-accent' : 'text-foreground')}>Products</NavLink><NavLink to="/admin/orders" className={({ isActive }) => cn('text-sm font-medium lg:hidden', isActive ? 'text-accent' : 'text-foreground')}>Orders</NavLink><NavLink to="/" className="inline-flex items-center gap-2 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground">Store <ExternalLink className="h-3.5 w-3.5" aria-hidden="true" /></NavLink></div>
        </header>
        <main className="p-4 sm:p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
}

