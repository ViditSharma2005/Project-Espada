import { DashboardShell } from "@/components/shell/DashboardShell";
import { PROJECT_NAME } from "@/lib/site-config";

export default function ShellLayout({ children }: { children: React.ReactNode }) {
  return <DashboardShell companyName={PROJECT_NAME}>{children}</DashboardShell>;
}