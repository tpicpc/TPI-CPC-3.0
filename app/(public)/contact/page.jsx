import SectionTitle from "@/components/SectionTitle";
import { Mail, MapPin, Phone } from "lucide-react";

export const metadata = { title: "Contact — TPI CPC" };

export default function ContactPage() {
  return (
    <div className="px-4 md:px-10 container mx-auto py-16">
      <SectionTitle title="Get in Touch" subtitle="We'd love to hear from you" />
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5 max-w-4xl mx-auto">
        <div className="rounded-xl border p-6 text-center">
          <Mail className="mx-auto mb-3 text-indigo-500" />
          <h3 className="font-bold">Email</h3>
          <p className="text-sm text-gray-600 dark:text-gray-300 mt-1">tpicpc@gmail.com</p>
        </div>
        <div className="rounded-xl border p-6 text-center">
          <MapPin className="mx-auto mb-3 text-indigo-500" />
          <h3 className="font-bold">Location</h3>
          <p className="text-sm text-gray-600 dark:text-gray-300 mt-1">Thakurgaon Polytechnic Institute</p>
        </div>
        <div className="rounded-xl border p-6 text-center">
          <Phone className="mx-auto mb-3 text-indigo-500" />
          <h3 className="font-bold">Facebook</h3>
          <a href="https://web.facebook.com/groups/tpicpc" target="_blank" rel="noopener noreferrer" className="text-sm text-indigo-500 hover:underline mt-1 block">
            Join our group
          </a>
        </div>
      </div>
    </div>
  );
}
