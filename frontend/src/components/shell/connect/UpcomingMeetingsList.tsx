"use client";

import React, { useState } from "react";
import {
  Video,
  Calendar,
  Clock,
  ExternalLink,
  Copy,
  Check,
  BookOpen,
  Sunrise,
} from "lucide-react";
import { cn } from "@/lib/utils";


export interface UpcomingMeeting {
  id: string;
  mentorId: string;
  mentorName: string;
  mentorRole: string;
  mentorAvatar: string;
  title: string;
  type: string;
  date: string;
  time: string;
  duration: string;
  status: "Confirmed" | "Pending" | string;
  platform: "Zoom" | "Video Call" | string;
  zoomUrl: string;
  problemLink?: string;
  agenda?: string;
}

interface UpcomingMeetingsListProps {
  meetings: UpcomingMeeting[];
  onScheduleNew?: () => void;
  onCancelMeeting?: (meetingId: string) => void;
}

export function UpcomingMeetingsList({
  meetings,
  onScheduleNew,
  onCancelMeeting,
}: UpcomingMeetingsListProps) {
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [confirmCancelId, setConfirmCancelId] = useState<string | null>(null);

  const handleCopyLink = async (id: string, link: string) => {
    try {
      await navigator.clipboard.writeText(link);
      setCopiedId(id);
      setTimeout(() => setCopiedId(null), 2000);
    } catch {
      
    }
  };

  if (!meetings || meetings.length === 0) {
    return (
      <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-8 text-center flex flex-col items-center justify-center">
        <div className="size-12 rounded-full bg-amber-400/10 border border-amber-400/20 flex items-center justify-center text-amber-300 mb-3">
          <Sunrise className="size-6" />
        </div>
        <h3 className="text-base font-semibold text-white">
          No sessions booked
        </h3>
        <p className="text-xs text-white/50 max-w-sm mt-1 mb-4 leading-relaxed">
          When your mind feels heavy or a decision feels unclear, you can talk
          it through with an educator. Choose a time that suits you.
        </p>
        {onScheduleNew && (
          <button
            onClick={onScheduleNew}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-amber-400 text-black text-xs font-semibold hover:bg-amber-300 transition-colors"
          >
            <Calendar className="size-3.5" />
            Book a Session
          </button>
        )}
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4">
      {meetings.map((meeting) => {
        const isConfirmed = meeting.status === "Confirmed";
        const isConfirmingCancel = confirmCancelId === meeting.id;

        return (
          <div
            key={meeting.id}
            className="rounded-2xl border border-white/10 bg-white/5 backdrop-blur-md p-5 hover:bg-white/[0.07] transition-colors flex flex-col gap-4"
          >
            {}
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-2.5">
                <span
                  className={cn(
                    "inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-semibold",
                    isConfirmed
                      ? "bg-emerald-500/15 text-emerald-400 border border-emerald-500/30"
                      : "bg-amber-500/15 text-amber-300 border border-amber-500/30"
                  )}
                >
                  <span
                    className={cn(
                      "size-1.5 rounded-full",
                      isConfirmed ? "bg-emerald-400" : "bg-amber-400 animate-pulse"
                    )}
                  />
                  {meeting.status}
                </span>

                <span className="text-[11px] px-2.5 py-0.5 rounded-full bg-white/[0.06] border border-white/10 text-white/70">
                  {meeting.type}
                </span>
              </div>

              <div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-white/80 font-medium">
                <Calendar className="size-3.5 text-amber-400" />
                <span>{meeting.date}</span>
                <span className="text-white/30" aria-hidden="true">
                  |
                </span>
                <Clock className="size-3.5 text-amber-400" />
                <span>{meeting.time}</span>
              </div>
            </div>

            {}
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div className="flex items-start gap-3.5 flex-1 min-w-0">
                {}
                <img
                  src={meeting.mentorAvatar}
                  alt={meeting.mentorName}
                  className="size-11 rounded-full object-cover border border-amber-400/30 shrink-0"
                />

                <div className="min-w-0">
                  <h4 className="text-base font-semibold text-white leading-snug">
                    {meeting.title}
                  </h4>
                  <p className="text-xs text-white/60 mt-0.5">
                    with{" "}
                    <span className="text-white font-medium">
                      {meeting.mentorName}
                    </span>
                    , {meeting.mentorRole}
                  </p>
                  <p className="text-[11px] text-white/35 mt-0.5">
                    {meeting.duration}
                  </p>

                  {meeting.agenda && (
                    <p className="text-xs text-white/50 mt-2 leading-relaxed bg-white/[0.03] p-2.5 rounded-lg border border-white/[0.06]">
                      <span className="font-semibold text-white/70">
                        What you will talk about:{" "}
                      </span>
                      {meeting.agenda}
                    </p>
                  )}

                  {meeting.problemLink && (
                    <div className="mt-2.5 flex items-center gap-1.5 text-xs">
                      <BookOpen className="size-3.5 text-emerald-400" />
                      <span className="text-white/40">Suggested reading:</span>
                      <a
                        href={meeting.problemLink}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-amber-300 hover:underline inline-flex items-center gap-1 truncate max-w-xs"
                      >
                        {meeting.problemLink}
                        <ExternalLink className="size-3 shrink-0" />
                      </a>
                    </div>
                  )}
                </div>
              </div>

              {}
              <div className="flex flex-col sm:items-end gap-2 shrink-0 w-full sm:w-auto pt-2 sm:pt-0 border-t sm:border-t-0 border-white/[0.08]">
                <a
                  href={meeting.zoomUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-amber-400 hover:bg-amber-300 text-black font-semibold text-xs transition-colors w-full sm:w-auto focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-200"
                >
                  <Video className="size-4" />
                  <span>Join Session</span>
                  <ExternalLink className="size-3.5 opacity-60" />
                </a>

                <div className="flex items-center gap-2 w-full justify-between sm:justify-end">
                  <button
                    type="button"
                    onClick={() => handleCopyLink(meeting.id, meeting.zoomUrl)}
                    className="inline-flex items-center gap-1.5 text-[11px] text-white/50 hover:text-white px-2.5 py-1 rounded-md bg-white/[0.04] hover:bg-white/[0.08] transition-colors"
                  >
                    {copiedId === meeting.id ? (
                      <>
                        <Check className="size-3 text-emerald-400" />
                        <span className="text-emerald-400 font-medium">
                          Link copied
                        </span>
                      </>
                    ) : (
                      <>
                        <Copy className="size-3" />
                        <span>Copy link</span>
                      </>
                    )}
                  </button>

                  {onCancelMeeting &&
                    (isConfirmingCancel ? (
                      <span className="inline-flex items-center gap-2 text-[11px]">
                        <button
                          type="button"
                          onClick={() => {
                            onCancelMeeting(meeting.id);
                            setConfirmCancelId(null);
                          }}
                          className="text-red-400 hover:text-red-300 font-medium transition-colors"
                        >
                          Yes, cancel
                        </button>
                        <button
                          type="button"
                          onClick={() => setConfirmCancelId(null)}
                          className="text-white/50 hover:text-white transition-colors"
                        >
                          Keep
                        </button>
                      </span>
                    ) : (
                      <button
                        type="button"
                        onClick={() => setConfirmCancelId(meeting.id)}
                        className="text-[11px] text-red-400/60 hover:text-red-400 px-2 py-1 transition-colors"
                      >
                        Cancel session
                      </button>
                    ))}
                </div>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}