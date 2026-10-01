import type { Metadata } from 'next'
import { LAUNCH, DELIVERY, EXCHANGE, SELLER } from '@/lib/site'
import { SizeTable } from '@/components/SizeTable'

export const metadata: Metadata = { title: 'Policies and sizes', description: 'Refunds, exchanges, delivery, GST and the size guide.' }

const SECTIONS = [['refunds', 'Refunds'], ['exchanges', 'Exchanges'], ['delivery', 'Delivery'], ['gst', 'Prices and GST'], ['sizes', 'Size guide'], ['seller', 'Seller']] as const

export default function Policies() {
  return (
    <>
      <section className="wrap page-head">
        <h1 className="sig">Policies and sizes</h1>
      </section>
      <div className="wrap policies">
        <nav aria-label="On this page" className="pol-nav">
          {SECTIONS.map(([id, t]) => <a key={id} href={`#${id}`}>{t}</a>)}
        </nav>
        <div className="pol-body prose">
          <section id="refunds">
            <h2>Refunds</h2>
            <p>Kalaverio is a pre-order. No set is made until {LAUNCH.threshold} sets across the collection are paid for. Pre-order closes at the end of 24 October.</p>
            <p>If fewer than {LAUNCH.threshold} are paid for by then, every buyer is refunded in full, to the account they paid from, starting on {LAUNCH.decisionDate}. Banks take 5 to 7 working days to show it.</p>
            <p>If a set sells out while you are paying, you are refunded in full automatically.</p>
          </section>
          <section id="exchanges">
            <h2>Exchanges</h2>
            <p>{EXCHANGE}</p>
          </section>
          <section id="delivery">
            <h2>Delivery</h2>
            <p>On {LAUNCH.decisionDate} we write to every buyer at the same time. If {LAUNCH.threshold} or more sets are paid for, sets are cut and ship {DELIVERY}, to the address given at checkout.</p>
          </section>
          <section id="gst">
            <h2>Prices and GST</h2>
            <p>All prices are in Indian rupees and include GST.{SELLER.gst ? ` GSTIN ${SELLER.gst}.` : ''} A receipt is emailed when the bank confirms your payment.</p>
          </section>
          <section id="sizes">
            <h2>Size guide</h2>
            <p>Body measurements, in inches. Between sizes, take the larger.</p>
            <SizeTable />
          </section>
          <section id="seller">
            <h2>Seller</h2>
            <p>Kalaverio, by Zafirenzo. {SELLER.name}, {SELLER.address}. <a href={`mailto:${SELLER.email}`}>{SELLER.email}</a></p>
          </section>
        </div>
      </div>
    </>
  )
}
