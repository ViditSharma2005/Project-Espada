import { Badge } from "@/components/ui/badge";
import { PROJECT_NAME } from "@/lib/site-config";

export interface FaqItem {
  question: string;
  answer: string;
}

export interface Faq5Props {
  badge?: string;
  heading?: string;
  description?: string;
  faqs?: FaqItem[];
}

const defaultFaqs: FaqItem[] = [
  {
    question: `What is ${PROJECT_NAME}?`,
    answer: `${PROJECT_NAME} is a learning and reflection platform centered on the teachings of Swami Vivekananda. It connects longer articles, short reels, topic-based prompts, and guided interaction so that each idea can be explored in more than one form.`,
  },
  {
    question: "Is this an official publication of the Ramakrishna Mission?",
    answer:
      "No. This is an independent educational project. It is not an official publication of the Ramakrishna Math or Ramakrishna Mission. Readers should consult authoritative editions of the Complete Works and original texts for formal study.",
  },
  {
    question: "How are articles and reels connected?",
    answer:
      "Every article has a topic ID linked to a matching reel. A reading on Raja Yoga opens the Raja Yoga reel; a reading on Seva opens the Seva reel. Explore uses the same catalog, so the title, teaching, description, and media stay consistent.",
  },
  {
    question: "What does the reel generator do?",
    answer:
      "The current generator matches words and themes in your prompt with the most relevant teaching in the curated catalog. It then presents the corresponding reel and explanation. It does not invent a new quotation or replace the source text.",
  },
  {
    question: "Are all displayed words direct quotations?",
    answer:
      "Quoted lines are presented separately from the platform's explanatory writing. Descriptions and articles are interpretive guides written to provide context and practical reflection. Source or work labels are shown where available.",
  },
  {
    question: "Which subjects can I explore?",
    answer:
      "The initial collection covers spirituality, strength, Raja Yoga, freedom from FOMO, focus, Karma Yoga, Vedanta, Seva, and concentration. More carefully reviewed topics can be added as the archive grows.",
  },
  {
    question: `Is ${PROJECT_NAME} free to use?`,
    answer:
      "Yes. The public reading, Explore, and reflection experiences are intended to remain accessible. Some future services may require accounts or availability, but the core teaching archive is designed for open learning.",
  },
];

export const FAQ = ({
  badge = "FAQ",
  heading = "Questions before you begin",
  description = "How the archive, reels, and prompt experience work together.",
  faqs = defaultFaqs,
}: Faq5Props) => {
  return (
    <section className="border-t border-white/[0.06] bg-black px-6 py-28 text-white sm:px-10 lg:px-16">
      <div className="mx-auto max-w-6xl">
        <div className="max-w-2xl">
          <Badge className="border-orange-300/20 bg-orange-300/10 text-xs font-medium text-orange-200">
            {badge}
          </Badge>
          <h2 className="mt-5 text-4xl font-semibold tracking-[-0.04em] sm:text-5xl">{heading}</h2>
          <p className="mt-5 text-base leading-7 text-white/45">{description}</p>
        </div>

        <div className="mt-14 border-t border-white/10">
          {faqs.map((faq, index) => (
            <article
              key={faq.question}
              className="grid gap-4 border-b border-white/10 py-7 sm:grid-cols-[3rem_0.8fr_1.2fr] sm:gap-8"
            >
              <span className="font-mono text-xs text-orange-300/80">
                {String(index + 1).padStart(2, "0")}
              </span>
              <h3 className="font-medium text-white/90">{faq.question}</h3>
              <p className="text-sm leading-6 text-white/50">{faq.answer}</p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
};
