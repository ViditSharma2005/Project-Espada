import { Navbar } from "@/components/ui/Navbar";
import { PageFooter } from "@/components/ui/PageFooter";
import { FAQ } from "@/components/ui/FAQ";

export default function LandingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <Navbar />
      {children}
      <FAQ />
      <PageFooter />
    </>
  );
}
