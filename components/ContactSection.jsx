"use client";

import SectionTitle from "@/components/SectionTitle";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Facebook, Mail, MapPin, Send } from "lucide-react";
import { useState } from "react";
import toast from "react-hot-toast";

export default function ContactSection() {
  const [form, setForm] = useState({ name: "", email: "", message: "" });
  const [sending, setSending] = useState(false);

  const onSubmit = (e) => {
    e.preventDefault();
    setSending(true);
    const subject = encodeURIComponent(`Contact from ${form.name || "TPI CPC website"}`);
    const body = encodeURIComponent(`From: ${form.name} <${form.email}>\n\n${form.message}`);
    window.location.href = `mailto:tpicpc@gmail.com?subject=${subject}&body=${body}`;
    toast.success("Opening your email client");
    setTimeout(() => setSending(false), 1500);
  };

  const cardCls =
    "rounded-xl border border-gray-200 dark:border-white/10 bg-white/70 dark:bg-white/5 backdrop-blur-sm";
  const cardHover = "hover:bg-white dark:hover:bg-white/10 hover:border-indigo-400/60 dark:hover:border-violet-400/40 transition";

  return (
    <section className="py-20 px-4 md:px-10 container mx-auto">
      <SectionTitle
        title="Get in Touch"
        subtitle="Have a question, partnership idea, or want to collaborate? Send us a message and our team will get back to you."
      />

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6 max-w-6xl mx-auto">
        <div className="lg:col-span-2 space-y-4">
          <a href="mailto:tpicpc@gmail.com" className={`block p-5 ${cardCls} ${cardHover} group`}>
            <div className="flex items-start gap-4">
              <div className="w-11 h-11 rounded-lg bg-indigo-500/10 dark:bg-indigo-500/15 text-indigo-600 dark:text-indigo-400 flex items-center justify-center shrink-0">
                <Mail size={20} />
              </div>
              <div className="min-w-0">
                <h3 className="font-semibold text-gray-900 dark:text-white">Email</h3>
                <p className="text-sm text-gray-600 dark:text-gray-300 mt-0.5">tpicpc@gmail.com</p>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">We reply within 24 hours</p>
              </div>
            </div>
          </a>

          <div className={`p-5 ${cardCls}`}>
            <div className="flex items-start gap-4">
              <div className="w-11 h-11 rounded-lg bg-violet-500/10 dark:bg-violet-500/15 text-violet-600 dark:text-violet-400 flex items-center justify-center shrink-0">
                <MapPin size={20} />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 dark:text-white">Location</h3>
                <p className="text-sm text-gray-600 dark:text-gray-300 mt-0.5">Thakurgaon Polytechnic Institute</p>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Thakurgaon, Bangladesh</p>
              </div>
            </div>
          </div>

          <a
            href="https://web.facebook.com/TPICPCThakurgonPolytechnicInstitute"
            target="_blank"
            rel="noopener noreferrer"
            className={`block p-5 ${cardCls} ${cardHover} group`}
          >
            <div className="flex items-start gap-4">
              <div className="w-11 h-11 rounded-lg bg-blue-500/10 dark:bg-blue-500/15 text-blue-600 dark:text-blue-400 flex items-center justify-center shrink-0">
                <Facebook size={20} />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 dark:text-white">Facebook</h3>
                <p className="text-sm text-gray-600 dark:text-gray-300 mt-0.5">Follow our official page</p>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Updates, events & announcements</p>
              </div>
            </div>
          </a>
        </div>

        <div className={`lg:col-span-3 p-6 md:p-8 ${cardCls}`}>
          <form onSubmit={onSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label htmlFor="c-name">Full name</Label>
                <Input id="c-name" required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="Your name" />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="c-email">Email address</Label>
                <Input id="c-email" type="email" required value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} placeholder="you@example.com" />
              </div>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="c-msg">Message</Label>
              <Textarea id="c-msg" required rows={6} value={form.message} onChange={(e) => setForm({ ...form, message: e.target.value })} placeholder="How can we help?" className="resize-none" />
            </div>

            <div className="flex items-center justify-between gap-3 pt-2 flex-wrap">
              <p className="text-xs text-gray-500 dark:text-gray-400">
                By sending, you agree to be contacted at the email provided.
              </p>
              <Button type="submit" disabled={sending} className="bg-gradient-to-r from-indigo-500 to-violet-500 hover:opacity-90 text-white px-6">
                <Send size={16} className="mr-2" />
                Send message
              </Button>
            </div>
          </form>
        </div>
      </div>

      <div className={`mt-8 max-w-6xl mx-auto rounded-xl overflow-hidden border border-gray-200 dark:border-white/10`}>
        <iframe
          title="TPI - Computer and Programming Club"
          src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3407.4652567564826!2d88.44268869999999!3d26.03878539999999!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x39e4ebe22c241dc5%3A0x11eacbc887a18571!2sTPI%20-%20Computer%20and%20Programming%20Club!5e1!3m2!1sen!2sbd!4v1758277073336!5m2!1sen!2sbd"
          className="w-full h-[360px]"
          loading="lazy"
          referrerPolicy="no-referrer-when-downgrade"
          allowFullScreen
        />
      </div>
    </section>
  );
}
