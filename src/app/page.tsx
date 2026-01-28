import { DashboardHeader } from "@/components/dashboard/DashboardHeader";
import { DashboardGrid } from "@/components/dashboard/DashboardGrid";
import { Toolbar } from "@/components/dashboard/Toolbar";

export default function Home() {
  return (
    <main className="min-h-screen bg-background relative overflow-hidden transition-colors duration-500">
      {/* Background Decor Removed for Clean Look */}

      {/* Header */}
      <DashboardHeader />

      {/* Dashboard */}
      <DashboardGrid />

      {/* Controls */}
      <Toolbar />
    </main>
  );
}
