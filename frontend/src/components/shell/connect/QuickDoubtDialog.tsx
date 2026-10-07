"use client";

import React, { useEffect, useState, useSyncExternalStore } from "react";
import { createPortal } from "react-dom";
import { X, Send, MessageCircleQuestion, Check } from "lucide-react";
import type { Mentor } from "./AssignedMentorCard";

interface QuickDoubtDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  mentor: Mentor | null;
  
  
  onSubmitDoubt: (doubt: {
    mentorName: string;
    question: string;
    codeLink?: string;
  }) => void;
}

export function QuickDoubtDialog({
  open,
  onOpenChange,
  mentor,
  onSubmitDoubt,
}: QuickDoubtDialogProps) {
  const mounted = useSyncExternalStore(
    () => () => {},
    () => true,
    () => false
  );
  const [visible, setVisible] = useState(open);
  const [question, setQuestion] = useState("");
  const [sent, setSent] = useState(false);

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

  if (!mounted || (!open && !visible) || !mentor) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!question.trim()) return;

    onSubmitDoubt({
      mentorName: mentor.name,
      question: question.trim(),
      codeLink: undefined,
    });

    setSent(true);
    setTimeout(() => {
      setSent(false);
      setQuestion("");
      onOpenChange(false);
    }, 1800);
  };

  return createPortal(
    <div className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center">
      <div
        className={`absolute inset-0 bg-black/75 backdrop-blur-[14px] transition-opacity duration-200 ${
          open ? "opacity-100" : "opacity-0"
        }`}
        onClick={() => onOpenChange(false)}
      />

      <div
        role="dialog"
        aria-modal="true"
        aria-label={`Ask ${mentor.name} a question`}
        className={`relative flex flex-col w-full bg-[#111114]/95 backdrop-blur-2xl border border-white/[0.1] shadow-2xl transition-all duration-200 ease-out
        h-auto max-h-[85vh] sm:max-w-[540px] sm:w-[90vw] rounded-t-[24px] sm:rounded-[24px]
        ${open ? "opacity-100 translate-y-0 sm:scale-100" : "opacity-0 translate-y-6 sm:translate-y-3 sm:scale-[0.96]"}
        `}
      >
        <div className="absolute inset-x-0 top-0 h-24 rounded-t-[24px] bg-gradient-to-b from-amber-400/[0.08] to-transparent pointer-events-none" />

        
        <div className="relative shrink-0 p-6 pb-4 border-b border-white/[0.08]">
          <button
            onClick={() => onOpenChange(false)}
            className="absolute top-5 right-5 p-2 rounded-full bg-white/[0.06] hover:bg-white/[0.12] border border-white/[0.08] text-white/60 hover:text-white transition-colors"
            aria-label="Close"
          >
            <X className="size-4" />
          </button>

          <span className="inline-flex items-center gap-1.5 text-[11px] font-medium px-2.5 py-0.5 rounded-full bg-amber-400/10 text-amber-300 border border-amber-400/25 mb-2">
            <MessageCircleQuestion className="size-3" />
            Written question
          </span>

          <h2 className="text-xl font-bold text-white tracking-tight pr-10">
            Ask {mentor.name} a Question
          </h2>
          <p className="text-xs text-white/50 mt-0.5">
            Usually replies within {mentor.avgResponseTime || "2 hours"}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="relative p-6 space-y-4">
          {sent ? (
            <div className="py-8 text-center flex flex-col items-center justify-center">
              <div className="size-12 rounded-full bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center text-emerald-400 mb-3">
                <Check className="size-6" />
              </div>
              <h3 className="text-base font-semibold text-white">
                Your question was sent to {mentor.name}
              </h3>
              <p className="text-xs text-white/50 mt-1">
                You will be notified when they reply.
              </p>
            </div>
          ) : (
            <>
              <div>
                <label
                  htmlFor="educator-question"
                  className="block text-sm font-semibold text-white mb-2"
                >
                  What would you like to ask?
                </label>
                <textarea
                  id="educator-question"
                  rows={5}
                  required
                  value={question}
                  onChange={(e) => setQuestion(e.target.value)}
                  placeholder="Write it the way you would say it to a friend. There is no right way to ask."
                  className="w-full bg-white/[0.04] border border-white/10 rounded-xl p-3 text-xs sm:text-sm text-white placeholder:text-white/30 focus:border-amber-400/60 focus:outline-none transition-colors resize-none"
                />
              </div>

              <p className="text-[11px] text-white/40 leading-relaxed">
                Written questions are not for emergencies. If you are in
                distress or feel unsafe, please call your local emergency
                number, or Tele-MANAS at 14416 in India.
              </p>

              <div className="pt-1 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => onOpenChange(false)}
                  className="px-4 py-2 rounded-full text-xs text-white/60 hover:text-white transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="inline-flex items-center gap-1.5 px-5 py-2.5 rounded-full bg-amber-400 text-black hover:bg-amber-300 text-xs font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-200"
                >
                  <Send className="size-3.5" />
                  <span>Send Question</span>
                </button>
              </div>
            </>
          )}
        </form>
      </div>
    </div>,
    document.body
  );
}