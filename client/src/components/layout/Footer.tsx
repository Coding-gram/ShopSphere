import { useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';

const footerSections = [
  {
    title: 'Shop',
    links: [
      { to: '/products', label: 'All Products' },
      { to: '/products?newArrivals=true&sort=createdAt:desc', label: 'New Arrivals' },
      { to: '/products?featured=true', label: 'Featured' },
      { to: '/products?sale=true', label: 'Sale' },
    ],
  },
  {
    title: 'Customer Service',
    links: [
      { to: '/contact', label: 'Contact Us' },
      { to: '/shipping', label: 'Shipping & Returns' },
      { to: '/faq', label: 'FAQ' },
      { to: '/size-guide', label: 'Size Guide' },
    ],
  },
  {
    title: 'Company',
    links: [
      { to: '/about', label: 'About Us' },
      { to: '/careers', label: 'Careers' },
      { to: '/sustainability', label: 'Sustainability' },
      { to: '/press', label: 'Press' },
    ],
  },
];

export default function Footer() {
  const [email, setEmail] = useState('');
  const [subscribed, setSubscribed] = useState(false);

  function handleSubscribe(e: React.FormEvent) {
    e.preventDefault();
    if (email.trim()) {
      setSubscribed(true);
      setEmail('');
    }
  }

  return (
    <footer className="border-t border-border bg-card" role="contentinfo">
      <div className="mx-auto max-w-7xl px-4 lg:px-8">
        {/* Newsletter */}
        <div className="border-b border-border py-12 sm:py-16">
          <div className="mx-auto max-w-xl text-center">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-accent">Stay in the loop</p>
            <h2 className="mt-3 font-heading text-2xl font-semibold text-foreground sm:text-3xl">
              Join the ShopSphere Edit
            </h2>
            <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
              New arrivals, exclusive offers, and style notes — delivered to your inbox.
            </p>
            {subscribed ? (
              <p className="mt-6 text-sm font-medium text-success">Thank you for subscribing!</p>
            ) : (
              <form onSubmit={handleSubscribe} className="mx-auto mt-6 flex max-w-sm gap-3">
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="your@email.com"
                  required
                  className="flex h-11 w-full rounded-md border border-border bg-background px-4 text-sm text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2"
                  aria-label="Email address for newsletter"
                />
                <button
                  type="submit"
                  className="inline-flex h-11 cursor-pointer items-center gap-1.5 whitespace-nowrap rounded-md bg-accent px-5 text-sm font-semibold text-on-accent transition-colors duration-200 hover:bg-accent/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                >
                  Subscribe
                  <ArrowRight className="h-3.5 w-3.5" aria-hidden="true" />
                </button>
              </form>
            )}
          </div>
        </div>

        {/* Top section */}
        <div className="grid gap-10 py-12 sm:grid-cols-2 lg:grid-cols-4 lg:py-16">
          {/* Brand */}
          <div className="space-y-4 sm:col-span-2 lg:col-span-1">
            <Link to="/">
              <h2 className="font-heading text-2xl font-semibold text-primary">
                ShopSphere
              </h2>
            </Link>
            <p className="max-w-xs text-sm leading-relaxed text-muted-foreground">
              Curated collections of premium products, designed for those who
              appreciate quality and timeless style.
            </p>
          </div>

          {/* Link columns */}
          {footerSections.map((section) => (
            <div key={section.title}>
              <h3 className="mb-4 text-xs font-semibold uppercase tracking-widest text-foreground">
                {section.title}
              </h3>
              <ul className="space-y-3">
                {section.links.map((link) => (
                  <li key={link.to}>
                    <Link
                      to={link.to}
                      className="text-sm text-muted-foreground transition-colors duration-200 hover:text-accent"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Bottom bar */}
        <div className="flex flex-col items-center justify-between gap-4 border-t border-border py-6 text-xs text-muted-foreground sm:flex-row">
          <p>&copy; {new Date().getFullYear()} ShopSphere. All rights reserved.</p>
          <div className="flex items-center gap-6">
            <Link to="/privacy" className="transition-colors hover:text-foreground">
              Privacy Policy
            </Link>
            <Link to="/terms" className="transition-colors hover:text-foreground">
              Terms of Service
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
