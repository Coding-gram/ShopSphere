import { Boxes, ClipboardClock, ClipboardList, ExternalLink, FolderTree, LayoutDashboard, Package, UsersRound } from 'lucide-react';
import { NavLink, Outlet } from 'react-router-dom';
import { Toaster } from 'sonner';
import { cn } from '@/lib/utils';

export default function AdminLayout() {
  return (
    <div className="admin-workspace flex min-h-screen overflow-x-hidden bg-muted/30">
      <aside className="hidden w-64 border-r border-border bg-card lg:block">
        <div className="p-6">
          <h2 className="font-heading text-xl font-semibold">ShopSphere</h2>
          <p className="text-xs text-muted-foreground">Admin Dashboard</p>
        </div>
        <nav className="px-3" aria-label="Admin navigation">
          <NavLink to="/admin" end className={({ isActive }) => cn('flex min-h-11 items-center gap-3 rounded-md px-3 text-sm font-medium transition-colors hover:bg-muted', isActive ? 'bg-muted text-accent' : 'text-foreground')}><LayoutDashboard className="h-4 w-4" aria-hidden="true" />Dashboard</NavLink>
          <NavLink to="/admin/products" className={({ isActive }) => cn('flex min-h-11 items-center gap-3 rounded-md px-3 text-sm font-medium transition-colors hover:bg-muted', isActive ? 'bg-muted text-accent' : 'text-foreground')}><Package className="h-4 w-4" aria-hidden="true" />Products</NavLink>
          <NavLink to="/admin/categories" className={({ isActive }) => cn('flex min-h-11 items-center gap-3 rounded-md px-3 text-sm font-medium transition-colors hover:bg-muted', isActive ? 'bg-muted text-accent' : 'text-foreground')}><FolderTree className="h-4 w-4" aria-hidden="true" />Categories</NavLink>
          <NavLink to="/admin/inventory" className={({ isActive }) => cn('flex min-h-11 items-center gap-3 rounded-md px-3 text-sm font-medium transition-colors hover:bg-muted', isActive ? 'bg-muted text-accent' : 'text-foreground')}><Boxes className="h-4 w-4" aria-hidden="true" />Inventory</NavLink>
          <NavLink to="/admin/customers" className={({ isActive }) => cn('flex min-h-11 items-center gap-3 rounded-md px-3 text-sm font-medium transition-colors hover:bg-muted', isActive ? 'bg-muted text-accent' : 'text-foreground')}><UsersRound className="h-4 w-4" aria-hidden="true" />Customers</NavLink>
          <NavLink to="/admin/audit-trail" className={({ isActive }) => cn('flex min-h-11 items-center gap-3 rounded-md px-3 text-sm font-medium transition-colors hover:bg-muted', isActive ? 'bg-muted text-accent' : 'text-foreground')}><ClipboardClock className="h-4 w-4" aria-hidden="true" />Audit trail</NavLink>
          <NavLink to="/admin/orders" className={({ isActive }) => cn('flex min-h-11 items-center gap-3 rounded-md px-3 text-sm font-medium transition-colors hover:bg-muted', isActive ? 'bg-muted text-accent' : 'text-foreground')}><ClipboardList className="h-4 w-4" aria-hidden="true" />Orders</NavLink>
        </nav>
      </aside>
      <div className="min-w-0 flex-1">
        <header className="flex min-h-16 flex-wrap items-center justify-between gap-3 border-b border-border bg-card px-4 py-3 sm:px-6">
          <p className="text-sm text-muted-foreground">Admin Panel</p>
          <div className="flex min-w-0 items-center gap-3"><nav className="flex max-w-[calc(100vw-9rem)] items-center gap-3 overflow-x-auto text-sm lg:hidden" aria-label="Admin mobile navigation"><NavLink to="/admin" end className={({ isActive }) => cn('shrink-0 font-medium', isActive ? 'text-accent' : 'text-foreground')}>Dashboard</NavLink><NavLink to="/admin/products" className={({ isActive }) => cn('shrink-0 font-medium', isActive ? 'text-accent' : 'text-foreground')}>Products</NavLink><NavLink to="/admin/categories" className={({ isActive }) => cn('shrink-0 font-medium', isActive ? 'text-accent' : 'text-foreground')}>Categories</NavLink><NavLink to="/admin/inventory" className={({ isActive }) => cn('shrink-0 font-medium', isActive ? 'text-accent' : 'text-foreground')}>Inventory</NavLink><NavLink to="/admin/customers" className={({ isActive }) => cn('shrink-0 font-medium', isActive ? 'text-accent' : 'text-foreground')}>Customers</NavLink><NavLink to="/admin/orders" className={({ isActive }) => cn('shrink-0 font-medium', isActive ? 'text-accent' : 'text-foreground')}>Orders</NavLink><NavLink to="/admin/audit-trail" className={({ isActive }) => cn('shrink-0 font-medium', isActive ? 'text-accent' : 'text-foreground')}>Audit trail</NavLink></nav><NavLink to="/" className="inline-flex shrink-0 items-center gap-2 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground">Store <ExternalLink className="h-3.5 w-3.5" aria-hidden="true" /></NavLink></div>
        </header>
        <main className="min-w-0 overflow-x-hidden p-4 sm:p-6">
          <Outlet />
        </main>
        <Toaster position="bottom-right" />
      </div>
    </div>
  );
}

