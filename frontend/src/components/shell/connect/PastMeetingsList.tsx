"use client";

import React from "react";
import {
  NotebookPen,
  CheckCircle2,
  Calendar,
  ArrowRight,
  Leaf,
} from "lucide-react";

// Type names are kept so the page and dialogs keep working.
export interface PastMeetingFeedback {
  // Kept for compatibility. Scores are no longer shown in the list.
  overallScore?: number;
  summary: string;
  strengths: string[];
  improvementAreas: string[];
  actionItems: string[];
  sharedResources?: { title: string; url: string }[];
}

export interface PastMeeting {
  id: string;
  mentorId: string;
  mentorName: string;
  mentorRole: string;
  mentorAvatar: string;
  title: string;
  type: string;
  date: string;
  duration: string;
  platform: string;
  recordingUrl?: string;
  feedback: PastMeetingFeedback;
}

interface PastMeetingsListProps {
  meetings: PastMeeting[];
  onOpenFeedback: (meeting: PastMeeting) => void;
}

export function PastMeetingsList({
  meetings,
  onOpenFeedback,
}: PastMeetingsListProps) {
  if (!meetings || meetings.length === 0) {
    return (
      <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-8 text-center flex flex-col items-center justify-center">
        <div className="size-12 rounded-full bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400 mb-3">
          <NotebookPen className="size-6" />
        </div>
        <h3 className="text-base font-semibold text-white">
          No past sessions yet
        </h3>
        <p className="text-xs text-white/50 max-w-sm mt-1 leading-relaxed">
          After each session, your guide&apos;s reflections and the practices
          they suggest will be kept here, so you can return to them whenever
          you need.
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {meetings.map((meeting) => {
        const practiceCount = meeting.feedback.actionItems?.length ?? 0;

        return (
          <div
            key={meeting.id}
            role="button"
            tabIndex={0}
            aria-label={`Open reflections from ${meeting.title}`}
            onClick={() => onOpenFeedback(meeting)}
            onKeyDown={(e) => {
              if (e.key === "Enter" || e.key === " ") {
                e.preventDefault();
                onOpenFeedback(meeting);
              }
            }}
            className="group rounded-2xl border border-white/10 bg-white/5 backdrop-blur-md p-5 hover:bg-white/[0.08] hover:border-amber-400/30 transition-colors cursor-pointer flex flex-col justify-between gap-4 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-400/60"
          >
            {/* Top */}
            <div>
              <div className="flex flex-wrap items-center justify-between gap-2 mb-2.5">
                <span className="inline-flex items-center gap-1.5 text-[11px] px-2.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-medium">
                  <CheckCircle2 className="size-3" />
                  Completed
                </span>

                <div className="flex items-center gap-2 text-[11px] text-white/40">
                  <Calendar className="size-3" />
                  <span>{meeting.date}</span>
                  <span aria-hidden="true">|</span>
                  <span>{meeting.duration}</span>
                </div>
              </div>

              <h4 className="text-base font-semibold text-white group-hover:text-amber-200 transition-colors line-clamp-1">
                {meeting.title}
              </h4>

              {/* Educator */}
              <div className="flex items-center gap-2 mt-2.5">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={meeting.mentorAvatar}
                  alt={meeting.mentorName}
                  className="size-6 rounded-full object-cover border border-amber-400/30"
                />
                <span className="text-xs text-white/70 font-medium">
                  {meeting.mentorName}
                </span>
                <span className="text-xs text-white/40 truncate">
                  {meeting.mentorRole}
                </span>
              </div>

              {/* Excerpt */}
              <p className="text-xs text-white/60 mt-3 line-clamp-3 leading-relaxed bg-white/[0.02] border border-white/[0.05] p-2.5 rounded-xl">
                {meeting.feedback.summary}
              </p>
            </div>

            {/* Bottom */}
            <div className="pt-3 border-t border-white/[0.08] flex items-center justify-between">
              <span className="inline-flex items-center gap-1.5 text-xs text-white/50">
                <Leaf className="size-3.5 text-emerald-400" />
                {practiceCount > 0
                  ? `${practiceCount} ${practiceCount === 1 ? "practice" : "practices"} to try`
                  : "Reflections saved"}
              </span>

              <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-white group-hover:text-amber-200 transition-colors">
                <span>Read Reflections</span>
                <ArrowRight className="size-3.5 group-hover:translate-x-1 transition-transform" />
              </span>
            </div>
          </div>
        );
      })}
    </div>
  );
}