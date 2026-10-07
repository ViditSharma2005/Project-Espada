// src/app/(shell)/generator/page.tsx — thin server wrapper; all state and
// logic live in components/shell/generator/GeneratorView.tsx.
import { GeneratorView } from "@/components/shell/generator/GeneratorView";

export default function GeneratorPage() {
  return <GeneratorView />;
}
