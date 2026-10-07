"use client";

import React from "react";
import { Star, Calendar, MessageCircleQuestion, CalendarPlus } from "lucide-react";
import { cn } from "@/lib/utils";



export interface Mentor {
  id: string;
  name: string;
  role: string;
  company: string;
  avatar: string;
  bio: string;
  rating: number;
  totalSessions: number;
  avgResponseTime?: string;
  assignedSince?: string;
  status?: string;
  tags: string[];
  zoomPersonalLink?: string;
  nextSlot?: string;
}

interface AssignedMentorCardProps {
  mentor: Mentor;
  isPrimary?: boolean;
  onScheduleMeeting: (mentor: Mentor) => void;
  onQuickDoubt?: (mentor: Mentor) => void;
}

export function AssignedMentorCard({
  mentor,
  isPrimary = false,
  onScheduleMeeting,
  onQuickDoubt,
}: AssignedMentorCardProps) {
  const hasSession = mentor.status === "Meeting Scheduled";

  
  const badgeLabel = hasSession
    ? "Session booked"
    : mentor.status || "Educator";

  return (
    <div
      className={cn(
        "relative rounded-2xl border backdrop-blur-md p-5 sm:p-6 transition-colors duration-300",
        isPrimary || hasSession
          ? "border-amber-400/25 bg-gradient-to-b from-amber-400/[0.07] via-white/[0.03] to-white/[0.02]"
          : "border-white/10 bg-white/5 hover:bg-white/[0.07]"
      )}
    >
      {}
      <div className="mb-5">
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] text-amber-200 border border-amber-400/30 bg-amber-400/5">
          <span
            className={cn(
              "size-1.5 rounded-full",
              hasSession ? "bg-amber-400" : "bg-emerald-400"
            )}
          />
          {badgeLabel}
        </span>
      </div>

      {}
      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 sm:gap-5">
        {}
        <img
          src={mentor.avatar}
          alt={mentor.name}
          className="size-16 sm:size-20 shrink-0 rounded-full object-cover border-2 border-amber-400/30 shadow-lg"
        />

        <div className="flex-1 min-w-0">
          <h3 className="text-lg sm:text-xl font-bold text-white tracking-tight">
            {mentor.name}
          </h3>

          <p className="text-sm font-medium text-white/70 mt-0.5">
            {mentor.role}
          </p>
          {mentor.company && (
            <p className="text-xs text-white/40 mt-0.5">{mentor.company}</p>
          )}

          <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5 mt-3 text-xs">
            {mentor.totalSessions > 0 && (
              <span className="inline-flex items-center gap-1 font-semibold text-amber-400">
                <Star className="size-3.5 fill-amber-400" />
                {mentor.rating.toFixed(1)}
                <span className="text-white/40 font-normal ml-1">
                  {mentor.totalSessions} sessions guided
                </span>
              </span>
            )}

            {mentor.nextSlot && (
              <span className="inline-flex items-center gap-1 text-emerald-400 font-medium">
                <Calendar className="size-3.5" />
                Next available: {mentor.nextSlot}
              </span>
            )}
          </div>
        </div>
      </div>

      {}
      {mentor.bio && (
        <p className="mt-4 text-xs text-white/50 leading-relaxed line-clamp-2">
          {mentor.bio}
        </p>
      )}

      {}
      <div className="mt-4 pt-4 border-t border-white/[0.08]">
        <p className="text-[11px] text-white/40 font-medium mb-2">
          You can ask about
        </p>
        <div className="flex flex-wrap items-center gap-1.5">
          {mentor.tags.map((tag) => (
            <span
              key={tag}
              className="text-[11px] px-2.5 py-1 rounded-full bg-white/[0.06] border border-white/10 text-white/75"
            >
              {tag}
            </span>
          ))}
        </div>
      </div>

      {}
      <div className="mt-5 flex items-center gap-2.5">
        {onQuickDoubt && (
          <button
            type="button"
            onClick={() => onQuickDoubt(mentor)}
            className="flex-1 sm:flex-none inline-flex items-center justify-center gap-1.5 px-4 py-2 rounded-full bg-white/5 hover:bg-white/10 border border-white/10 text-xs font-medium text-white transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-400/60"
          >
            <MessageCircleQuestion className="size-3.5" />
            Ask a Question
          </button>
        )}

        <button
          type="button"
          onClick={() => onScheduleMeeting(mentor)}
          className="flex-1 sm:flex-none inline-flex items-center justify-center gap-2 px-5 py-2 rounded-full bg-amber-400 text-black hover:bg-amber-300 text-xs font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-200"
        >
          <CalendarPlus className="size-3.5" />
          <span>Book Session</span>
        </button>
      </div>
    </div>
  );
}