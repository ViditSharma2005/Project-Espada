"use client";

import React, { useMemo, useState } from "react";
import {
  Search,
  Calendar,
  History,
  Compass,
  CheckCircle2,
  Sunrise,
} from "lucide-react";
import connectData from "@/app/DataFolder/connectData.json";
import {
  AssignedMentorCard,
  type Mentor,
} from "@/components/shell/connect/AssignedMentorCard";
import {
  UpcomingMeetingsList,
  type UpcomingMeeting,
} from "@/components/shell/connect/UpcomingMeetingsList";
import {
  PastMeetingsList,
  type PastMeeting,
} from "@/components/shell/connect/PastMeetingsList";
import { MeetingFeedbackDialog } from "@/components/shell/connect/MeetingFeedbackDialog";
import { ScheduleMeetingDialog } from "@/components/shell/connect/ScheduleMeetingDialog";
import {
  MentorDirectoryDialog,
  type DatabaseMentor,
} from "@/components/shell/connect/MentorDirectoryDialog";
import { QuickDoubtDialog } from "@/components/shell/connect/QuickDoubtDialog";
import { cn } from "@/lib/utils";

type TabType = "all" | "upcoming" | "past";

// Convert a directory entry into the card shape used by AssignedMentorCard
const toGuide = (m: DatabaseMentor): Mentor => ({
  id: m.id,
  name: m.name,
  role: m.role,
  company: m.company,
  avatar: m.avatar,
  bio: m.bio,
  rating: m.rating,
  totalSessions: m.totalSessions,
  tags: m.tags,
  status: "Meeting Scheduled",
});

export default function ConnectPage() {
  const [upcomingMeetings, setUpcomingMeetings] = useState<UpcomingMeeting[]>(
    connectData.upcomingMeetings as UpcomingMeeting[]
  );
  const [pastMeetings] = useState<PastMeeting[]>(
    connectData.pastMeetings as PastMeeting[]
  );
  const [educatorDirectory] = useState<DatabaseMentor[]>(
    connectData.mentorDatabase as DatabaseMentor[]
  );

  const [activeTab, setActiveTab] = useState<TabType>("all");

  const [selectedPastMeeting, setSelectedPastMeeting] =
    useState<PastMeeting | null>(null);
  const [isFeedbackOpen, setIsFeedbackOpen] = useState(false);

  const [schedulingEducator, setSchedulingEducator] = useState<Mentor | null>(
    null
  );
  const [isScheduleOpen, setIsScheduleOpen] = useState(false);

  const [isDirectoryOpen, setIsDirectoryOpen] = useState(false);

  const [questionEducator, setQuestionEducator] = useState<Mentor | null>(null);
  const [isQuestionOpen, setIsQuestionOpen] = useState(false);

  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const triggerToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 4000);
  };

  // Everyone you can meet. Used to build the "Your Guides" cards.
  const knownEducators = useMemo<Mentor[]>(
    () => educatorDirectory.map(toGuide),
    [educatorDirectory]
  );

  // Guides appear only when a session is booked with them.
  const guidesWithSessions = useMemo<Mentor[]>(() => {
    const ids: string[] = [];
    upcomingMeetings.forEach((m) => {
      if (!ids.includes(m.mentorId)) ids.push(m.mentorId);
    });

    return ids.map((id) => {
      const known = knownEducators.find((e) => e.id === id);
      if (known) return { ...known, status: "Meeting Scheduled" } as Mentor;

      // Fallback if the educator is not in the directory
      const meeting = upcomingMeetings.find((m) => m.mentorId === id)!;
      return {
        id,
        name: meeting.mentorName,
        role: meeting.mentorRole,
        company: "",
        avatar: meeting.mentorAvatar,
        bio: "",
        rating: 0,
        totalSessions: 0,
        tags: [meeting.type],
        status: "Meeting Scheduled",
      } as Mentor;
    });
  }, [upcomingMeetings, knownEducators]);

  const handleOpenSchedule = (educator: Mentor) => {
    setSchedulingEducator(educator);
    setIsScheduleOpen(true);
  };

  const handleOpenQuestion = (educator: Mentor) => {
    setQuestionEducator(educator);
    setIsQuestionOpen(true);
  };

  const handleMeetingScheduled = (newMeeting: UpcomingMeeting) => {
    setUpcomingMeetings((prev) => [newMeeting, ...prev]);
    triggerToast(
      `Session with ${newMeeting.mentorName} booked for ${newMeeting.date}.`
    );
  };

  const handleCancelMeeting = (meetingId: string) => {
    setUpcomingMeetings((prev) => prev.filter((m) => m.id !== meetingId));
    triggerToast("Session cancelled.");
  };

  const handleOpenFeedback = (meeting: PastMeeting) => {
    setSelectedPastMeeting(meeting);
    setIsFeedbackOpen(true);
  };

  return (
    <div className="flex flex-col gap-6 sm:gap-8 max-w-7xl mx-auto pb-12">
      {/* Toast */}
      {toastMessage && (
        <div className="fixed top-20 right-6 z-50 bg-amber-500/95 text-black px-4 py-2.5 rounded-xl shadow-2xl flex items-center gap-2 text-xs font-semibold backdrop-blur-md border border-amber-300/40 animate-in fade-in slide-in-from-top-2">
          <CheckCircle2 className="size-4" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <Sunrise className="size-5 text-amber-400" />
            <span className="text-xs sm:text-sm text-amber-300/80 font-medium">
              Guidance for the restless mind
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-white">
            Sit with a Guide
          </h1>
          <p className="text-xs sm:text-sm text-white/50 mt-1 max-w-2xl leading-relaxed">
            Troubled by a thought you cannot settle, a decision you cannot make,
            or a loss you are still carrying? Speak one-on-one with an educator
            over a private video call. Share what weighs on you and be heard
            without judgement.
          </p>

          <blockquote className="mt-4 border-l-2 border-amber-400/60 pl-3 max-w-2xl">
            <p className="text-sm sm:text-base text-white/80 italic">
              &ldquo;Arise, awake, and stop not till the goal is reached.&rdquo;
            </p>
            <footer className="text-[11px] text-white/40 mt-1">
              Swami Vivekananda
            </footer>
          </blockquote>
        </div>

        <div className="flex items-center gap-2.5 shrink-0">
          <button
            onClick={() => setIsDirectoryOpen(true)}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-full bg-white/5 hover:bg-white/10 border border-white/10 text-white text-[11px] sm:text-xs font-medium transition-colors"
          >
            <Search className="size-3.5 text-white/60" />
            <span>Find an Educator</span>
          </button>

          <button
            onClick={() => setIsDirectoryOpen(true)}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-amber-400 text-black hover:bg-amber-300 text-[11px] sm:text-xs font-semibold shadow-lg shadow-amber-400/10 transition-all hover:scale-[1.02]"
          >
            <Calendar className="size-3.5" />
            <span>Book a Session</span>
          </button>
        </div>
      </div>

      {/* Your Guides: only educators with a booked session */}
      <div>
        <div className="flex items-center justify-between mb-3.5">
          <div className="flex items-center gap-2">
            <Compass className="size-4 text-amber-400" />
            <h2 className="text-base sm:text-lg font-bold text-white">
              Your Guides
            </h2>
          </div>
          {guidesWithSessions.length > 0 && (
            <span className="text-xs text-white/40">
              {guidesWithSessions.length} with upcoming sessions
            </span>
          )}
        </div>

        {guidesWithSessions.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {guidesWithSessions.map((educator) => (
              <AssignedMentorCard
                key={educator.id}
                mentor={educator}
                isPrimary={false}
                onScheduleMeeting={handleOpenSchedule}
                onQuickDoubt={handleOpenQuestion}
              />
            ))}
          </div>
        ) : (
          <div className="rounded-2xl border border-dashed border-white/15 bg-white/[0.02] p-6 text-center">
            <p className="text-sm text-white/70">
              You have no sessions booked yet.
            </p>
            <p className="text-xs text-white/40 mt-1">
              Educators you book will appear here.
            </p>
            <button
              onClick={() => setIsDirectoryOpen(true)}
              className="mt-4 inline-flex items-center gap-2 px-4 py-2 rounded-full bg-amber-400 text-black hover:bg-amber-300 text-xs font-semibold transition-colors"
            >
              <Search className="size-3.5" />
              <span>Find an Educator</span>
            </button>
          </div>
        )}
      </div>

      {/* Tabs */}
      <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-white/[0.08]">
        <div className="flex items-center gap-1 bg-white/5 border border-white/10 rounded-full p-1">
          <button
            onClick={() => setActiveTab("all")}
            className={cn(
              "px-3.5 py-1.5 rounded-full text-xs font-medium transition-colors",
              activeTab === "all"
                ? "bg-white text-black font-semibold shadow"
                : "text-white/50 hover:text-white"
            )}
          >
            All Sessions
          </button>

          <button
            onClick={() => setActiveTab("upcoming")}
            className={cn(
              "px-3.5 py-1.5 rounded-full text-xs font-medium transition-colors",
              activeTab === "upcoming"
                ? "bg-white text-black font-semibold shadow"
                : "text-white/50 hover:text-white"
            )}
          >
            Upcoming ({upcomingMeetings.length})
          </button>

          <button
            onClick={() => setActiveTab("past")}
            className={cn(
              "px-3.5 py-1.5 rounded-full text-xs font-medium transition-colors",
              activeTab === "past"
                ? "bg-white text-black font-semibold shadow"
                : "text-white/50 hover:text-white"
            )}
          >
            Past &amp; Reflections ({pastMeetings.length})
          </button>
        </div>

        <button
          onClick={() => setIsDirectoryOpen(true)}
          className="text-xs text-amber-300 hover:text-amber-200 font-medium transition-colors"
        >
          Looking for a different kind of guidance? →
        </button>
      </div>

      {/* Upcoming Sessions */}
      {(activeTab === "all" || activeTab === "upcoming") && (
        <section>
          <div className="flex items-center justify-between mb-3.5">
            <div className="flex items-center gap-2">
              <Calendar className="size-4 text-amber-400" />
              <h2 className="text-sm sm:text-lg font-bold text-white">
                Upcoming Sessions
              </h2>
            </div>
            {upcomingMeetings.length > 0 && (
              <button
                onClick={() => setIsDirectoryOpen(true)}
                className="text-xs text-white/50 hover:text-white transition-colors"
              >
                + Book another
              </button>
            )}
          </div>

          <UpcomingMeetingsList
            meetings={upcomingMeetings}
            onScheduleNew={() => setIsDirectoryOpen(true)}
            onCancelMeeting={handleCancelMeeting}
          />
        </section>
      )}

      {/* Past Sessions */}
      {(activeTab === "all" || activeTab === "past") && (
        <section>
          <div className="flex items-center justify-between mb-3.5">
            <div className="flex items-center gap-2">
              <History className="size-5 text-emerald-400" />
              <h2 className="text-sm sm:text-lg font-bold text-white">
                Past Sessions &amp; Reflections
              </h2>
            </div>
            <span className="text-[10px] text-white/40">
              Select a session to read your guide&apos;s notes
            </span>
          </div>

          <PastMeetingsList
            meetings={pastMeetings}
            onOpenFeedback={handleOpenFeedback}
          />
        </section>
      )}

      {/* Dialogs */}
      <MeetingFeedbackDialog
        open={isFeedbackOpen}
        onOpenChange={setIsFeedbackOpen}
        meeting={selectedPastMeeting}
      />

      <ScheduleMeetingDialog
        open={isScheduleOpen}
        onOpenChange={setIsScheduleOpen}
        mentor={schedulingEducator}
        onConfirmSchedule={handleMeetingScheduled}
      />

      <MentorDirectoryDialog
        open={isDirectoryOpen}
        onOpenChange={setIsDirectoryOpen}
        mentors={educatorDirectory}
        onSelectMentorToBook={handleOpenSchedule}
      />

      <QuickDoubtDialog
        open={isQuestionOpen}
        onOpenChange={setIsQuestionOpen}
        mentor={questionEducator}
        onSubmitDoubt={(d) => {
          triggerToast(`Your question was sent to ${d.mentorName}.`);
        }}
      />
    </div>
  );
}