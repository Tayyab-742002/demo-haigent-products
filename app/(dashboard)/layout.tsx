import Sidebar from "@/components/layout/Sidebar";
import Header from "@/components/layout/Header";
import { SidebarProvider } from "@/hooks/use-sidebar";
import { DashboardContent } from "@/components/layout/DashboardContent";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <SidebarProvider>
      <div className="min-h-screen bg-background">
        {/* Sidebar */}
        <Sidebar />

        {/* Main Content - responsive padding */}
        <DashboardContent>
          {/* Header */}
          <Header />

          {/* Page Content */}
          <main className="p-4 sm:p-6 lg:p-8 pt-20 lg:pt-6">{children}</main>
        </DashboardContent>
      </div>
    </SidebarProvider>
  );
}
