import { DashboardHeader } from "@/components/dashboard/DashboardHeader";
import { DashboardGrid } from "@/components/dashboard/DashboardGrid";
import { Toolbar } from "@/components/dashboard/Toolbar";

export default function Home() {
  return (
    <main className="min-h-screen bg-background relative overflow-hidden transition-colors duration-500">
      {/* Background Decor */}
      <div className="absolute top-0 left-0 w-[500px] h-[500px] bg-primary/20 rounded-full blur-[100px] -translate-y-1/2 -translate-x-1/2 pointer-events-none animate-pulse" style={{ animationDuration: '4s' }} />
      <div className="absolute bottom-0 right-0 w-[500px] h-[500px] bg-accent/10 rounded-full blur-[100px] translate-y-1/3 translate-x-1/3 pointer-events-none animate-pulse" style={{ animationDuration: '6s', animationDelay: '1s' }} />
      <div className="absolute top-1/2 left-1/2 w-[800px] h-[800px] bg-secondary/30 rounded-full blur-[120px] -translate-x-1/2 -translate-y-1/2 pointer-events-none opacity-20" />

      {/* Header */}
      <DashboardHeader />

      {/* Dashboard */}
      <DashboardGrid />

      {/* Controls */}
      <Toolbar />
    </main>
  );
}
