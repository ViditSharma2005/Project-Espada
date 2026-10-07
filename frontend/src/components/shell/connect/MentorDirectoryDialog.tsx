"use client";

import React, { useEffect, useState, useMemo, useSyncExternalStore } from "react";
import { createPortal } from "react-dom";
import {
  X,
  Search,
  Star,
  ShieldCheck,
  Calendar,
  CalendarPlus,
} from "lucide-react";
import type { Mentor } from "./AssignedMentorCard";



export interface DatabaseMentor {
  id: string;
  name: string;
  role: string;
  company: string;
  avatar: string;
  bio: string;
  rating: number;
  totalSessions: number;
  availableSlots: string[];
  tags: string[];
  verified?: boolean;
}

interface MentorDirectoryDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  mentors: DatabaseMentor[];
  onSelectMentorToBook: (mentor: Mentor) => void;
}


const CATEGORIES: { label: string; keywords: string[] }[] = [
  { label: "All", keywords: [] },
  {
    label: "Mind & Well-being",
    keywords: ["mental", "emotional", "stress", "well-being", "psychology", "counselling", "mindset", "inner", "self-awareness"],
  },
  {
    label: "Meditation & Yoga",
    keywords: ["meditation", "yoga", "yogic", "pranayama", "mind-strengthening"],
  },
  {
    label: "Values & Spirituality",
    keywords: ["spiritual", "values", "vedic", "indian philosophy", "wisdom", "service", "purpose"],
  },
  {
    label: "Teaching & Education",
    keywords: ["teach", "educat", "student", "school", "learn", "classroom"],
  },
  {
    label: "Careers & Leadership",
    keywords: ["career", "leader", "management", "strategy", "coaching", "consulting"],
  },
  {
    label: "Technology & AI",
    keywords: ["ai", "technology", "edtech", "cloud", "data science", "product"],
  },
];

const matchesCategory = (tags: string[], category: string) => {
  if (category === "All") return true;
  const cat = CATEGORIES.find((c) => c.label === category);
  if (!cat) return true;
  return tags.some((tag) =>
    cat.keywords.some((kw) => new RegExp("\\b" + kw, "i").test(tag))
  );
};

export function MentorDirectoryDialog({
  open,
  onOpenChange,
  mentors,
  onSelectMentorToBook,
}: MentorDirectoryDialogProps) {
  const mounted = useSyncExternalStore(
    () => () => {},
    () => true,
    () => false
  );
  const [visible, setVisible] = useState(open);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedTag, setSelectedTag] = useState("All");

  useEffect(() => {
    if (open) {
      setVisible(true);
      document.body.style.overflow = "hidden";
      return () => {
        document.body.style.overflow = "";
      };
    }
    const t = setTimeout(() => setVisible(false), 250);
    return () => clearTimeout(t);
  }, [open]);

  useEffect(() => {
    const onEsc = (e: KeyboardEvent) => e.key === "Escape" && onOpenChange(false);
    if (open) window.addEventListener("keydown", onEsc);
    return () => window.removeEventListener("keydown", onEsc);
  }, [open, onOpenChange]);

  const filteredEducators = useMemo(() => {
    const q = searchQuery.toLowerCase().trim();
    return mentors.filter((m) => {
      const matchesSearch =
        !q ||
        m.name.toLowerCase().includes(q) ||
        m.company.toLowerCase().includes(q) ||
        m.role.toLowerCase().includes(q) ||
        m.tags.some((t) => t.toLowerCase().includes(q));

      return matchesSearch && matchesCategory(m.tags, selectedTag);
    });
  }, [mentors, searchQuery, selectedTag]);

  if (!mounted || (!open && !visible)) return null;

  const handleBook = (m: DatabaseMentor) => {
    onSelectMentorToBook({
      id: m.id,
      name: m.name,
      role: m.role,
      company: m.company,
      avatar: m.avatar,
      bio: m.bio,
      rating: m.rating,
      totalSessions: m.totalSessions,
      tags: m.tags,
      nextSlot: m.availableSlots[0],
    });
    onOpenChange(false);
  };

  const clearFilters = () => {
    setSearchQuery("");
    setSelectedTag("All");
  };

  return createPortal(
    <div className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center">
      <div
        className={`absolute inset-0 bg-black/80 backdrop-blur-[14px] transition-opacity duration-200 ${
          open ? "opacity-100" : "opacity-0"
        }`}
        onClick={() => onOpenChange(false)}
      />

      <div
        role="dialog"
        aria-modal="true"
        aria-label="Find an educator"
        className={`relative flex flex-col w-full bg-[#111114]/95 backdrop-blur-2xl border border-white/[0.1] shadow-2xl transition-all duration-200 ease-out
        h-[100dvh] rounded-none
        sm:h-auto sm:max-h-[88vh] sm:max-w-[780px] sm:w-[94vw] sm:rounded-[24px]
        ${open ? "opacity-100 translate-y-0 sm:scale-100" : "opacity-0 translate-y-6 sm:translate-y-3 sm:scale-[0.96]"}
        `}
      >
        <div className="absolute inset-0 rounded-none sm:rounded-[24px] bg-gradient-to-b from-amber-400/[0.08] to-transparent pointer-events-none h-[25%]" />

        
        <div className="relative shrink-0 p-6 sm:p-7 pb-4 border-b border-white/[0.08]">
          <button
            onClick={() => onOpenChange(false)}
            className="absolute top-4 right-4 sm:top-5 sm:right-5 p-2 rounded-full bg-white/[0.06] hover:bg-white/[0.12] border border-white/[0.08] text-white/60 hover:text-white transition-colors"
            aria-label="Close"
          >
            <X className="size-4" />
          </button>

          <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight pr-10">
            Find an Educator
          </h2>
          <p className="text-xs text-white/50 mt-1 max-w-xl leading-relaxed">
            Choose someone you feel comfortable speaking with. Every educator is
            verified and meets you privately over a video call.
          </p>

          <div className="mt-4 relative">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 size-4 text-white/30 pointer-events-none" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by name or by topic, such as stress, yoga or careers"
              className="w-full bg-white/[0.04] border border-white/10 rounded-full pl-10 pr-4 py-2.5 text-xs sm:text-sm text-white placeholder:text-white/30 focus:border-amber-400/50 focus:outline-none transition-colors"
            />
          </div>

          <div className="mt-3 flex flex-wrap gap-1.5 items-center">
            {CATEGORIES.map(({ label: tag }) => (
              <button
                key={tag}
                onClick={() => setSelectedTag(tag)}
                className={`text-[11px] px-3 py-1 rounded-full border transition-colors ${
                  selectedTag === tag
                    ? "bg-amber-400 text-black font-semibold border-amber-400"
                    : "bg-white/[0.03] text-white/50 border-white/[0.08] hover:text-white hover:bg-white/[0.06]"
                }`}
              >
                {tag}
              </button>
            ))}
          </div>
        </div>

        
        <div className="relative flex-1 overflow-y-auto p-6 sm:p-7 space-y-4 custom-scrollbar">
          {filteredEducators.length === 0 ? (
            <div className="py-12 text-center">
              <p className="text-sm text-white/60">No educators match your search.</p>
              <p className="text-xs text-white/40 mt-1">
                Try a different word, or clear the filters.
              </p>
              <button
                onClick={clearFilters}
                className="mt-4 text-xs text-amber-300 hover:text-amber-200 font-medium transition-colors"
              >
                Clear filters
              </button>
            </div>
          ) : (
            filteredEducators.map((m) => (
              <div
                key={m.id}
                className="rounded-2xl border border-white/[0.08] bg-white/[0.02] hover:bg-white/[0.05] p-4 sm:p-5 transition-colors flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
              >
                <div className="flex items-start gap-4 flex-1 min-w-0">
                  <div className="relative shrink-0">
                    
                    <img
                      src={m.avatar}
                      alt={m.name}
                      className="size-14 rounded-full object-cover border border-amber-400/30"
                    />
                    {m.verified && (
                      <div
                        className="absolute -bottom-1 -right-1 bg-amber-400 text-black p-0.5 rounded-full"
                        title="Verified educator"
                      >
                        <ShieldCheck className="size-3 stroke-[2.5]" />
                      </div>
                    )}
                  </div>

                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <h4 className="text-sm sm:text-base font-semibold text-white">
                        {m.name}
                      </h4>
                      {m.totalSessions > 0 && (
                        <span className="inline-flex items-center gap-1 text-[11px] text-amber-400 font-medium">
                          <Star className="size-3 fill-amber-400" />
                          {m.rating.toFixed(2)}
                        </span>
                      )}
                    </div>

                    <p className="text-xs text-white/60 mt-0.5">{m.role}</p>
                    <p className="text-[11px] text-white/35">{m.company}</p>
                    <p className="text-xs text-white/45 mt-1.5 line-clamp-2 leading-relaxed">
                      {m.bio}
                    </p>

                    <div className="flex flex-wrap gap-1.5 mt-2.5">
                      {m.tags.map((tag) => (
                        <span
                          key={tag}
                          className="text-[10px] px-2 py-0.5 rounded-full bg-white/[0.04] border border-white/[0.06] text-white/60"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>

                    {m.availableSlots && m.availableSlots.length > 0 && (
                      <p className="text-[11px] text-emerald-400/80 mt-2 flex items-start gap-1">
                        <Calendar className="size-3 mt-0.5 shrink-0" />
                        <span>Available: {m.availableSlots.join(", ")}</span>
                      </p>
                    )}
                  </div>
                </div>

                <div className="shrink-0 w-full sm:w-auto pt-2 sm:pt-0 border-t sm:border-t-0 border-white/[0.06]">
                  <button
                    onClick={() => handleBook(m)}
                    className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-4 py-2 rounded-xl bg-amber-400 text-black hover:bg-amber-300 text-xs font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-200"
                  >
                    <CalendarPlus className="size-3.5" />
                    <span>Book Session</span>
                  </button>
                </div>
              </div>
            ))
          )}
        </div>

        <div className="shrink-0 p-4 border-t border-white/[0.08] flex items-center justify-between text-xs text-white/40">
          <span>
            {filteredEducators.length}{" "}
            {filteredEducators.length === 1 ? "educator" : "educators"} available
          </span>
          <button
            onClick={() => onOpenChange(false)}
            className="text-white/60 hover:text-white transition-colors"
          >
            Close
          </button>
        </div>
      </div>

      <style>{`
        .custom-scrollbar::-webkit-scrollbar { width: 4px; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.15); border-radius: 10px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
      `}</style>
    </div>,
    document.body
  );
}