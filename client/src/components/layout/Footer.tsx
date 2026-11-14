import { Link } from 'react-router-dom';

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
  return (
    <footer className="border-t border-border bg-card" role="contentinfo">
      <div className="mx-auto max-w-7xl px-4 lg:px-8">
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

