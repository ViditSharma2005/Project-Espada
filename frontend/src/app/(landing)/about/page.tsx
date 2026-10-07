import type { Metadata } from "next";
import Link from "next/link";
import { PROJECT_NAME } from "@/lib/site-config";

export const metadata: Metadata = {
  title: `About ${PROJECT_NAME}`,
  description: `${PROJECT_NAME} presents the teachings of Swami Vivekananda through carefully connected articles, short reels, reflective prompts, and guided practice.`,
  keywords: [
    PROJECT_NAME,
    "Swami Vivekananda teachings",
    "Vedanta",
    "Raja Yoga",
    "Karma Yoga",
    "Indian philosophy",
    "spiritual practice",
  ],
  openGraph: {
    title: `About ${PROJECT_NAME}`,
    description:
      "A thoughtful digital space for reading, watching, and applying the teachings of Swami Vivekananda.",
    type: "website",
  },
};

const principles = [
  {
    number: "01",
    title: "Read beyond the quotation",
    text: "Short sayings can inspire, but context turns inspiration into understanding. Every article develops a teaching and links it to a related reel.",
  },
  {
    number: "02",
    title: "Turn reflection into practice",
    text: "The teachings are presented as invitations to act—with strength, concentration, service, self-knowledge, and freedom from attachment.",
  },
  {
    number: "03",
    title: "Use technology with purpose",
    text: "Explore and the prompt-based reel experience help people find a relevant teaching without replacing study, discernment, or personal effort.",
  },
];

export default function About() {
  return (
    <main className="min-h-screen bg-black px-6 pb-24 pt-36 text-white sm:px-10 lg:px-16">
      <div className="mx-auto max-w-6xl">
        <p className="mb-5 text-xs font-medium tracking-[0.28em] text-orange-300 uppercase">
          About the project
        </p>
        <h1 className="max-w-4xl text-5xl font-semibold tracking-[-0.055em] sm:text-6xl lg:text-7xl">
          Vivekananda&apos;s teachings,
          <span className="block text-white/45">made easier to enter and harder to forget.</span>
        </h1>

        <div className="mt-14 grid gap-10 border-t border-white/10 pt-10 lg:grid-cols-[0.8fr_1.2fr]">
          <h2 className="text-xl font-medium text-orange-200">What is {PROJECT_NAME}?</h2>
          <div className="space-y-6 text-lg leading-8 text-white/65">
            <p>
              {PROJECT_NAME} is a digital space for discovering the teachings of
              Swami Vivekananda through connected articles, short-form reels,
              reflective prompts, and opportunities for guided conversation.
            </p>
            <p>
              It is designed for people meeting these ideas for the first time
              as well as readers returning to Vedanta, Raja Yoga, Karma Yoga,
              concentration, strength, and service. The aim is not to reduce a
              philosophy to motivational clips. It is to let a short form open
              the door to a deeper reading—and let that reading lead back into life.
            </p>
          </div>
        </div>

        <section className="mt-24">
          <div className="mb-10 flex items-end justify-between gap-6">
            <div>
              <p className="text-xs tracking-[0.24em] text-white/35 uppercase">Our approach</p>
              <h2 className="mt-3 text-3xl font-semibold tracking-tight sm:text-4xl">
                From attention to action
              </h2>
            </div>
            <p className="hidden max-w-sm text-sm leading-6 text-white/45 md:block">
              Every part of the platform is connected so that the subject you
              choose remains consistent across reading, watching, and reflection.
            </p>
          </div>

          <div className="grid border-l border-t border-white/10 md:grid-cols-3">
            {principles.map((principle) => (
              <article
                key={principle.number}
                className="min-h-72 border-r border-b border-white/10 p-7 sm:p-9"
              >
                <span className="font-mono text-xs text-orange-300">{principle.number}</span>
                <h3 className="mt-14 text-xl font-medium">{principle.title}</h3>
                <p className="mt-4 text-sm leading-6 text-white/50">{principle.text}</p>
              </article>
            ))}
          </div>
        </section>

        <section className="mt-24 rounded-3xl border border-orange-300/15 bg-orange-300/[0.05] px-7 py-10 sm:px-10 sm:py-12">
          <p className="text-xs tracking-[0.24em] text-orange-300 uppercase">A note on the archive</p>
          <p className="mt-5 max-w-4xl text-lg leading-8 text-white/65">
            We distinguish direct quotations from explanatory writing and name
            the associated work wherever the catalog provides it. The articles
            are interpretive guides, not substitutes for the Complete Works of
            Swami Vivekananda or the original philosophical texts.
          </p>
        </section>

        <section className="mt-24 flex flex-col items-start justify-between gap-8 border-t border-white/10 pt-10 sm:flex-row sm:items-end">
          <div>
            <p className="text-sm text-white/40">Start with one teaching.</p>
            <h2 className="mt-2 text-3xl font-semibold tracking-tight">Stay with it long enough to use it.</h2>
          </div>
          <div className="flex gap-3">
            <Link href="/article" className="rounded-full border border-white/15 px-5 py-2.5 text-sm text-white/75 transition hover:border-white/35 hover:text-white">
              Read articles
            </Link>
            <Link href="/explore" className="rounded-full bg-orange-300 px-5 py-2.5 text-sm font-medium text-black transition hover:bg-orange-200">
              Explore reels
            </Link>
          </div>
        </section>
      </div>
    </main>
  );
}
