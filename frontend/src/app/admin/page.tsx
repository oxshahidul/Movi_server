"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Loader2, ShieldAlert } from "lucide-react";
import { fetchApi } from "../../lib/api";
import { useAuthStore } from "../../store/useAuthStore";

import AdminTopNav from "../../components/admin/AdminTopNav";
import AdminSidebar from "../../components/admin/AdminSidebar";
import MissionControlBanner from "../../components/admin/MissionControlBanner";
import AdminStatCards from "../../components/admin/AdminStatCards";
import AdminCharts from "../../components/admin/AdminCharts";
import AdminDualTable, { ChannelItem, MovieItem } from "../../components/admin/AdminDualTable";
import { NewMovieModal, NewChannelModal } from "../../components/admin/AdminModals";
import { useAdminTheme } from "../../context/AdminThemeContext";

interface AdminMetricsData {
  liveTv: {
    total: number;
    active: number;
    servers: number;
    uptimePercent: number;
    categoriesCount: number;
  };
  movies: {
    total: number;
    published: number;
    featuredCount: number;
  };
  series: {
    total: number;
    episodesTotal: number;
  };
  categories: {
    total: number;
    subLabel: string;
  };
  views: {
    total: number;
    formatted: string;
    subLabel: string;
  };
  users: {
    total: number;
    subLabel: string;
  };
  sidebarBadges: {
    channels: number;
    movies: number;
    series: number;
    plans: number;
    adPlacements: number;
    categories: number;
    blogPosts: number;
    faqs: number;
    settings: number;
    users: number;
  };
  mediaDistribution: {
    name: string;
    count: number;
    color: string;
  }[];
  streamTraffic: {
    day: string;
    traffic: number;
    label: string;
  }[];
}

interface ChannelsResponse {
  channels: ChannelItem[];
  total: number;
  page: number;
  totalPages: number;
}

interface MoviesResponse {
  movies: MovieItem[];
  total: number;
  page: number;
  totalPages: number;
}

export default function AdminDashboardPage() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const { user, isLoading: authLoading, checkAuth } = useAuthStore();
  const { isDark } = useAdminTheme();

  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [activeSection, setActiveSection] = useState("dashboard");

  // Modals state
  const [isNewMovieModalOpen, setIsNewMovieModalOpen] = useState(false);
  const [isNewChannelModalOpen, setIsNewChannelModalOpen] = useState(false);

  // Channels state
  const [channelSearch, setChannelSearch] = useState("");
  const [channelPage, setChannelPage] = useState(1);

  // Movies state
  const [movieSearch, setMovieSearch] = useState("");
  const [moviePage, setMoviePage] = useState(1);

  // Check authentication on mount
  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  // Auth gate
  const isAdmin =
    user && (user.role === "SUPER_ADMIN" || user.role === "ADMIN" || user.role === "CONTENT_MANAGER");

  useEffect(() => {
    if (!authLoading && !isAdmin) {
      router.push("/admin/login");
    }
  }, [authLoading, isAdmin, router]);

  // 1. Fetch Dashboard Metrics
  const { data: metricsData } = useQuery({
    queryKey: ["admin-dashboard-metrics"],
    queryFn: async () => {
      const res = await fetchApi<AdminMetricsData>("/admin/dashboard-metrics");
      return res.data;
    },
    enabled: !!isAdmin,
    refetchInterval: 30000,
  });

  // 2. Fetch Live Channels for Dual Table
  const { data: channelsData, isLoading: channelsLoading } = useQuery({
    queryKey: ["admin-live-channels", channelSearch, channelPage],
    queryFn: async () => {
      const params = new URLSearchParams({
        page: channelPage.toString(),
        limit: "8",
      });
      if (channelSearch.trim()) {
        params.append("search", channelSearch.trim());
      }
      const res = await fetchApi<ChannelsResponse>(`/admin/live-tv?${params.toString()}`);
      return res.data;
    },
    enabled: !!isAdmin,
  });

  // 3. Fetch Movies for Dual Table
  const { data: moviesData, isLoading: moviesLoading } = useQuery({
    queryKey: ["admin-movies-table", movieSearch, moviePage],
    queryFn: async () => {
      const params = new URLSearchParams({
        page: moviePage.toString(),
        limit: "8",
      });
      if (movieSearch.trim()) {
        params.append("search", movieSearch.trim());
      }
      const res = await fetchApi<MoviesResponse>(`/admin/movies?${params.toString()}`);
      return res.data;
    },
    enabled: !!isAdmin,
  });

  // Toggle Live Channel Status
  const toggleChannelMutation = useMutation({
    mutationFn: async (id: string) => {
      return await fetchApi(`/admin/live-tv/${id}/toggle`, { method: "PATCH" });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-live-channels"] });
      queryClient.invalidateQueries({ queryKey: ["admin-dashboard-metrics"] });
    },
  });

  // Toggle Movie Published Status
  const toggleMovieMutation = useMutation({
    mutationFn: async (id: string) => {
      return await fetchApi(`/admin/movies/${id}/toggle`, { method: "PATCH" });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-movies-table"] });
      queryClient.invalidateQueries({ queryKey: ["admin-dashboard-metrics"] });
    },
  });

  if (authLoading) {
    return (
      <div
        className={`min-h-screen flex flex-col items-center justify-center transition-colors duration-300 ${
          isDark ? "bg-[#0b0f17] text-slate-300" : "bg-[#f8fafc] text-gray-500"
        }`}
      >
        <Loader2 className="w-8 h-8 animate-spin text-[#f40638] mb-3" />
        <p className="text-xs font-semibold">Authenticating NexFlix Admin...</p>
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div
        className={`min-h-screen flex flex-col items-center justify-center p-4 transition-colors duration-300 ${
          isDark ? "bg-[#0b0f17] text-slate-100" : "bg-[#f8fafc] text-gray-900"
        }`}
      >
        <div
          className={`p-8 rounded-2xl border max-w-sm text-center shadow-lg transition-colors ${
            isDark
              ? "bg-[#0f141c] border-slate-800 text-white shadow-black/40"
              : "bg-white border-gray-100 text-gray-900 shadow-sm"
          }`}
        >
          <ShieldAlert className="w-10 h-10 text-red-500 mx-auto mb-3" />
          <h2 className="text-base font-bold mb-1">Access Restricted</h2>
          <p className="text-xs text-slate-400 mb-4">Please log in with administrator credentials.</p>
          <button
            onClick={() => router.push("/admin/login")}
            className="w-full py-2.5 px-4 bg-[#f40638] hover:bg-[#dc0532] text-white text-xs font-bold rounded-xl shadow-sm transition-all"
          >
            Go to Admin Login
          </button>
        </div>
      </div>
    );
  }

  return (
    <div
      className={`h-screen flex flex-col overflow-hidden transition-colors duration-300 ${
        isDark ? "bg-[#0b0f17] text-slate-100" : "bg-[#f8fafc] text-gray-900"
      }`}
    >
      {/* Top Navigation */}
      <AdminTopNav
        sidebarOpen={sidebarOpen}
        onToggleSidebar={() => setSidebarOpen(!sidebarOpen)}
      />

      <div className="flex-1 flex overflow-hidden">
        {/* Left Sidebar */}
        <AdminSidebar
          isOpen={sidebarOpen}
          activeSection={activeSection}
          onSelectSection={(sec) => {
            setActiveSection(sec);
            if (sec === "dashboard") {
              const el = document.getElementById("admin-main-canvas");
              el?.scrollTo({ top: 0, behavior: "smooth" });
            } else if (sec === "channels") {
              const el = document.getElementById("dual-tables");
              el?.scrollIntoView({ behavior: "smooth" });
            } else if (sec === "movies") {
              const el = document.getElementById("dual-tables");
              el?.scrollIntoView({ behavior: "smooth" });
            }
          }}
          badges={metricsData?.sidebarBadges}
        />

        {/* Main Content Scrollable Canvas */}
        <main
          id="admin-main-canvas"
          className="flex-1 overflow-y-auto px-4 sm:px-6 pt-2 sm:pt-3 pb-6 space-y-4"
        >
          {/* 1. Mission Control Banner */}
          <MissionControlBanner
            onOpenNewMovie={() => setIsNewMovieModalOpen(true)}
            onOpenNewChannel={() => setIsNewChannelModalOpen(true)}
            onSelectTool={(toolId) => {
              if (toolId === "movies" || toolId === "channels") {
                document.getElementById("dual-tables")?.scrollIntoView({ behavior: "smooth" });
              }
            }}
          />

          {/* 2. 6 KPI Metric Cards */}
          <AdminStatCards metrics={metricsData} />

          {/* 3. Analytical Charts (Media Library Distribution & Stream Traffic) */}
          <AdminCharts
            distribution={metricsData?.mediaDistribution}
            traffic={metricsData?.streamTraffic}
          />

          {/* 4. Side-by-Side Dual Management Tables */}
          <div id="dual-tables" className="pt-2">
            <AdminDualTable
              channels={channelsData?.channels || []}
              movies={moviesData?.movies || []}
              channelsLoading={channelsLoading}
              moviesLoading={moviesLoading}
              channelSearch={channelSearch}
              movieSearch={movieSearch}
              onChannelSearchChange={(val) => {
                setChannelSearch(val);
                setChannelPage(1);
              }}
              onMovieSearchChange={(val) => {
                setMovieSearch(val);
                setMoviePage(1);
              }}
              onToggleChannel={async (id) => {
                await toggleChannelMutation.mutateAsync(id);
              }}
              onToggleMovie={async (id) => {
                await toggleMovieMutation.mutateAsync(id);
              }}
              channelPage={channelsData?.page || 1}
              channelTotalPages={channelsData?.totalPages || 1}
              onChannelPageChange={(p) => setChannelPage(p)}
              moviePage={moviesData?.page || 1}
              movieTotalPages={moviesData?.totalPages || 1}
              onMoviePageChange={(p) => setMoviePage(p)}
            />
          </div>
        </main>
      </div>

      {/* New Movie Modal */}
      <NewMovieModal
        isOpen={isNewMovieModalOpen}
        onClose={() => setIsNewMovieModalOpen(false)}
        onSuccess={() => {
          queryClient.invalidateQueries({ queryKey: ["admin-movies-table"] });
          queryClient.invalidateQueries({ queryKey: ["admin-dashboard-metrics"] });
        }}
      />

      {/* New Channel Modal */}
      <NewChannelModal
        isOpen={isNewChannelModalOpen}
        onClose={() => setIsNewChannelModalOpen(false)}
        onSuccess={() => {
          queryClient.invalidateQueries({ queryKey: ["admin-live-channels"] });
          queryClient.invalidateQueries({ queryKey: ["admin-dashboard-metrics"] });
        }}
      />
    </div>
  );
}
