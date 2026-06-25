import React, { useState } from "react";
import { LogIn, LogOut, Trophy, BookOpen, LayoutDashboard, Menu, X, Flame, Sparkles } from "lucide-react";

interface NavbarProps {
  user: any;
  activeTab: "home" | "catalog" | "leaderboard" | "dashboard";
  onTabChange: (tab: "home" | "catalog" | "leaderboard" | "dashboard") => void;
  onOpenAuth: () => void;
  onSignOut: () => void;
}

export default function Navbar({ user, activeTab, onTabChange, onOpenAuth, onSignOut }: NavbarProps) {
  const [menuOpen, setMenuOpen] = useState(false);

  const getActiveLinkStyle = (tab: string) => {
    return activeTab === tab
      ? "bg-blue-50 text-blue-600 font-extrabold px-4 py-2 rounded-xl border border-blue-100"
      : "text-slate-600 hover:text-slate-900 hover:bg-slate-50 font-bold px-4 py-2 rounded-xl transition";
  };

  const handleLinkClick = (tab: "home" | "catalog" | "leaderboard" | "dashboard") => {
    onTabChange(tab);
    setMenuOpen(false);
  };

  return (
    <header className="sticky top-0 z-40 bg-white/80 backdrop-blur-md border-b border-slate-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Brand Logo */}
        <button
          onClick={() => handleLinkClick("home")}
          className="flex items-center gap-2 text-left cursor-pointer focus:outline-none"
        >
          <span className="text-3xl">🇩🇪</span>
          <div>
            <h1 className="text-base font-black text-slate-800 tracking-tight leading-none font-sans">
              Deutsch học viên
            </h1>
            <span className="text-[10px] text-emerald-600 font-extrabold uppercase tracking-widest block mt-0.5">
              Gamified vocabulary
            </span>
          </div>
        </button>

        {/* Desktop Nav Items */}
        <nav className="hidden md:flex items-center gap-2">
          <button onClick={() => handleLinkClick("home")} className={getActiveLinkStyle("home")}>
            Trang chủ
          </button>
          <button onClick={() => handleLinkClick("catalog")} className={getActiveLinkStyle("catalog")}>
            Từ vựng theo chủ đề
          </button>
          <button onClick={() => handleLinkClick("leaderboard")} className={getActiveLinkStyle("leaderboard")}>
            Bảng xếp hạng
          </button>
          {user && (
            <button onClick={() => handleLinkClick("dashboard")} className={getActiveLinkStyle("dashboard")}>
              Bảng điều khiển
            </button>
          )}
        </nav>

        {/* User Stats & Profile Controls */}
        <div className="hidden md:flex items-center gap-4">
          {user && !user.isGuest ? (
            <div className="flex items-center gap-4">
              {/* Streak info */}
              <div
                className="flex items-center gap-1 bg-orange-50 border border-orange-100 text-orange-600 px-3 py-1 rounded-full text-xs font-black cursor-pointer hover:bg-orange-100/80 transition"
                onClick={() => handleLinkClick("dashboard")}
                title="Chuỗi học tập liên tiếp hằng ngày"
              >
                <Flame className="w-4 h-4 fill-orange-500 text-orange-500 animate-pulse" />
                <span>{user.streak || 1} Ngày</span>
              </div>

              {/* XP Info */}
              <div
                className="flex items-center gap-1 bg-amber-50 border border-amber-100 text-amber-700 px-3 py-1 rounded-full text-xs font-black cursor-pointer hover:bg-amber-100/80 transition"
                onClick={() => handleLinkClick("dashboard")}
                title="Tích lũy điểm kinh nghiệm"
              >
                <Sparkles className="w-4 h-4 text-amber-500 fill-amber-500" />
                <span>{(user.xp || 150).toLocaleString()} XP</span>
              </div>

              {/* User Avatar Menu */}
              <div className="flex items-center gap-2.5 pl-2 border-l border-slate-200">
                <button
                  onClick={() => handleLinkClick("dashboard")}
                  className="w-9 h-9 bg-slate-50 border border-slate-100 rounded-full text-xl flex items-center justify-center hover:shadow-sm transition"
                >
                  {user.avatar || "👤"}
                </button>
                <div className="text-left leading-none">
                  <h4 className="text-xs font-black text-slate-800 truncate max-w-28">
                    {user.displayName || "Học viên"}
                  </h4>
                  <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block mt-0.5">
                    Cấp độ {user.level || 1}
                  </span>
                </div>
                <button
                  onClick={onSignOut}
                  className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-full transition ml-1"
                  title="Đăng xuất"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            </div>
          ) : (
            <div className="flex items-center gap-4">
              {user && user.isGuest && user.xp > 0 && (
                <div
                  className="flex items-center gap-1 bg-amber-50 border border-amber-100 text-amber-700 px-3 py-1 rounded-full text-xs font-black cursor-pointer hover:bg-amber-100/80 transition"
                  onClick={() => handleLinkClick("dashboard")}
                  title="Tích lũy điểm kinh nghiệm (Chế độ khách)"
                >
                  <Sparkles className="w-4 h-4 text-amber-500 fill-amber-500" />
                  <span>{user.xp} XP</span>
                </div>
              )}
              <button
                onClick={onOpenAuth}
                className="bg-blue-500 hover:bg-blue-600 text-white font-extrabold px-5 py-2.5 rounded-xl text-sm transition shadow-md shadow-blue-100 flex items-center gap-2"
              >
                <LogIn className="w-4 h-4" />
                <span>Đăng nhập / Đăng ký</span>
              </button>
            </div>
          )}
        </div>

        {/* Mobile menu trigger */}
        <div className="flex items-center gap-2 md:hidden">
          {user && (
            <div
              className="flex items-center gap-0.5 bg-amber-50 border border-amber-200 text-amber-700 px-2.5 py-1 rounded-full text-xs font-bold"
              onClick={() => handleLinkClick("dashboard")}
            >
              <Sparkles className="w-3.5 h-3.5 text-amber-500 fill-amber-500" />
              <span>{(user.xp || 150).toLocaleString()} XP</span>
            </div>
          )}
          <button
            onClick={() => setMenuOpen(!menuOpen)}
            className="p-2 text-slate-600 hover:text-slate-900 rounded-xl hover:bg-slate-50 transition"
          >
            {menuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Navigation Drawer */}
      {menuOpen && (
        <div className="md:hidden border-t border-slate-100 bg-white px-4 py-4 space-y-2 animate-fade-in shadow-xl">
          <button
            onClick={() => handleLinkClick("home")}
            className={`w-full text-left p-3 rounded-xl font-bold ${
              activeTab === "home" ? "bg-blue-50 text-blue-600" : "text-slate-600"
            }`}
          >
            Trang chủ
          </button>
          <button
            onClick={() => handleLinkClick("catalog")}
            className={`w-full text-left p-3 rounded-xl font-bold ${
              activeTab === "catalog" ? "bg-blue-50 text-blue-600" : "text-slate-600"
            }`}
          >
            Từ vựng theo chủ đề
          </button>
          <button
            onClick={() => handleLinkClick("leaderboard")}
            className={`w-full text-left p-3 rounded-xl font-bold ${
              activeTab === "leaderboard" ? "bg-blue-50 text-blue-600" : "text-slate-600"
            }`}
          >
            Bảng xếp hạng
          </button>
          {user && (
            <button
              onClick={() => handleLinkClick("dashboard")}
              className={`w-full text-left p-3 rounded-xl font-bold ${
                activeTab === "dashboard" ? "bg-blue-50 text-blue-600" : "text-slate-600"
              }`}
            >
              Bảng điều khiển (Cá nhân)
            </button>
          )}

          <div className="border-t border-slate-100 pt-4 mt-2">
            {user && !user.isGuest ? (
              <div className="space-y-3">
                <div className="flex items-center gap-3 p-2">
                  <span className="text-3xl">{user.avatar || "👤"}</span>
                  <div>
                    <h4 className="font-extrabold text-slate-800 text-sm">{user.displayName}</h4>
                    <p className="text-xs text-slate-400">Cấp {user.level} • Chuỗi {user.streak || 1} Ngày</p>
                  </div>
                </div>
                <button
                  onClick={() => {
                    setMenuOpen(false);
                    onSignOut();
                  }}
                  className="w-full bg-rose-50 hover:bg-rose-100 text-rose-600 font-bold p-3 rounded-xl text-sm transition flex items-center justify-center gap-2"
                >
                  <LogOut className="w-4 h-4" />
                  <span>Đăng xuất tài khoản</span>
                </button>
              </div>
            ) : (
              <div className="space-y-3">
                {user && user.isGuest && (
                  <div className="p-3 bg-slate-50 rounded-2xl border border-slate-100 text-slate-600">
                    <p className="text-xs font-bold flex items-center gap-1">
                      <span>👤 Chế độ khách</span>
                    </p>
                    <p className="text-[10px] text-slate-400 mt-1 leading-relaxed">
                      Đăng nhập hoặc đăng ký để lưu thành tích, bảng xếp hạng và mở khóa huy hiệu độc quyền!
                    </p>
                  </div>
                )}
                <button
                  onClick={() => {
                    setMenuOpen(false);
                    onOpenAuth();
                  }}
                  className="w-full bg-blue-500 hover:bg-blue-600 text-white font-bold p-3 rounded-xl text-sm transition flex items-center justify-center gap-2"
                >
                  <LogIn className="w-4 h-4" />
                  <span>Đăng nhập / Đăng ký</span>
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </header>
  );
}
