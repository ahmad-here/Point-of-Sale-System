'use client';

import { useState } from 'react';

const inputCls =
  'w-full rounded-lg border border-[#ccc5b9] bg-white px-4 py-2.5 text-[#252422] placeholder-[#403d39]/40 focus:border-[#eb5e28] focus:outline-none focus:ring-1 focus:ring-[#eb5e28]';

/**
 * Opens the visitor's email app with the message pre-filled. There is no
 * backend, so nothing is sent until the visitor presses Send in their mail app.
 */
export default function ContactForm({ email }: { email: string }) {
  const [form, setForm] = useState({ name: '', from: '', topic: 'General question', message: '' });
  const [opened, setOpened] = useState(false);

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    const subject = `[TOSPOS] ${form.topic}${form.name ? ` — ${form.name}` : ''}`;
    const body = `${form.message}\n\n—\nName: ${form.name}\nReply to: ${form.from}`;
    window.location.href = `mailto:${email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
    setOpened(true);
  };

  return (
    <form onSubmit={submit} className="space-y-4 rounded-2xl border border-[#ccc5b9]/50 bg-white/70 p-6">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <label className="block">
          <span className="mb-1 block text-sm font-medium text-[#252422]">Your name</span>
          <input required className={inputCls} value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} autoComplete="name" />
        </label>
        <label className="block">
          <span className="mb-1 block text-sm font-medium text-[#252422]">Your email</span>
          <input required type="email" className={inputCls} value={form.from} onChange={e => setForm({ ...form, from: e.target.value })} autoComplete="email" />
        </label>
      </div>
      <label className="block">
        <span className="mb-1 block text-sm font-medium text-[#252422]">Topic</span>
        <select className={inputCls} value={form.topic} onChange={e => setForm({ ...form, topic: e.target.value })}>
          <option>General question</option>
          <option>Bug report</option>
          <option>Feature request</option>
          <option>Privacy request</option>
          <option>Advertising / partnership</option>
        </select>
      </label>
      <label className="block">
        <span className="mb-1 block text-sm font-medium text-[#252422]">Message</span>
        <textarea required rows={6} className={`${inputCls} resize-y`} value={form.message} onChange={e => setForm({ ...form, message: e.target.value })} />
      </label>
      <button type="submit" className="w-full rounded-lg bg-gradient-to-r from-[#eb5e28] to-[#d94a1f] px-6 py-3 font-semibold text-white shadow-lg transition hover:shadow-xl">
        Write email
      </button>
      <p className="text-xs text-[#403d39]/80" aria-live="polite">
        {opened
          ? `Your email app should now be open with the message ready — press Send there. If nothing opened, email us directly at ${email}.`
          : 'This opens your email app with your message filled in.'}
      </p>
    </form>
  );
}
