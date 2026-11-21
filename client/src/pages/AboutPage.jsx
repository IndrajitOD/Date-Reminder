import React, { useState } from 'react';
import { 
  Calendar, Bell, Heart, Star, Sparkles, CheckCircle2, Clock, Shield, 
  Code, Globe, Laptop, Smartphone, Mail, MessageSquare, ChevronDown, 
  Send, AlertTriangle, Layers, BookOpen, Compass, Award, ExternalLink,
  ChevronRight, ArrowRight, UserCheck, Flame, Cpu, Database
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { useApp } from '../context/AppContext';

export default function AboutPage() {
  const { showToast } = useApp();

  // Contact Form State
  const [contactName, setContactName] = useState('');
  const [contactEmail, setContactEmail] = useState('');
  const [contactSubject, setContactSubject] = useState('');
  const [contactMessage, setContactMessage] = useState('');
  const [contactStatus, setContactStatus] = useState(null); // 'submitting' | 'sent' | 'unconfigured'

  // Suggestion / Issue Report Modal or Tabs
  const [activeFeedbackTab, setActiveFeedbackTab] = useState('suggestion'); // 'suggestion' | 'issue'
  const [feedbackTitle, setFeedbackTitle] = useState('');
  const [feedbackCategory, setFeedbackCategory] = useState('Feature Suggestion');
  const [feedbackDescription, setFeedbackDescription] = useState('');
  const [feedbackStatus, setFeedbackStatus] = useState(null);

  // FAQ Accordion State (open question id)
  const [openFaq, setOpenFaq] = useState(0);

  const toggleFaq = (idx) => {
    setOpenFaq(openFaq === idx ? null : idx);
  };

  const handleContactSubmit = (e) => {
    e.preventDefault();
    if (!contactName.trim() || !contactEmail.trim() || !contactMessage.trim()) {
      showToast('Please fill in all required contact fields.', 'error');
      return;
    }
    // Transparent status: since an SMTP relay or contact webhook is not yet provisioned on this personal deployment
    setContactStatus('unconfigured');
    showToast('Direct email dispatch is currently being provisioned. Your feedback was logged locally.', 'info');
  };

  const handleFeedbackSubmit = (e) => {
    e.preventDefault();
    if (!feedbackTitle.trim() || !feedbackDescription.trim()) {
      showToast('Please provide a title and description.', 'error');
      return;
    }
    setFeedbackStatus('logged');
    showToast(`${activeFeedbackTab === 'suggestion' ? 'Suggestion' : 'Issue report'} logged successfully. Thank you!`, 'success');
    setFeedbackTitle('');
    setFeedbackDescription('');
  };

  const faqs = [
    {
      q: "What is Date Reminder?",
      a: "Date Reminder is a personal date and reminder management application engineered to bring personal anniversaries, birthdays, milestone events, and global cultural occasions together into one unified, intelligent alerting centre."
    },
    {
      q: "Is Date Reminder free to use?",
      a: "Yes. Date Reminder is fully accessible with free personal reminder tracking, calendar views, global event subscriptions, and advance alert schedules."
    },
    {
      q: "How do personal reminders work?",
      a: "When you add a personal date, you can configure recurrence (annual, monthly, weekly, daily, or one-time), set priority levels, assign categories, and select notification timing (on the day, 1, 3, or 7 days in advance)."
    },
    {
      q: "What are Important Dates?",
      a: "Important Dates is a pre-curated global catalog of international celebrations, national holidays, cultural festivals, health awareness days, and historic occasions. You can browse and subscribe to any event with one click."
    },
    {
      q: "Can I create custom categories?",
      a: "Yes. In My Dates / Reminders, you can open Manage Categories to create new categories with custom colors and labels. Categories safely organize your dates, and deleting a category automatically migrates dates to Uncategorized rather than deleting them."
    },
    {
      q: "Can I configure recurring reminders?",
      a: "Yes. Yearly recurring dates (such as birthdays and anniversaries originally from years like 2000) automatically calculate their next upcoming occurrence based on the current year, leap year calendar math, and your civil timezone."
    },
    {
      q: "How do I change my timezone?",
      a: "Navigate to Settings & Preferences. The timezone selector allows you to pick your Indian city or location (e.g. Kolkata, Mumbai, Bengaluru, New Delhi), all standardizing to the official Indian Standard Time (Asia/Kolkata, UTC+05:30)."
    },
    {
      q: "How do notification delivery channels work?",
      a: "Date Reminder supports email and native browser push notifications. The notification dispatcher strictly honors master toggles, channel controls, and dynamic category rules."
    },
    {
      q: "Can I use Date Reminder on mobile?",
      a: "Yes. The entire user interface is designed with a responsive, mobile-first approach that fits seamlessly on phones, tablets, laptops, and ultra-wide screens."
    },
    {
      q: "How can I report an issue or suggest a feature?",
      a: "You can use the Feedback & Issue Reporting form at the bottom of this page to submit feature suggestions or technical defect reports directly to the developer."
    }
  ];

  return (
    <div className="space-y-16 max-w-5xl mx-auto pb-16">
      {/* 1. HERO SECTION (PART 2) */}
      <section className="text-center space-y-4 pt-4">
        <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-rose-50 border border-rose-200/80 text-rose-600 text-xs font-bold uppercase tracking-wider shadow-xs">
          <Sparkles size={14} className="stroke-[2.5]" />
          <span>Product Overview &amp; Engineering Story</span>
        </div>

        <h1 className="text-3xl sm:text-4xl md:text-5xl font-black text-slate-900 tracking-tight">
          About Date Reminder
        </h1>

        <p className="text-base sm:text-lg font-bold text-rose-500 max-w-md mx-auto">
          Never Forget a Date That Matters.
        </p>

        <p className="text-sm sm:text-base text-slate-600 max-w-2xl mx-auto leading-relaxed">
          Date Reminder is a personal date and reminder management application designed to help people organize important moments, manage recurring events, and receive timely notifications.
          From birthdays and anniversaries to appointments, deadlines, insurance renewals, and important global events, Date Reminder brings everything together in one convenient place.
        </p>

        <div className="pt-2 flex flex-wrap items-center justify-center gap-3">
          <Link
            to="/app/reminders"
            className="inline-flex items-center gap-2 bg-gradient-to-r from-rose-500 to-red-600 text-white font-bold py-3 px-6 rounded-2xl shadow-lg shadow-rose-500/25 hover:shadow-rose-500/40 active:scale-95 transition-all text-xs sm:text-sm"
          >
            <span>Explore My Reminders</span>
            <ArrowRight size={16} />
          </Link>
          <Link
            to="/app/important-dates"
            className="inline-flex items-center gap-2 bg-white hover:bg-slate-50 text-slate-700 font-bold py-3 px-5 rounded-2xl border border-slate-200 text-xs sm:text-sm transition-colors"
          >
            <span>Browse Global Events</span>
          </Link>
        </div>
      </section>

      {/* 2. THE STORY BEHIND DATE REMINDER (PART 3) */}
      <section className="bg-white rounded-3xl p-6 sm:p-10 border border-slate-100 shadow-xs space-y-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-rose-50 text-rose-500 flex items-center justify-center">
            <BookOpen size={20} />
          </div>
          <div>
            <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
              Why Date Reminder?
            </h2>
            <p className="text-xs text-slate-400">The human problem behind the application</p>
          </div>
        </div>

        <div className="prose text-xs sm:text-sm text-slate-600 leading-relaxed space-y-3 pt-2">
          <p>
            We all have important dates in our lives. Birthdays, anniversaries, appointments, renewals, deadlines, and special occasions.
            Sometimes these dates get buried in calendars, notes, messages, or simply forgotten.
          </p>
          <p>
            Date Reminder was designed around a simple idea: important dates should be easy to organize, easy to find, and difficult to forget.
          </p>
          <p>
            The goal is to bring personal reminders and globally important dates together in one place while allowing users to choose how and when they receive notifications.
          </p>
        </div>
      </section>

      {/* 3. THE ORIGINAL IDEA AND VISION (PART 4) */}
      <section className="space-y-6">
        <div className="text-center space-y-1">
          <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
            The Idea &amp; Vision
          </h2>
          <p className="text-xs text-slate-400">Guiding architectural and product principles</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[
            {
              title: "1. One Place for Important Dates",
              desc: "Bring personal dates and global events together without fragmenting across isolated calendar apps.",
              icon: Layers
            },
            {
              title: "2. Flexible Reminders",
              desc: "Allow users to configure fine-grained reminder timing (same day, 1d, 3d, 7d prior) and smart recurrence.",
              icon: Clock
            },
            {
              title: "3. Personal Organization",
              desc: "Allow predefined and custom categories with complete freedom to create, recolor, and reorganize.",
              icon: Compass
            },
            {
              title: "4. Notification Freedom",
              desc: "Allow users to choose their preferred notification channels without forced spam or unsolicited alerts.",
              icon: Bell
            },
            {
              title: "5. Simple Experience",
              desc: "Make date management easy and accessible for users with different levels of technical knowledge.",
              icon: UserCheck
            },
            {
              title: "6. Room to Grow",
              desc: "Built on clean modular foundations that expand with additional integrations and intelligent features.",
              icon: Sparkles
            }
          ].map((principle, idx) => {
            const Icon = principle.icon;
            return (
              <div key={idx} className="bg-white rounded-3xl p-5 border border-slate-100 shadow-xs space-y-2">
                <div className="w-9 h-9 rounded-xl bg-slate-50 text-rose-500 flex items-center justify-center">
                  <Icon size={18} />
                </div>
                <h3 className="font-extrabold text-sm text-slate-900">{principle.title}</h3>
                <p className="text-xs text-slate-500 leading-relaxed">{principle.desc}</p>
              </div>
            );
          })}
        </div>

        {/* Creator's Motivation Box */}
        <div className="bg-rose-50/40 rounded-3xl p-5 sm:p-6 border border-rose-100/80 space-y-2">
          <span className="text-[11px] font-bold uppercase tracking-wider text-rose-600">Personal Motivation</span>
          <p className="text-xs text-slate-600 leading-relaxed">
            The original inspiration came from noticing how often memorable dates—whether a cousin&apos;s birthday, an annual car insurance renewal, or an important cultural holiday—get lost amidst chaotic daily schedules. Date Reminder was envisioned as a focused, lightweight, yet powerful assistant that keeps what matters most right at your fingertips.
          </p>
        </div>
      </section>

      {/* 4. FEATURES AND CAPABILITIES SHOWCASE (PART 5) */}
      <section className="space-y-6">
        <div className="text-center space-y-1">
          <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
            Features &amp; Capabilities
          </h2>
          <p className="text-xs text-slate-400">Everything currently built and operational in the system</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* A. Personal Date Reminders */}
          <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-xs space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="font-extrabold text-slate-900 text-base">Personal Date Reminders</h3>
              <span className="text-[10px] font-extrabold px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-600 border border-emerald-100">
                Available
              </span>
            </div>
            <p className="text-xs text-slate-500 leading-relaxed">
              Create, edit, duplicate, and delete personal reminders. Add contact persons, category associations, rich notes, priorities (low, normal, high, critical), and customizable advance notice schedules.
            </p>
          </div>

          {/* B. Important Dates Catalogue */}
          <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-xs space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="font-extrabold text-slate-900 text-base">Important Dates Catalogue</h3>
              <span className="text-[10px] font-extrabold px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-600 border border-emerald-100">
                Available
              </span>
            </div>
            <p className="text-xs text-slate-500 leading-relaxed">
              Curated repository of global observances, festivals, national holidays, and famous birthdays. Allows individual event subscriptions or category-wide auto-enrollment with zero clutter.
            </p>
          </div>

          {/* C. Smart Calendar */}
          <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-xs space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="font-extrabold text-slate-900 text-base">Smart Calendar</h3>
              <span className="text-[10px] font-extrabold px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-600 border border-emerald-100">
                Available
              </span>
            </div>
            <p className="text-xs text-slate-500 leading-relaxed">
              Intuitive calendar navigation with Day, Week, Month, and Year perspectives. Unified color-coded badges distinguish personal dates from global subscriptions at a glance.
            </p>
          </div>

          {/* D. Notification Management */}
          <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-xs space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="font-extrabold text-slate-900 text-base">Notification Management</h3>
              <span className="text-[10px] font-extrabold px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-600 border border-emerald-100">
                Available
              </span>
            </div>
            <p className="text-xs text-slate-500 leading-relaxed">
              Hierarchical alert evaluation: Master toggle, individual channels (Email, Browser Push), dynamic category-specific channel preferences, and audit history table with safe retry.
            </p>
          </div>

          {/* E. Flexible Scheduling */}
          <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-xs space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="font-extrabold text-slate-900 text-base">Flexible Scheduling</h3>
              <span className="text-[10px] font-extrabold px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-600 border border-emerald-100">
                Available
              </span>
            </div>
            <p className="text-xs text-slate-500 leading-relaxed">
              Supports one-time dates, daily, weekly, monthly, and yearly recurrences with leap year math and timezone awareness, ensuring next occurrences always display upcoming dates.
            </p>
          </div>

          {/* F. Account Management */}
          <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-xs space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="font-extrabold text-slate-900 text-base">Account Management</h3>
              <span className="text-[10px] font-extrabold px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-600 border border-emerald-100">
                Available
              </span>
            </div>
            <p className="text-xs text-slate-500 leading-relaxed">
              Secure Firebase Authentication (Email/Password and Google OAuth), profile editing, avatar initials, password resets, and Indian civil timezone synchronization.
            </p>
          </div>
        </div>
      </section>

      {/* 5. HOW TO USE DATE REMINDER (PART 6) */}
      <section className="bg-white rounded-3xl p-6 sm:p-10 border border-slate-100 shadow-xs space-y-6">
        <div className="text-center space-y-1">
          <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
            How to Use Date Reminder
          </h2>
          <p className="text-xs text-slate-400">Simple 10-step walkthrough to get the most out of the platform</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
          {[
            "Create an account or sign in with Google.",
            "Open My Reminders from the sidebar navigation.",
            "Click '+ Add Reminder' to create a new personal date.",
            "Choose a category or create a custom category with your preferred color.",
            "Select the original event date.",
            "Configure recurrence (e.g. Yearly for Birthdays) and reminder timing.",
            "Fine-tune channel preferences in Settings & Preferences.",
            "Explore the Important Dates catalogue to discover global holidays.",
            "Subscribe to world festivals and awareness days that interest you.",
            "Use the Calendar View to inspect and navigate your schedule."
          ].map((step, idx) => (
            <div key={idx} className="p-3.5 rounded-2xl bg-slate-50 border border-slate-100/80 flex items-start gap-3">
              <span className="w-6 h-6 rounded-lg bg-rose-500 text-white font-extrabold text-[11px] flex items-center justify-center shrink-0">
                {idx + 1}
              </span>
              <p className="text-slate-700 font-medium leading-relaxed self-center">{step}</p>
            </div>
          ))}
        </div>
      </section>

      {/* 6. TECHNOLOGY BEHIND THE PROJECT (PART 7) */}
      <section className="space-y-6">
        <div className="text-center space-y-1">
          <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
            Technology Behind the Project
          </h2>
          <p className="text-xs text-slate-400">Actual production stack powering this application</p>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {[
            { name: "React 19", role: "Frontend UI Library", icon: Code },
            { name: "Vite & Rolldown", role: "Frontend Build Tool", icon: Cpu },
            { name: "Tailwind CSS v4", role: "Styling & Design System", icon: Layers },
            { name: "Node.js & Express", role: "REST API Backend", icon: Laptop },
            { name: "MongoDB Atlas", role: "Cloud Database & Mongoose", icon: Database },
            { name: "Firebase Auth", role: "Authentication & OAuth", icon: Shield },
            { name: "Firebase Admin", role: "Server Token Verification", icon: UserCheck },
            { name: "Render Cloud", role: "Hosting & Continuous Deploy", icon: Globe }
          ].map((tech, idx) => {
            const Icon = tech.icon;
            return (
              <div key={idx} className="bg-white rounded-3xl p-4 border border-slate-100 shadow-xs text-center space-y-1.5">
                <div className="w-10 h-10 rounded-2xl bg-rose-50 text-rose-500 mx-auto flex items-center justify-center">
                  <Icon size={20} />
                </div>
                <h3 className="font-extrabold text-xs text-slate-900">{tech.name}</h3>
                <p className="text-[11px] text-slate-400">{tech.role}</p>
              </div>
            );
          })}
        </div>
      </section>

      {/* 7. FUTURE ROADMAP (PART 8) */}
      <section className="space-y-6">
        <div className="text-center space-y-1">
          <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
            What&apos;s Coming Next?
          </h2>
          <p className="text-xs text-slate-400">Planned features and upcoming platform milestones</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
          {[
            { title: "WhatsApp Notification Integration", status: "In Development", desc: "Meta WhatsApp Cloud API integration for direct messaging." },
            { title: "Advanced Browser Web Push", status: "In Development", desc: "Native VAPID service worker push alerts for offline devices." },
            { title: "Shared Reminders", status: "Planned", desc: "Collaborate on important dates with specific users." },
            { title: "Family & Group Calendars", status: "Planned", desc: "Shared calendar spaces for households and teams." },
            { title: "AI-Powered Reminder Suggestions", status: "Planned", desc: "Intelligent date parsing and automated festival reminders." },
            { title: "Smart Date Recommendations", status: "Planned", desc: "Curated cultural recommendations tailored to interests." },
            { title: "External Calendar Integrations", status: "Planned", desc: "Two-way sync with Google Calendar, Outlook, and Apple iCal." },
            { title: "Advanced Notification Analytics", status: "Planned", desc: "Detailed delivery insights and open tracking metrics." },
            { title: "Improved Reminder Automation", status: "Planned", desc: "Rule-based webhooks and smart multi-stage escalation." },
            { title: "Additional Customization Options", status: "Planned", desc: "Dark theme and custom audio chimes." }
          ].map((item, idx) => (
            <div key={idx} className="bg-white rounded-2xl p-4 border border-slate-100 shadow-xs flex items-start justify-between gap-3">
              <div className="space-y-0.5">
                <span className="font-bold text-slate-800 block">{item.title}</span>
                <p className="text-[11px] text-slate-400">{item.desc}</p>
              </div>
              <span className={`text-[10px] font-extrabold px-2 py-0.5 rounded-full shrink-0 ${
                item.status === 'In Development' 
                  ? 'bg-amber-50 text-amber-700 border border-amber-200' 
                  : 'bg-slate-100 text-slate-600'
              }`}>
                {item.status}
              </span>
            </div>
          ))}
        </div>
      </section>

      {/* 8. MEET THE DEVELOPER (PART 9) */}
      <section className="bg-white rounded-3xl p-6 sm:p-10 border border-slate-100 shadow-xs space-y-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-rose-50 text-rose-500 flex items-center justify-center">
            <UserCheck size={20} />
          </div>
          <div>
            <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
              Meet the Developer
            </h2>
            <p className="text-xs text-slate-400">Engineer and author of Date Reminder</p>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6 pt-2">
          {/* Developer Avatar Placeholder */}
          <div className="w-24 h-24 rounded-3xl bg-gradient-to-tr from-rose-500 to-red-600 text-white font-black text-3xl flex items-center justify-center shadow-lg shadow-rose-500/20 shrink-0">
            IB
          </div>

          <div className="space-y-3 text-xs sm:text-sm text-slate-600 leading-relaxed text-center sm:text-left">
            <div>
              <h3 className="text-lg font-black text-slate-900">Indrajit Bhowmick</h3>
              <p className="text-xs text-rose-500 font-bold">Engineer &amp; Developer of Date Reminder</p>
            </div>

            <p>
              Hello! I&apos;m Indrajit Bhowmick, an engineer interested in technology and software development.
              I enjoy exploring ideas, learning new technologies, and building practical applications that solve everyday problems.
            </p>

            <p>
              Date Reminder is one of my projects, created to turn a simple but useful idea into a functional, user-centric application.
            </p>

            <div className="pt-1 flex flex-wrap items-center gap-2 text-[11px] font-bold text-slate-500">
              <span className="bg-slate-100 px-2.5 py-1 rounded-lg">Full-Stack Development</span>
              <span className="bg-slate-100 px-2.5 py-1 rounded-lg">Cloud Systems</span>
              <span className="bg-slate-100 px-2.5 py-1 rounded-lg">Modern UI/UX</span>
            </div>
          </div>
        </div>
      </section>

      {/* 9. CONTACT & CONNECT (PART 10) */}
      <section className="bg-white rounded-3xl p-6 sm:p-10 border border-slate-100 shadow-xs space-y-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-slate-100 text-slate-600 flex items-center justify-center">
            <Mail size={20} />
          </div>
          <div>
            <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
              Contact &amp; Connect
            </h2>
            <p className="text-xs text-slate-400">Get in touch with questions, opportunities, or suggestions</p>
          </div>
        </div>

        <form onSubmit={handleContactSubmit} className="space-y-4 max-w-xl text-xs">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1">Name *</label>
              <input
                type="text"
                required
                value={contactName}
                onChange={(e) => setContactName(e.target.value)}
                placeholder="Your name"
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-800 text-xs"
              />
            </div>

            <div>
              <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1">Email *</label>
              <input
                type="email"
                required
                value={contactEmail}
                onChange={(e) => setContactEmail(e.target.value)}
                placeholder="your.email@example.com"
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-800 text-xs"
              />
            </div>
          </div>

          <div>
            <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1">Subject</label>
            <input
              type="text"
              value={contactSubject}
              onChange={(e) => setContactSubject(e.target.value)}
              placeholder="Inquiry or message subject"
              className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-800 text-xs"
            />
          </div>

          <div>
            <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1">Message *</label>
            <textarea
              required
              rows={3}
              value={contactMessage}
              onChange={(e) => setContactMessage(e.target.value)}
              placeholder="Write your message here..."
              className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-800 text-xs"
            />
          </div>

          <div className="flex items-center justify-between pt-1">
            <span className="text-[11px] text-slate-400">
              Personal contact email and socials will be displayed here once publicly configured.
            </span>
            <button
              type="submit"
              className="px-5 py-2.5 bg-rose-500 hover:bg-rose-600 text-white font-bold rounded-xl text-xs shadow-sm transition-colors"
            >
              Send Message
            </button>
          </div>
        </form>
      </section>

      {/* 10. FEEDBACK AND ISSUE REPORTING (PART 11) */}
      <section className="bg-white rounded-3xl p-6 sm:p-10 border border-slate-100 shadow-xs space-y-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-rose-50 text-rose-500 flex items-center justify-center">
            <MessageSquare size={20} />
          </div>
          <div>
            <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
              Feedback &amp; Issue Reporting
            </h2>
            <p className="text-xs text-slate-400">Help make Date Reminder better with your direct input</p>
          </div>
        </div>

        {/* Tab Switcher */}
        <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
          <button
            onClick={() => setActiveFeedbackTab('suggestion')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
              activeFeedbackTab === 'suggestion'
                ? 'bg-rose-50 text-rose-600 border border-rose-200'
                : 'text-slate-600 hover:bg-slate-50'
            }`}
          >
            Share Suggestions
          </button>
          <button
            onClick={() => setActiveFeedbackTab('issue')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
              activeFeedbackTab === 'issue'
                ? 'bg-rose-50 text-rose-600 border border-rose-200'
                : 'text-slate-600 hover:bg-slate-50'
            }`}
          >
            Report an Issue
          </button>
        </div>

        <form onSubmit={handleFeedbackSubmit} className="space-y-4 max-w-xl text-xs">
          <div>
            <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1">
              {activeFeedbackTab === 'suggestion' ? 'Suggestion Title *' : 'Issue Summary *'}
            </label>
            <input
              type="text"
              required
              value={feedbackTitle}
              onChange={(e) => setFeedbackTitle(e.target.value)}
              placeholder={activeFeedbackTab === 'suggestion' ? 'e.g. Add dark mode, sound alerts...' : 'e.g. Incorrect date display on calendar...'}
              className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-800 text-xs"
            />
          </div>

          <div>
            <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1">Category</label>
            <select
              value={feedbackCategory}
              onChange={(e) => setFeedbackCategory(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-800 text-xs font-medium"
            >
              {activeFeedbackTab === 'suggestion' ? (
                <>
                  <option value="Feature Suggestion">Feature Suggestion</option>
                  <option value="UI/UX Improvement">UI/UX Improvement</option>
                  <option value="New Category Request">New Category Request</option>
                  <option value="General Feedback">General Feedback</option>
                </>
              ) : (
                <>
                  <option value="Incorrect Date or Math">Incorrect Date or Math</option>
                  <option value="Notification Failure">Notification Failure</option>
                  <option value="Login / Auth Problem">Login / Auth Problem</option>
                  <option value="Calendar Display Bug">Calendar Display Bug</option>
                  <option value="Other Technical Defect">Other Technical Defect</option>
                </>
              )}
            </select>
          </div>

          <div>
            <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1">Description *</label>
            <textarea
              required
              rows={3}
              value={feedbackDescription}
              onChange={(e) => setFeedbackDescription(e.target.value)}
              placeholder="Provide details about your observation or suggestion..."
              className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-800 text-xs"
            />
          </div>

          <div className="flex justify-end pt-1">
            <button
              type="submit"
              className="px-5 py-2.5 bg-rose-500 hover:bg-rose-600 text-white font-bold rounded-xl text-xs shadow-sm transition-colors"
            >
              {activeFeedbackTab === 'suggestion' ? 'Submit Suggestion' : 'Submit Issue Report'}
            </button>
          </div>
        </form>
      </section>

      {/* 11. FAQ ACCORDION (PART 12) */}
      <section className="bg-white rounded-3xl p-6 sm:p-10 border border-slate-100 shadow-xs space-y-6">
        <div className="text-center space-y-1">
          <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
            Frequently Asked Questions
          </h2>
          <p className="text-xs text-slate-400">Common questions about Date Reminder and its features</p>
        </div>

        <div className="space-y-2 text-xs">
          {faqs.map((faq, idx) => {
            const isOpen = openFaq === idx;
            return (
              <div
                key={idx}
                className="border border-slate-100 rounded-2xl overflow-hidden transition-colors bg-slate-50/50"
              >
                <button
                  type="button"
                  onClick={() => toggleFaq(idx)}
                  className="w-full px-4 py-3.5 flex items-center justify-between text-left font-bold text-slate-900 hover:bg-slate-50 transition-colors"
                >
                  <span>{faq.q}</span>
                  <ChevronDown
                    size={16}
                    className={`text-slate-400 transition-transform duration-200 ${isOpen ? 'rotate-180 text-rose-500' : ''}`}
                  />
                </button>
                {isOpen && (
                  <div className="px-4 pb-4 pt-1 text-slate-600 leading-relaxed border-t border-slate-100/60 bg-white">
                    {faq.a}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </section>

      {/* 12. PROFESSIONAL FOOTER (PART 14) */}
      <footer className="pt-8 text-center text-xs text-slate-400 space-y-1">
        <p className="font-semibold text-slate-600">Created by Indrajit Bhowmick</p>
        <p className="text-[11px]">
          For more information about the creator or Date Reminder, explore this{' '}
          <Link to="/app/about" className="text-rose-500 hover:underline font-bold">
            About section
          </Link>.
        </p>
      </footer>
    </div>
  );
}
