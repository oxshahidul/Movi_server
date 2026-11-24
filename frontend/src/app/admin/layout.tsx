import type { Metadata } from "next";
import { AdminThemeProvider } from "../../context/AdminThemeContext";

export const metadata: Metadata = {
  title: "NexFlix PRO — Admin Control Hub",
  description: "Enterprise streaming management, live IPTV orchestration, and VOD catalog control.",
};

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <AdminThemeProvider>
      <div className="h-screen overflow-hidden antialiased font-sans selection:bg-red-500 selection:text-white transition-colors duration-300">
        {children}
      </div>
    </AdminThemeProvider>
  );
}
