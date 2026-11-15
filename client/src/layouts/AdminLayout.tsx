import { Boxes, ClipboardClock, ClipboardList, ExternalLink, FolderTree, LayoutDashboard, Package, UsersRound } from 'lucide-react';
import { NavLink, Outlet } from 'react-router-dom';
import { Toaster } from 'sonner';
import { cn } from '@/lib/utils';

interface NavItem {
  to: string;
  end?: boolean;
  icon: typeof LayoutDashboard;
  label: string;
}

const navItems: NavItem[] = [
  { to: '/admin', end: true, icon: LayoutDashboard, label: 'Dashboard' },
  { to: '/admin/products', icon: Package, label: 'Products' },
  { to: '/admin/categories', icon: FolderTree, label: 'Categories' },
  { to: '/admin/inventory', icon: Boxes, label: 'Inventory' },
  { to: '/admin/orders', icon: ClipboardList, label: 'Orders' },
  { to: '/admin/customers', icon: UsersRound, label: 'Customers' },
  { to: '/admin/audit-trail', icon: ClipboardClock, label: 'Audit trail' },
];

export default function AdminLayout() {
  return (
    <div className="admin-workspace flex min-h-screen overflow-x-hidden bg-muted/30">
      <aside className="hidden w-64 flex-col border-r border-border bg-card lg:flex">
        <div className="border-b border-border px-6 py-5">
          <div className="flex items-center gap-3">
            <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary text-sm font-bold text-on-primary" aria-hidden="true">S</span>
            <div>
              <h2 className="font-heading text-base font-semibold text-foreground">ShopSphere</h2>
              <p className="text-[11px] font-medium uppercase tracking-[0.15em] text-muted-foreground">Admin</p>
            </div>
          </div>
        </div>
        <nav className="flex-1 space-y-0.5 px-3 py-4" aria-label="Admin navigation">
          {navItems.map(({ to, end, icon: Icon, label }) => (
            <NavLink key={to} to={to} end={end} className={({ isActive }) => cn('flex min-h-11 items-center gap-3 rounded-lg px-3 text-sm font-medium transition-all duration-200', isActive ? 'bg-accent/10 text-accent shadow-sm' : 'text-muted-foreground hover:bg-muted hover:text-foreground')}>
              <Icon className="h-4 w-4 shrink-0" aria-hidden="true" />{label}
            </NavLink>
          ))}
        </nav>
        <div className="border-t border-border px-3 py-4">
          <NavLink to="/" className="flex min-h-10 items-center gap-3 rounded-lg px-3 text-sm font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground">
            <ExternalLink className="h-4 w-4 shrink-0" aria-hidden="true" />Visit storefront
          </NavLink>
        </div>
      </aside>
      <div className="min-w-0 flex-1">
        <header className="sticky top-0 z-20 flex min-h-14 flex-wrap items-center justify-between gap-3 border-b border-border bg-card/95 px-4 py-2.5 backdrop-blur-sm sm:px-6">
          <p className="text-sm font-medium text-muted-foreground">Admin Panel</p>
          <div className="flex min-w-0 items-center gap-3">
            <nav className="flex max-w-[calc(100vw-9rem)] items-center gap-1 overflow-x-auto text-sm lg:hidden" aria-label="Admin mobile navigation">
              {navItems.map(({ to, end, label }) => (
                <NavLink key={to} to={to} end={end} className={({ isActive }) => cn('shrink-0 rounded-md px-2.5 py-1.5 font-medium transition-colors', isActive ? 'bg-accent/10 text-accent' : 'text-muted-foreground hover:text-foreground')}>{label}</NavLink>
              ))}
            </nav>
            <NavLink to="/" className="inline-flex shrink-0 items-center gap-2 rounded-md px-2.5 py-1.5 text-sm font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground lg:hidden">Store <ExternalLink className="h-3.5 w-3.5" aria-hidden="true" /></NavLink>
          </div>
        </header>
        <main className="min-w-0 overflow-x-hidden p-4 sm:p-6 lg:p-8">
          <Outlet />
        </main>
        <Toaster position="bottom-right" />
      </div>
    </div>
  );
}

