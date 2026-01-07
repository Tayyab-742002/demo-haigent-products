import Sidebar from "@/components/layout/Sidebar";
import Header from "@/components/layout/Header";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-background">
      {/* Sidebar */}
      <Sidebar />

      {/* Main Content - responsive padding */}
      <div className="lg:pl-72 transition-all duration-300">
        {/* Header */}
        <Header />

        {/* Page Content */}
        <main className="p-4 sm:p-6 lg:p-8 pt-20 lg:pt-6">{children}</main>
      </div>
    </div>
  );
}
