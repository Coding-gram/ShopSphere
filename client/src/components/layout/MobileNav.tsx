import { useEffect, useRef } from 'react';
import { Link, NavLink } from 'react-router-dom';
import { X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';

interface MobileNavProps {
  open: boolean;
  onClose: () => void;
  links: { to: string; label: string }[];
}

export default function MobileNav({ open, onClose, links }: MobileNavProps) {
  const closeButtonRef = useRef<HTMLButtonElement>(null);

  // Focus close button when opened
  useEffect(() => {
    if (open) {
      closeButtonRef.current?.focus();
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [open]);

  // Close on Escape
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    if (open) {
      document.addEventListener('keydown', handleEscape);
      return () => document.removeEventListener('keydown', handleEscape);
    }
  }, [open, onClose]);

  return (
    <AnimatePresence>
      {open && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-50 bg-black/40"
            onClick={onClose}
            aria-hidden="true"
          />

          {/* Drawer */}
          <motion.nav
            initial={{ x: '-100%' }}
            animate={{ x: 0 }}
            exit={{ x: '-100%' }}
            transition={{ type: 'tween', duration: 0.3, ease: 'easeOut' }}
            className="fixed inset-y-0 left-0 z-50 w-80 max-w-[85vw] bg-card shadow-xl"
            role="dialog"
            aria-modal="true"
            aria-label="Mobile navigation"
          >
            <div className="flex h-full flex-col">
              {/* Header */}
              <div className="flex items-center justify-between border-b border-border px-6 py-5">
                <Link to="/" onClick={onClose}>
                  <span className="font-heading text-2xl font-semibold text-primary">
                    ShopSphere
                  </span>
                </Link>
                <button
                  ref={closeButtonRef}
                  type="button"
                  onClick={onClose}
                  className="cursor-pointer rounded-md p-1.5 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
                  aria-label="Close navigation menu"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              {/* Links */}
              <ul className="flex-1 space-y-1 px-4 py-6">
                {links.map((link) => (
                  <li key={link.to}>
                    <NavLink
                      to={link.to}
                      onClick={onClose}
                      className={({ isActive }) =>
                        cn(
                          'block rounded-md px-4 py-3 text-sm font-medium transition-colors duration-200',
                          isActive
                            ? 'bg-accent/10 text-accent'
                            : 'text-foreground hover:bg-muted hover:text-accent'
                        )
                      }
                    >
                      {link.label}
                    </NavLink>
                  </li>
                ))}
              </ul>

              {/* Footer */}
              <div className="border-t border-border px-6 py-5">
                <Link
                  to="/login"
                  onClick={onClose}
                  className="block w-full rounded-md bg-primary px-4 py-2.5 text-center text-sm font-medium text-on-primary transition-colors duration-200 hover:bg-secondary"
                >
                  Sign In
                </Link>
              </div>
            </div>
          </motion.nav>
        </>
      )}
    </AnimatePresence>
  );
}

