import Link from "next/link";
import { FaGithub } from "react-icons/fa";
import type React from "react";
import { PROJECT_NAME } from "@/lib/site-config";

interface Logo {
  url: string;
  src: string;
  alt: string;
  title: string;
}

interface FooterLink {
  name: string;
  href: string;
}

interface FooterSection {
  title: string;
  links: FooterLink[];
}

interface SocialLink {
  icon?: React.ReactElement;
  Icon?: React.ComponentType<{ className?: string }>;
  href: string;
  label: string;
}

interface FooterProps {
  logo?: Logo;
  sections?: FooterSection[];
  description?: string;
  socialLinks?: SocialLink[];
  copyright?: string;
  legalLinks?: FooterLink[];
}

const defaultLogo: Logo = {
  url: "/",
  src: "/logo.jpeg",
  alt: `${PROJECT_NAME} logo`,
  title: PROJECT_NAME,
};

const defaultSections: FooterSection[] = [
  {
    title: "Teachings",
    links: [
      { name: "Articles", href: "/article" },
      { name: "Explore reels", href: "/explore" },
      { name: "Prompt experience", href: "/generator" },
    ],
  },
  {
    title: "Community",
    links: [
      { name: "Connect", href: "/connect" },
      { name: "Share feedback", href: "/feedback" },
      { name: "Contribute", href: "/contributor-space" },
    ],
  },
  {
    title: "Project",
    links: [
      { name: "About", href: "/about" },
      { name: "Discover", href: "/discover" },
      { name: "Privacy", href: "/policy" },
      { name: "Terms", href: "/terms" },
    ],
  },
];

const defaultSocials: SocialLink[] = [
  {
    Icon: FaGithub,
    href: "https://github.com/ViditSharma2005/Project-Espada",
    label: "Project repository on GitHub",
  },
];

const defaultLegal: FooterLink[] = [
  { name: "Terms", href: "/terms" },
  { name: "Privacy", href: "/policy" },
];

export const PageFooter = ({
  logo = defaultLogo,
  sections = defaultSections,
  description = "A digital space for reading, watching, and applying the teachings of Swami Vivekananda.",
  socialLinks = defaultSocials,
  copyright = `© 2026 ${PROJECT_NAME}. Independent educational project.`,
  legalLinks = defaultLegal,
}: FooterProps) => {
  return (
    <footer className="w-full border-t border-white/[0.08] bg-[#060606] text-white">
      <div className="mx-auto max-w-7xl px-6 py-16 sm:px-10 lg:px-16">
        <div className="grid gap-14 lg:grid-cols-[1.1fr_1.4fr]">
          <div className="max-w-md">
            <div className="flex items-center gap-3">
              <Link href={logo.url} aria-label="Return home">
                
                <img
                  src={logo.src}
                  alt={logo.alt}
                  className="size-10 rounded-full border border-orange-300/30 object-cover"
                />
              </Link>
              <span className="text-lg font-semibold tracking-tight">{logo.title}</span>
            </div>
            <p className="mt-5 text-sm leading-6 text-white/45">{description}</p>
            <p className="mt-4 text-xs leading-5 text-white/25">
              Not an official publication of the Ramakrishna Math or Ramakrishna Mission.
            </p>

            {socialLinks.length > 0 ? (
              <div className="mt-7 flex items-center gap-3">
                {socialLinks.map((social) => {
                  const Icon = social.Icon;
                  return (
                    <a
                      key={social.label}
                      href={social.href}
                      target="_blank"
                      rel="noopener noreferrer"
                      aria-label={social.label}
                      className="flex size-9 items-center justify-center rounded-full border border-white/10 bg-white/[0.04] text-white/65 transition hover:border-orange-300/30 hover:text-orange-200"
                    >
                      {social.icon ?? (Icon ? <Icon className="size-4" /> : null)}
                    </a>
                  );
                })}
              </div>
            ) : null}
          </div>

          <nav className="grid grid-cols-2 gap-10 sm:grid-cols-3" aria-label="Footer navigation">
            {sections.map((section) => (
              <div key={section.title}>
                <h3 className="text-xs font-medium tracking-[0.18em] text-orange-200 uppercase">
                  {section.title}
                </h3>
                <ul className="mt-5 space-y-3 text-sm text-white/45">
                  {section.links.map((link) => (
                    <li key={`${section.title}-${link.name}`}>
                      <Link href={link.href} className="transition hover:text-white">
                        {link.name}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </nav>
        </div>

        <div className="mt-14 flex flex-col justify-between gap-4 border-t border-white/[0.08] pt-6 text-xs text-white/30 sm:flex-row">
          <p>{copyright}</p>
          <div className="flex gap-5">
            {legalLinks.map((link) => (
              <Link key={link.name} href={link.href} className="transition hover:text-white/70">
                {link.name}
              </Link>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
};

export default PageFooter;
