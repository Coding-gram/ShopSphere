import { useState, useEffect } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { Search, ShoppingBag, User, Menu, LogOut, UserCircle, ClipboardList } from 'lucide-react';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import { useAuth } from '@/hooks/useAuth';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import MobileNav from './MobileNav';
import { useCart } from '@/hooks/useCart';

const navLinks = [
  { to: '/', label: 'Home' },
  { to: '/products', label: 'Shop' },
  { to: '/category/new-arrivals', label: 'New Arrivals' },
  { to: '/category/featured', label: 'Featured' },
];

export default function Header() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const { user, isAuthenticated, logout } = useAuth();
  const { cart } = useCart();
  const navigate = useNavigate();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  async function handleLogout() {
    try {
      await logout();
      toast.success('Signed out successfully');
      navigate('/');
    } catch {
      toast.error('Failed to sign out');
    }
  }

  return (
    <>
      <header
        className={cn(
          'sticky top-0 z-50 w-full transition-all duration-300',
          scrolled
            ? 'border-b border-border bg-card/95 shadow-sm backdrop-blur-md'
            : 'bg-transparent'
        )}
      >
        {/* Announcement bar */}
        <div className="bg-primary text-on-primary">
          <div className="mx-auto max-w-7xl px-4 py-1.5 text-center text-xs font-medium tracking-wide sm:text-sm">
            Complimentary shipping on orders above ₹2,999
          </div>
        </div>

        {/* Main header */}
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:h-18 lg:px-8">
          {/* Left: Hamburger + Nav */}
          <div className="flex items-center gap-6">
            <button
              type="button"
              onClick={() => setMobileOpen(true)}
              className="cursor-pointer p-1 text-foreground transition-colors hover:text-accent lg:hidden"
              aria-label="Open navigation menu"
            >
              <Menu className="h-5 w-5" />
            </button>

            <nav className="hidden lg:block" aria-label="Main navigation">
              <ul className="flex items-center gap-8">
                {navLinks.map((link) => (
                  <li key={link.to}>
                    <NavLink
                      to={link.to}
                      className={({ isActive }) =>
                        cn(
                          'text-sm font-medium tracking-wide transition-colors duration-200 hover:text-accent',
                          isActive ? 'text-accent' : 'text-foreground'
                        )
                      }
                    >
                      {link.label}
                    </NavLink>
                  </li>
                ))}
              </ul>
            </nav>
          </div>

          {/* Center: Logo */}
          <Link
            to="/"
            className="absolute left-1/2 -translate-x-1/2 lg:static lg:translate-x-0"
          >
            <h1 className="font-heading text-2xl font-semibold tracking-tight text-primary sm:text-3xl">
              ShopSphere
            </h1>
          </Link>

          {/* Right: Icons */}
          <div className="flex items-center gap-4 sm:gap-5">
            <Link
              to="/products"
              className="cursor-pointer p-1 text-foreground transition-colors duration-200 hover:text-accent"
              aria-label="Search products"
            >
              <Search className="h-5 w-5" />
            </Link>
            <Link
              to="/cart"
              className="relative cursor-pointer p-1 text-foreground transition-colors duration-200 hover:text-accent"
              aria-label={cart?.itemCount ? `Shopping cart, ${cart.itemCount} items` : 'Shopping cart'}
            >
              <ShoppingBag className="h-5 w-5" />
              {cart?.itemCount ? (
                <span aria-hidden="true" className="absolute -right-1.5 -top-1.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-accent px-1 text-[10px] font-semibold leading-none text-on-accent">
                  {cart.itemCount > 99 ? '99+' : cart.itemCount}
                </span>
              ) : null}
            </Link>

            {/* Account */}
            {isAuthenticated ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button
                    type="button"
                    className="flex items-center gap-1.5 cursor-pointer p-1 text-foreground transition-colors duration-200 hover:text-accent"
                    aria-label="Account menu"
                  >
                    <User className="h-5 w-5" />
                    <span className="hidden text-sm font-medium lg:inline">
                      {user?.name?.split(' ')[0]}
                    </span>
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-48">
                  <div className="px-2 py-1.5">
                    <p className="text-sm font-medium text-foreground">{user?.name}</p>
                    <p className="text-xs text-muted-foreground">{user?.email}</p>
                  </div>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem asChild>
                    <Link to="/profile" className="cursor-pointer">
                      <UserCircle className="mr-2 h-4 w-4" />
                      Profile
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link to="/orders" className="cursor-pointer">
                      <ClipboardList className="mr-2 h-4 w-4" />
                      Orders
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={handleLogout} className="cursor-pointer text-destructive">
                    <LogOut className="mr-2 h-4 w-4" />
                    Sign Out
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <Link
                to="/login"
                className="cursor-pointer p-1 text-foreground transition-colors duration-200 hover:text-accent"
                aria-label="Sign in"
              >
                <User className="h-5 w-5" />
              </Link>
            )}
          </div>
        </div>
      </header>

      <MobileNav
        open={mobileOpen}
        onClose={() => setMobileOpen(false)}
        links={isAuthenticated ? [...navLinks, { to: '/orders', label: 'Orders' }] : navLinks}
      />
    </>
  );
}
