import type { Metadata } from "next";
import { brand } from "@/config/brand";
import { whatsappLink } from "@/lib/utils";
import ContactForm from "@/components/contact/ContactForm";
import FaqAccordion from "@/components/contact/FaqAccordion";
import { InstagramIcon, PhoneIcon, PinIcon, TruckIcon, WhatsAppIcon } from "@/components/ui/Icons";
import { SizeChartTable, SizeGuideNote } from "@/components/ui/SizeGuide";

export const metadata: Metadata = {
  title: brand.copy.sections.hitUsUp,
  description: brand.copy.contactIntro,
};

export default function ContactPage() {
  return (
    <div className="container-site section-padding">
      <h1 className="page-title">{brand.copy.sections.hitUsUp}</h1>
      <p className="mt-3 max-w-xl text-brand-dark">{brand.copy.contactIntro}</p>

      {/* Tap-to-call / tap-to-WhatsApp / DM */}
      <div className="mt-6 grid gap-3 sm:grid-cols-3">
        <a href={`tel:+${brand.phoneIntl}`} className="btn-primary">
          <PhoneIcon className="h-5 w-5" />
          Call {brand.phone}
        </a>
        <a
          href={whatsappLink(brand.copy.whatsappGeneral)}
          target="_blank" rel="noopener noreferrer" className="btn-whatsapp"
        >
          <WhatsAppIcon className="h-5 w-5" />
          WhatsApp
        </a>
        <a href={brand.instagramUrl} target="_blank" rel="noopener noreferrer" className="btn-outline">
          <InstagramIcon className="h-5 w-5" />
          {brand.copy.dmUs}
        </a>
      </div>

      {/* Pickup + delivery */}
      <div className="mt-10 grid gap-3 md:grid-cols-2">
        <section className="card p-5">
          <PinIcon className="h-6 w-6 text-brand-black" />
          <h2 className="mt-3 text-2xl">{brand.pickupLocation} pickup</h2>
          <p className="mt-2 text-brand-dark">{brand.address}</p>
          <p className="mt-2 text-brand-muted">{brand.pickupInstructions}</p>
        </section>
        <section className="card p-5">
          <TruckIcon className="h-6 w-6 text-brand-black" />
          <h2 className="mt-3 text-2xl">{brand.deliveryArea}</h2>
          <p className="mt-2 text-brand-dark">{brand.copy.deliveryExplainer}</p>
        </section>
      </div>

      <div className="mt-12 grid gap-10 lg:grid-cols-2">
        <section id="size" aria-labelledby="size-heading" className="min-w-0">
          <h2 id="size-heading" className="section-title mb-5">
            {brand.copy.sections.knowYourSize}
          </h2>
          <div className="card p-5">
            <SizeChartTable />
            <div className="mt-4">
              <SizeGuideNote />
            </div>
          </div>
        </section>

        <section aria-labelledby="msg-heading" className="min-w-0">
          <h2 id="msg-heading" className="section-title mb-5">
            Drop us a line
          </h2>
          <div className="card p-5">
            <ContactForm />
          </div>
        </section>
      </div>

      <section id="faq" className="mt-14" aria-labelledby="faq-heading">
        <h2 id="faq-heading" className="section-title mb-5">
          FAQs
        </h2>
        <FaqAccordion />
      </section>
    </div>
  );
}
