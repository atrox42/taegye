import type { Metadata } from "next";

import { ContactEmail } from "@/components/contact-email";

export const metadata: Metadata = {
  title: "Contact",
};

export default function ContactPage() {
  return (
    <article className="site-page text-page contact-page site-gutter">
      <h1 className="text-page-title site-type">Contact</h1>
      <div className="contact-body text-page-body">
        <ContactEmail />
      </div>
    </article>
  );
}
