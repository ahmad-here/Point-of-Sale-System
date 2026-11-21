import type { ReactNode } from 'react';
import Link from 'next/link';

export interface Guide {
  slug: string;
  title: string;
  description: string;
  published: string; // ISO date
  updated: string; // ISO date
  readMinutes: number;
  body: ReactNode;
}

export const guides: Guide[] = [
  {
    slug: 'how-to-choose-a-pos-system',
    title: 'How to Choose a POS System for a Small Business',
    description:
      'A practical checklist for picking point of sale software: the features that matter, hidden costs to watch for, and questions to ask before you commit.',
    published: '2026-11-21',
    updated: '2026-11-21',
    readMinutes: 7,
    body: (
      <>
        <p>
          A point of sale (POS) system is where every sale in your business is recorded. A good one speeds up the queue, keeps stock
          counts honest and tells you what is actually making money. A poor fit costs you in fees, training time and lost data. This
          guide walks through how to choose one without overpaying for features you will never use.
        </p>

        <h2>1. Start with how you sell today</h2>
        <p>Before comparing products, write down a normal day at your counter. Be specific:</p>
        <ul>
          <li>How many sales do you make on a busy day, and how many items are in a typical basket?</li>
          <li>How do customers pay — mostly cash, cards, mobile wallets or bank transfer?</li>
          <li>Do you sell physical stock that needs counting, services, or both?</li>
          <li>Does more than one person use the till? Do you sell in more than one location?</li>
        </ul>
        <p>
          A single-counter café with 80 sales a day has very different needs from a three-branch hardware store. Your answers decide which
          features are essential and which are nice-to-have.
        </p>

        <h2>2. The core features every POS should have</h2>
        <p>Regardless of size, look for these basics:</p>
        <ul>
          <li>
            <strong>Fast checkout.</strong> Adding items should take one tap or one barcode scan. Searching by name and SKU should be
            instant.
          </li>
          <li>
            <strong>Tax and discounts.</strong> The system should calculate sales tax or VAT automatically and let you apply a discount
            without doing maths on a calculator.
          </li>
          <li>
            <strong>Receipts.</strong> Printed or digital receipts with your business name, the tax breakdown and an order number you can
            look up later.
          </li>
          <li>
            <strong>Inventory tracking.</strong> Stock should go down automatically with every sale and back up when you process a refund.
          </li>
          <li>
            <strong>Refunds.</strong> Reversing a sale should be one action that fixes both the money and the stock count.
          </li>
          <li>
            <strong>Reports.</strong> At minimum: daily takings, sales by product and payment method breakdown.
          </li>
          <li>
            <strong>Data export.</strong> You should be able to download your sales and products as a spreadsheet. If you cannot get your
            data out, you are locked in.
          </li>
        </ul>

        <h2>3. Understand the real cost</h2>
        <p>The advertised monthly price is rarely the full picture. Add up:</p>
        <ul>
          <li>Software subscription per month, per register or per location.</li>
          <li>Card processing fees — often a percentage of every sale, which can dwarf the subscription.</li>
          <li>Required hardware such as proprietary terminals, tablets or stands.</li>
          <li>Add-ons for inventory, customer management or advanced reports that are not in the base plan.</li>
          <li>Contract length and cancellation fees.</li>
        </ul>
        <p>
          For a very small shop, a free browser-based tool such as{' '}
          <Link href="/dashboard">TOSPOS</Link> may cover the essentials, with card payments taken on a standalone terminal from your bank.
          As you grow, an integrated paid system may become worth it — but start by paying only for what you need.
        </p>

        <h2>4. Cloud, browser or installed?</h2>
        <p>There are three common models:</p>
        <ul>
          <li>
            <strong>Cloud POS</strong> stores data on the vendor’s servers. You can see reports from anywhere and use several devices, but
            you need a reliable internet connection and a subscription.
          </li>
          <li>
            <strong>Browser-local POS</strong> runs in a web browser and stores data on the device. It is free or cheap, private and works
            without an account, but each device has its own data and you are responsible for backups.
          </li>
          <li>
            <strong>Installed POS</strong> runs on a dedicated computer in the shop. It can be very fast and reliable but is harder to update
            and access remotely.
          </li>
        </ul>

        <h2>5. Test it with a real basket</h2>
        <p>
          Most POS products offer a free trial or free tier. Load ten of your real products and ring up a few realistic sales, including a
          refund and a cash sale with change. Time how long a five-item sale takes. Ask whoever works your till to try it too — if they find
          it confusing, queues will grow.
        </p>

        <h2>6. Questions to ask before you commit</h2>
        <ol>
          <li>Can I export all my data at any time, in a standard format?</li>
          <li>Does it work if the internet goes down?</li>
          <li>Which barcode scanners and receipt printers are supported?</li>
          <li>What happens to my data if I stop paying or the company closes?</li>
          <li>How is support provided, and is it included in the price?</li>
        </ol>

        <h2>The bottom line</h2>
        <p>
          Choose the simplest system that handles your daily workflow, lets you export your data and has costs you fully understand. You can
          always move up to something bigger once you know exactly what you need.
        </p>
      </>
    ),
  },
  {
    slug: 'inventory-management-basics',
    title: 'Inventory Management Basics: Reorder Points, Stock Counts and SKUs',
    description:
      'Learn how to set reorder levels, organise products with SKUs, run stock counts and avoid both stockouts and dead stock in a small retail business.',
    published: '2026-11-21',
    updated: '2026-11-21',
    readMinutes: 8,
    body: (
      <>
        <p>
          Inventory is usually the biggest investment a small shop makes. Too little stock and you turn customers away; too much and your
          cash is sitting on shelves gathering dust. Good inventory management is not complicated, but it does need a few consistent habits.
        </p>

        <h2>Give every product a SKU</h2>
        <p>
          A SKU (stock keeping unit) is a short code that uniquely identifies one product variant. “Blue T-shirt, size M” and “Blue T-shirt,
          size L” are different SKUs. If a product has a manufacturer barcode, using that barcode number as the SKU lets you scan it at the
          till.
        </p>
        <p>For products without barcodes, create a simple, readable pattern, for example:</p>
        <ul>
          <li>
            <strong>Category prefix + number:</strong> BEV-001, BEV-002 for beverages.
          </li>
          <li>
            <strong>Product + variant:</strong> TSH-BLU-M for a blue medium T-shirt.
          </li>
        </ul>
        <p>Never reuse a SKU for a different product — it breaks your sales history and reports.</p>

        <h2>Organise with categories</h2>
        <p>
          Categories such as “Drinks”, “Snacks” or “Accessories” make products faster to find at the register and let you see which part of
          the business earns the most. Keep the list short; ten well-chosen categories are more useful than fifty.
        </p>

        <h2>Set a reorder point for each product</h2>
        <p>
          A reorder point is the stock level at which you should place a new order. Set it too low and you run out before the delivery
          arrives. A simple formula works for most small shops:
        </p>
        <p>
          <strong>Reorder point = (average daily sales × supplier lead time in days) + safety stock</strong>
        </p>
        <p>
          Example: you sell about 6 bottles of a sauce per day, your supplier takes 4 days to deliver, and you want 2 days of buffer. That is
          (6 × 4) + (6 × 2) = 36. When stock drops to 36 bottles, reorder.
        </p>
        <p>
          In TOSPOS, enter this number as the product’s <em>reorder level</em>. The product is marked “Low Stock” and appears in the header
          alerts as soon as it reaches that level.
        </p>

        <h2>Count your stock regularly</h2>
        <p>
          Even with automatic tracking, the number in the system drifts from what is on the shelf because of breakage, theft, miscounted
          deliveries and sales rung up under the wrong item. Two approaches help:
        </p>
        <ul>
          <li>
            <strong>Full count:</strong> count everything, usually once or twice a year, often when the shop is closed.
          </li>
          <li>
            <strong>Cycle counts:</strong> count a small group of products every week — for example one category per week — so the whole shop
            is checked every couple of months without closing.
          </li>
        </ul>
        <p>
          Prioritise high-value and fast-moving items; they matter most when they are wrong. When the count differs from the system, correct
          the quantity and note the reason so you can spot patterns.
        </p>

        <h2>Record deliveries the day they arrive</h2>
        <p>
          Add received stock immediately and check the delivery against the invoice. If you receive many lines at once, a spreadsheet import
          is faster than typing. TOSPOS treats CSV rows whose SKU already exists as a delivery and adds the quantity to current stock.
        </p>

        <h2>Watch for dead stock</h2>
        <p>
          Dead stock is anything that has not sold in a long time. It ties up cash and shelf space. Review your best-seller and sales reports
          monthly: products that never appear are candidates for a discount, a bundle, or not reordering.
        </p>

        <h2>A simple weekly routine</h2>
        <ol>
          <li>Check low-stock alerts and place orders.</li>
          <li>Record all deliveries received this week.</li>
          <li>Cycle-count one category and correct differences.</li>
          <li>Look at the week’s best sellers and slow movers.</li>
          <li>Download a backup of your data.</li>
        </ol>
        <p>Twenty minutes a week on this routine prevents most stock problems before they cost you a sale.</p>
      </>
    ),
  },
  {
    slug: 'sales-tax-and-receipts-at-checkout',
    title: 'Sales Tax, Discounts and Receipts: Getting Checkout Right',
    description:
      'How sales tax and VAT are calculated at the till, the right order to apply discounts, what to put on a receipt and how to handle refunds cleanly.',
    published: '2026-11-21',
    updated: '2026-11-21',
    readMinutes: 6,
    body: (
      <>
        <p>
          Checkout is where small errors add up: a tax rate entered wrong, a discount applied in the wrong order, or a refund that fixes the
          cash drawer but not the stock count. This guide explains the mechanics so every sale is recorded correctly.
        </p>
        <p>
          <em>
            This article explains general concepts only and is not tax advice. Tax rules differ by country, state and product type — confirm
            your obligations with your local tax authority or an accountant.
          </em>
        </p>

        <h2>Tax-exclusive vs tax-inclusive prices</h2>
        <p>There are two ways to show prices:</p>
        <ul>
          <li>
            <strong>Tax-exclusive</strong> (common in the US and Canada): the shelf price is before tax, and tax is added at the till. A $10.00
            item with 8% tax costs $10.80.
          </li>
          <li>
            <strong>Tax-inclusive</strong> (common with VAT in the UK, EU, Australia and elsewhere): the shelf price already includes tax. A
            £12.00 item with 20% VAT contains £2.00 of VAT (12 ÷ 1.2 = 10 net).
          </li>
        </ul>
        <p>
          In TOSPOS, enter your tax percentage in Settings if your prices are tax-exclusive. If your prices already include tax, set the rate
          to 0% so tax is not added twice.
        </p>

        <h2>Apply discounts before tax</h2>
        <p>
          In most jurisdictions, a store discount reduces the taxable amount. The usual order is:
        </p>
        <ol>
          <li>Subtotal = sum of item prices × quantities</li>
          <li>Subtract the discount</li>
          <li>Calculate tax on the discounted amount</li>
          <li>Total = discounted subtotal + tax</li>
        </ol>
        <p>
          Example: subtotal $50.00, $5.00 discount, 8% tax. Taxable amount is $45.00, tax is $3.60, total is $48.60. TOSPOS calculates checkout
          in exactly this order.
        </p>

        <h2>Rounding</h2>
        <p>
          Calculate tax on the whole transaction and round once to two decimal places, rather than rounding each line separately, unless your
          tax authority requires per-line rounding. It avoids totals that are a cent off.
        </p>

        <h2>Giving change correctly</h2>
        <p>
          For cash sales, enter the amount the customer hands over and let the system calculate change. Count the change back to the customer
          starting from the total up to the amount tendered. Never close the drawer before the customer accepts their change; it prevents most
          disputes.
        </p>

        <h2>What to include on a receipt</h2>
        <ul>
          <li>Your business name, and address or phone number</li>
          <li>Date and time of the sale</li>
          <li>A unique order or receipt number</li>
          <li>Each item with quantity, unit price and line total</li>
          <li>Subtotal, any discount, tax amount (and rate), and total</li>
          <li>Payment method, and for cash the amount received and change given</li>
          <li>Your returns policy or a short thank-you message</li>
        </ul>
        <p>Some countries require extra details such as a tax registration number. Add them to your receipt footer if needed.</p>

        <h2>Handling refunds</h2>
        <p>
          A refund should reverse the whole transaction: the money goes back to the customer, the items return to stock (if resaleable) and the
          original sale is marked as refunded rather than deleted. Deleting sales destroys your audit trail and makes your reports wrong. In
          TOSPOS, use <strong>Refund</strong> on the sale; it returns items to stock and marks the payment refunded while keeping the record.
        </p>

        <h2>End-of-day check</h2>
        <p>
          At closing, compare the cash in the drawer with the cash sales recorded for the day (plus your opening float). Small differences
          happen; large or repeated ones are worth investigating. Record card terminal totals against card payments in the same way.
        </p>
      </>
    ),
  },
  {
    slug: 'daily-cash-register-closing-checklist',
    title: 'Daily Cash Register Closing Checklist for Small Shops',
    description:
      'A step-by-step end-of-day routine for counting the till, reconciling card payments, recording discrepancies and backing up your sales data.',
    published: '2026-11-21',
    updated: '2026-11-21',
    readMinutes: 5,
    body: (
      <>
        <p>
          Closing the register properly takes ten minutes and protects you from losses, mistakes and arguments. Use this checklist every day,
          ideally done by the same person or in pairs.
        </p>

        <h2>Before you start</h2>
        <ul>
          <li>Finish or void any open sale so nothing is half-recorded.</li>
          <li>Know your opening float — the cash you started the day with (for example, $100 in small notes and coins).</li>
        </ul>

        <h2>1. Pull the day’s figures</h2>
        <p>
          Open your sales report for today. In TOSPOS, the Sales page filtered to <em>Today</em> shows the number of orders and completed revenue,
          and the Payments page breaks totals down by payment method.
        </p>

        <h2>2. Count the cash</h2>
        <ol>
          <li>Remove the cash drawer and count in a quiet, secure place.</li>
          <li>Count each denomination separately and write the totals down.</li>
          <li>Subtract the opening float. What remains should equal your recorded cash sales.</li>
        </ol>
        <p>
          <strong>Expected cash = opening float + cash sales − cash refunds − cash paid out</strong>
        </p>

        <h2>3. Reconcile card and digital payments</h2>
        <p>
          Print or view the end-of-day total on your card terminal and compare it with card payments recorded in your POS. Do the same for mobile
          wallet and bank transfer payments. A mismatch usually means a sale was recorded with the wrong payment method.
        </p>

        <h2>4. Investigate differences</h2>
        <p>Small cash differences happen. When the count is off:</p>
        <ul>
          <li>Recount the drawer once.</li>
          <li>Look for sales recorded with the wrong payment method.</li>
          <li>Check for refunds given in cash but not recorded.</li>
          <li>Write down the difference and the likely reason in a simple log.</li>
        </ul>
        <p>Repeated shortages at the same time or with the same person are a signal to review procedures.</p>

        <h2>5. Prepare tomorrow’s float</h2>
        <p>
          Set aside the exact opening float for tomorrow, in useful denominations. Everything above the float goes to your safe or bank deposit.
        </p>

        <h2>6. Check stock alerts</h2>
        <p>
          While the day is fresh, look at low-stock alerts and note anything you need to reorder before tomorrow’s rush.
        </p>

        <h2>7. Back up your data</h2>
        <p>
          If your POS stores data on the device — as TOSPOS does — download a backup from Settings at least once a day. Store it somewhere other
          than the till computer, such as cloud storage or a USB stick. A backup takes seconds and protects months of sales history.
        </p>

        <h2>Printable checklist</h2>
        <ol>
          <li>Close open sales</li>
          <li>Open today’s sales and payments report</li>
          <li>Count cash and subtract float</li>
          <li>Compare cash with recorded cash sales</li>
          <li>Compare terminal total with card payments</li>
          <li>Log any difference and reason</li>
          <li>Prepare tomorrow’s float; deposit the rest</li>
          <li>Review low-stock alerts</li>
          <li>Download a data backup</li>
        </ol>
      </>
    ),
  },
];

export const getGuide = (slug: string) => guides.find(g => g.slug === slug);
