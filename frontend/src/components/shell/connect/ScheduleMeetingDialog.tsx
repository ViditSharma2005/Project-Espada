"use client";

import React, { useEffect, useMemo, useState, useSyncExternalStore } from "react";
import { createPortal } from "react-dom";
import { X, Clock, Video, Lock } from "lucide-react";
import type { Mentor } from "./AssignedMentorCard";
import type { UpcomingMeeting } from "./UpcomingMeetingsList";

interface ScheduleMeetingDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  mentor: Mentor | null;
  onConfirmSchedule: (meeting: UpcomingMeeting) => void;
}

const SESSION_TYPES = [
  {
    id: "Guidance Session",
    title: "Guidance Session",
    desc: "Talk through a decision, doubt or dilemma",
    duration: "45 mins",
  },
  {
    id: "Life Counselling",
    title: "Life Counselling",
    desc: "Stress, loss, relationships or feeling stuck",
    duration: "60 mins",
  },
  {
    id: "Meditation Guidance",
    title: "Meditation Guidance",
    desc: "Learn or refine a daily practice",
    duration: "45 mins",
  },
  {
    id: "Spiritual Inquiry",
    title: "Spiritual Inquiry",
    desc: "Questions on Vedanta, the Gita or life's purpose",
    duration: "30 mins",
  },
];

const TIME_SLOTS = [
  "4:30 PM – 5:15 PM IST",
  "6:00 PM – 6:45 PM IST",
  "7:30 PM – 8:15 PM IST",
  "9:00 PM – 9:45 PM IST",
];


function getAvailableDays() {
  const days: { label: string; dateStr: string }[] = [];
  for (let i = 1; i <= 3; i++) {
    const d = new Date();
    d.setDate(d.getDate() + i);
    const weekday = d.toLocaleDateString("en-US", { weekday: "long" });
    const monthDay = d.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
    const label = i === 1 ? "Tomorrow" : weekday;
    days.push({ label, dateStr: `${label}, ${monthDay}` });
  }
  return days;
}

export function ScheduleMeetingDialog({
  open,
  onOpenChange,
  mentor,
  onConfirmSchedule,
}: ScheduleMeetingDialogProps) {
  const mounted = useSyncExternalStore(
    () => () => {},
    () => true,
    () => false
  );
  const [visible, setVisible] = useState(open);

  const [selectedType, setSelectedType] = useState(SESSION_TYPES[0].id);
  const [selectedDayIndex, setSelectedDayIndex] = useState(0);
  const [selectedSlot, setSelectedSlot] = useState(TIME_SLOTS[0]);
  const [topic, setTopic] = useState("");
  const [agenda, setAgenda] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const availableDays = useMemo(() => getAvailableDays(), [open]);

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

  const selectedDay = availableDays[selectedDayIndex];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);    const randomMeetingId = Math.floor(10000000000 + Math.random() * 90000000000);
    const meetingUrl = `https://zoom.us/j/${randomMeetingId}?pwd=${Math.random()
      .toString(36)
      .substring(2, 8)}`;

    const newMeeting: UpcomingMeeting = {
      id: `meet-${Date.now()}`,
      mentorId: mentor.id,
      mentorName: mentor.name,
      mentorRole: mentor.role,
      mentorAvatar: mentor.avatar,
      title: topic.trim() || `${selectedType} with ${mentor.name}`,
      type: selectedType,
      date: selectedDay.dateStr,
      time: selectedSlot,
      duration:
        SESSION_TYPES.find((t) => t.id === selectedType)?.duration || "45 mins",
      status: "Confirmed",
      platform: "Video Call",
      zoomUrl: meetingUrl,
      problemLink: undefined,
      agenda:
        agenda.trim() || "An open conversation. Share what is on your mind.",
    };

    setTimeout(() => {
      onConfirmSchedule(newMeeting);
      setIsSubmitting(false);
      onOpenChange(false);
      setTopic("");
      setAgenda("");
      setSelectedType(SESSION_TYPES[0].id);
      setSelectedDayIndex(0);
      setSelectedSlot(TIME_SLOTS[0]);
    }, 400);
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
        aria-label={`Book a session with ${mentor.name}`}
        className={`relative flex flex-col w-full bg-[#111114]/95 backdrop-blur-2xl border border-white/[0.1] shadow-2xl transition-all duration-200 ease-out
        h-[100dvh] rounded-none
        sm:h-auto sm:max-h-[90vh] sm:max-w-[620px] sm:w-[92vw] sm:rounded-[24px]
        ${open ? "opacity-100 translate-y-0 sm:scale-100" : "opacity-0 translate-y-6 sm:translate-y-3 sm:scale-[0.96]"}
        `}
      >
        <div className="absolute inset-0 rounded-none sm:rounded-[24px] bg-gradient-to-b from-amber-400/[0.1] to-transparent pointer-events-none h-[30%]" />

        
        <div className="relative shrink-0 p-6 sm:p-7 pb-4 border-b border-white/[0.08]">
          <button
            onClick={() => onOpenChange(false)}
            className="absolute top-4 right-4 sm:top-5 sm:right-5 p-2 rounded-full bg-white/[0.06] hover:bg-white/[0.12] border border-white/[0.08] text-white/60 hover:text-white transition-colors"
            aria-label="Close"
          >
            <X className="size-4" />
          </button>

          <span className="inline-flex items-center gap-1.5 text-[11px] font-medium px-2.5 py-0.5 rounded-full bg-amber-400/10 text-amber-300 border border-amber-400/25 mb-2">
            <Video className="size-3" />
            Private one-to-one video call
          </span>

          <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight pr-10">
            Book a Session with {mentor.name}
          </h2>
          <p className="text-xs text-white/50 mt-1">
            {mentor.role}, {mentor.company}
          </p>
        </div>

        
        <form
          onSubmit={handleSubmit}
          className="relative flex-1 overflow-y-auto p-6 sm:p-7 space-y-6 custom-scrollbar"
        >
          
          <div>
            <p className="text-sm font-semibold text-white mb-2">
              What kind of session would help?
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {SESSION_TYPES.map((t) => (
                <button
                  type="button"
                  key={t.id}
                  onClick={() => setSelectedType(t.id)}
                  aria-pressed={selectedType === t.id}
                  className={`text-left p-3 rounded-xl border text-xs transition-colors ${
                    selectedType === t.id
                      ? "bg-amber-400/10 border-amber-400/60 text-white"
                      : "bg-white/[0.02] border-white/[0.08] text-white/60 hover:bg-white/[0.05]"
                  }`}
                >
                  <div className="font-semibold text-white flex items-center justify-between gap-2">
                    <span>{t.title}</span>
                    <span className="text-[10px] text-white/40 font-normal">
                      {t.duration}
                    </span>
                  </div>
                  <p className="text-[11px] text-white/40 mt-1 leading-snug">
                    {t.desc}
                  </p>
                </button>
              ))}
            </div>
          </div>

          
          <div>
            <p className="text-sm font-semibold text-white mb-2">
              Choose a day and time
            </p>
            <div className="flex gap-2 mb-2.5">
              {availableDays.map((d, i) => (
                <button
                  type="button"
                  key={d.dateStr}
                  onClick={() => setSelectedDayIndex(i)}
                  aria-pressed={selectedDayIndex === i}
                  className={`flex-1 py-2 px-3 rounded-xl text-xs font-medium border text-center transition-colors ${
                    selectedDayIndex === i
                      ? "bg-white text-black font-semibold border-white"
                      : "bg-white/[0.04] border-white/[0.08] text-white/60 hover:text-white"
                  }`}
                >
                  {d.label}
                </button>
              ))}
            </div>

            <div className="grid grid-cols-2 gap-2">
              {TIME_SLOTS.map((slot) => (
                <button
                  type="button"
                  key={slot}
                  onClick={() => setSelectedSlot(slot)}
                  aria-pressed={selectedSlot === slot}
                  className={`py-2 px-3 rounded-xl text-xs font-medium border text-center transition-colors flex items-center justify-center gap-1.5 ${
                    selectedSlot === slot
                      ? "bg-emerald-500/20 border-emerald-500/50 text-emerald-300 font-semibold"
                      : "bg-white/[0.02] border-white/[0.08] text-white/60 hover:text-white hover:bg-white/[0.05]"
                  }`}
                >
                  <Clock className="size-3" />
                  <span>{slot}</span>
                </button>
              ))}
            </div>
          </div>

          
          <div>
            <p className="text-sm font-semibold text-white mb-2">
              What is on your mind?
            </p>

            <div className="space-y-3">
              <input
                type="text"
                required
                value={topic}
                onChange={(e) => setTopic(e.target.value)}
                aria-label="Topic of the session"
                placeholder="In a few words, e.g. feeling lost after a setback"
                className="w-full bg-white/[0.04] border border-white/10 rounded-xl px-3.5 py-2.5 text-xs sm:text-sm text-white placeholder:text-white/30 focus:border-amber-400/60 focus:outline-none transition-colors"
              />

              <textarea
                rows={3}
                value={agenda}
                onChange={(e) => setAgenda(e.target.value)}
                aria-label="More about what you want to discuss"
                placeholder="Share as much or as little as you feel comfortable with. You can also leave this blank and talk it through in the session."
                className="w-full bg-white/[0.04] border border-white/10 rounded-xl p-3 text-xs text-white placeholder:text-white/30 focus:border-amber-400/60 focus:outline-none transition-colors resize-none"
              />
            </div>
          </div>

          
          <div className="p-3 rounded-xl bg-white/[0.03] border border-white/10 text-xs text-white/70 flex items-start gap-2.5">
            <Lock className="size-4 text-amber-400 mt-0.5 shrink-0" />
            <div>
              <p className="font-medium text-white">Your video link is created for you</p>
              <p className="text-[11px] text-white/50 mt-0.5">
                A private link is added to your upcoming sessions as soon as you
                confirm. Join from there at the scheduled time.
              </p>
            </div>
          </div>

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
              disabled={isSubmitting}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-amber-400 text-black hover:bg-amber-300 font-semibold text-xs transition-colors disabled:opacity-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-200"
            >
              {isSubmitting ? (
                <span>Booking your session...</span>
              ) : (
                <span>Confirm Session</span>
              )}
            </button>
          </div>
        </form>
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