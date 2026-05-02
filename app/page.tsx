import { ContactForm } from "@/components/ContactForm";
import { Hero } from "@/components/Hero";
import { TrustBlock } from "@/components/TrustBlock";

export default function HomePage() {
  return (
    <div className="mx-auto max-w-2xl px-4 pb-24 sm:px-6">
      <Hero />
      <div className="space-y-10">
        <TrustBlock />
        <ContactForm />
      </div>
    </div>
  );
}
