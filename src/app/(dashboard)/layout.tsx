import { DashboardNav } from "@/components/dashboard/dashboard-nav";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-full flex-col">
      <div className="h-1 bg-transito" aria-hidden />
      <DashboardNav />
      <div className="flex flex-1 flex-col bg-background">{children}</div>
    </div>
  );
}
