import {
  WorksWheel,
  type WorksWheelItem,
} from "@/components/ui/works-wheel";
import { PROJECT_NAME } from "@/lib/site-config";

const TEACHINGS: WorksWheelItem[] = [
  {
    title: "Swami Vivekananda",
    image: "/DataFolder/landing/1.jpeg",
    href: "/article?article=spirituality",
  },
  {
    title: "The Ultimate Question",
    image: "/DataFolder/landing/2.jpeg",
    href: "/article?article=strength",
  },
  {
    title: "Vow of Renunciation",
    image: "/DataFolder/landing/3.jpeg",
    href: "/article?article=raja-yoga",
  },
  {
    title: "The Chicago Triumph",
    image: "/DataFolder/landing/4.jpeg",
    href: "/article?article=fomo",
  },
  {
    title: "Teaching the West",
    image: "/DataFolder/landing/5.jpeg",
    href: "/article?article=focus",
  },
  {
    title: "Returning Home",
    image: "/DataFolder/landing/6.jpeg",
    href: "/article?article=karma-yoga",
  },
  {
    title: "Belur Math",
    image: "/DataFolder/landing/7.jpeg",
    href: "/article?article=vedanta",
  },
  {
    title: "Seva",
    image: "/DataFolder/articles/covers/live-for-others.jpg",
    href: "/article?article=seva",
  },
  {
    title: "Concentration",
    image: "/DataFolder/articles/covers/education.jpg",
    href: "/article?article=concentration",
  },
];

export default function Home() {
  return (
    <main className="h-screen min-h-[38rem] w-full bg-black">
      <WorksWheel
        items={TEACHINGS}
        label={PROJECT_NAME}
        action="Read teaching"
      />
    </main>
  );
}
