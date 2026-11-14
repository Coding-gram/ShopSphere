import { useEffect } from 'react';
import { ArrowLeft, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';

const infoPages = {
  contact: {
    eyebrow: 'Customer care',
    title: 'Contact Us',
    intro: 'Your account keeps order details, delivery addresses, and cancellation availability in one place.',
    sections: [
      { heading: 'Order support', body: 'Sign in to review an order, see its current status, and use the available order actions.' },
      { heading: 'Shopping help', body: 'Use the catalog filters and product details to compare available products, pricing, and stock before adding an item to your cart.' },
    ],
    action: { to: '/orders', label: 'View my orders' },
  },
  shipping: {
    eyebrow: 'Customer care',
    title: 'Shipping & Returns',
    intro: 'Checkout calculates the final order total from the current product price and available stock before an order can be placed.',
    sections: [
      { heading: 'Shipping', body: 'The storefront currently highlights complimentary shipping on orders above ₹2,999. Review the server-calculated total at checkout before placing an order.' },
      { heading: 'Order changes', body: 'Eligible placed and paid orders can be cancelled from the order details page. Availability depends on the current order status.' },
    ],
    action: { to: '/orders', label: 'View my orders' },
  },
  faq: {
    eyebrow: 'Customer care',
    title: 'Frequently Asked Questions',
    intro: 'A few practical answers for navigating the current ShopSphere storefront.',
    sections: [
      { heading: 'Where can I find the newest products?', body: 'Open New Arrivals to see active products in newest-first order.' },
      { heading: 'How do I track an order?', body: 'After signing in, Order History shows the order status, delivery address, items, and payment status.' },
      { heading: 'Can I change a product quantity?', body: 'Cart quantities are checked against the server’s current stock before checkout.' },
    ],
    action: { to: '/products?sort=createdAt:desc', label: 'Browse new arrivals' },
  },
  'size-guide': {
    eyebrow: 'Customer care',
    title: 'Size Guide',
    intro: 'Sizing and available variants are product-specific.',
    sections: [
      { heading: 'Before you order', body: 'Review the product description and any listed variants on the product detail page. Availability is shown from the current catalog record.' },
      { heading: 'Need another option?', body: 'Use the catalog to compare similar products and check the latest stock before checkout.' },
    ],
    action: { to: '/products', label: 'Browse products' },
  },
  about: {
    eyebrow: 'ShopSphere',
    title: 'About Us',
    intro: 'ShopSphere is a curated storefront for products selected around quality, timeless style, and everyday usefulness.',
    sections: [
      { heading: 'A focused catalog', body: 'Browse collections across clothing, accessories, footwear, home, and beauty from one responsive catalog.' },
      { heading: 'A considered checkout', body: 'Prices, stock, delivery addresses, and order totals are validated by the server so customers see current information before ordering.' },
    ],
    action: { to: '/products', label: 'Explore the collection' },
  },
  careers: {
    eyebrow: 'ShopSphere',
    title: 'Careers',
    intro: 'There are no open roles published in the ShopSphere storefront at this time.',
    sections: [
      { heading: 'Stay connected', body: 'Current catalog and customer-facing updates are published through the storefront.' },
    ],
    action: { to: '/', label: 'Return home' },
  },
  sustainability: {
    eyebrow: 'ShopSphere',
    title: 'Sustainability',
    intro: 'ShopSphere does not currently publish product-level sustainability certifications or claims in this catalog.',
    sections: [
      { heading: 'Product information', body: 'Use each product description to review the material and craftsmanship details that are currently available.' },
      { heading: 'Thoughtful purchasing', body: 'The catalog is designed to make price, stock, and product details easy to review before you place an order.' },
    ],
    action: { to: '/products', label: 'Browse products' },
  },
  press: {
    eyebrow: 'ShopSphere',
    title: 'Press',
    intro: 'No press resources are currently published in the ShopSphere storefront.',
    sections: [
      { heading: 'Current collection', body: 'The catalog is the source of current product imagery, availability, and pricing.' },
    ],
    action: { to: '/products', label: 'View the catalog' },
  },
  privacy: {
    eyebrow: 'ShopSphere',
    title: 'Privacy Policy',
    intro: 'ShopSphere stores the information required for account, cart, address, and order features.',
    sections: [
      { heading: 'Account and order data', body: 'Your profile, delivery addresses, cart, and order history are available only through authenticated account routes.' },
      { heading: 'Payments', body: 'The current storefront uses simulated payment processing and does not collect real payment card details.' },
    ],
    action: { to: '/profile', label: 'Review my profile' },
  },
  terms: {
    eyebrow: 'ShopSphere',
    title: 'Terms of Service',
    intro: 'The catalog, checkout, and order features are designed to use current server-owned product pricing and stock.',
    sections: [
      { heading: 'Catalog availability', body: 'Product prices and availability are revalidated at checkout, so the final order total may differ from a previously viewed catalog entry.' },
      { heading: 'Simulated payment', body: 'This storefront uses simulated payment processing. It records success or failure for an order but does not make a real payment charge.' },
    ],
    action: { to: '/products', label: 'Read the catalog' },
  },
} as const;

export type StoreInfoPage = keyof typeof infoPages;

export default function StoreInfo({ page }: { page: StoreInfoPage }) {
  const content = infoPages[page];

  useEffect(() => {
    document.title = `${content.title} — ShopSphere`;
    return () => { document.title = 'ShopSphere'; };
  }, [content.title]);

  return (
    <main className="mx-auto max-w-3xl px-4 py-12 sm:py-16 lg:px-8">
      <Link to="/" className="inline-flex min-h-10 items-center gap-2 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground">
        <ArrowLeft className="h-4 w-4" aria-hidden="true" />
        Back to ShopSphere
      </Link>

      <header className="mt-10 border-b border-border pb-8">
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-accent">{content.eyebrow}</p>
        <h1 className="mt-3 font-heading text-4xl font-semibold tracking-tight text-foreground sm:text-5xl">{content.title}</h1>
        <p className="mt-5 max-w-2xl text-base leading-relaxed text-muted-foreground sm:text-lg">{content.intro}</p>
      </header>

      <div className="space-y-9 py-10">
        {content.sections.map((section) => (
          <section key={section.heading}>
            <h2 className="font-heading text-xl font-semibold text-foreground">{section.heading}</h2>
            <p className="mt-3 leading-relaxed text-muted-foreground">{section.body}</p>
          </section>
        ))}
      </div>

      <Link to={content.action.to} className="inline-flex min-h-11 items-center gap-2 rounded-md bg-primary px-5 py-2.5 text-sm font-semibold text-on-primary transition-colors hover:bg-secondary">
        {content.action.label}
        <ArrowRight className="h-4 w-4" aria-hidden="true" />
      </Link>
    </main>
  );
}
