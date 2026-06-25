import React, { useState, useEffect } from "react";
import { mockLeaderboard, LeaderboardUser } from "../data/vocabulary";
import { Trophy, Calendar, Medal, Award, Flame, Search } from "lucide-react";
import { collection, query, orderBy, limit, getDocs } from "firebase/firestore";
import { db, OperationType, handleFirestoreError } from "../firebase";

export default function Leaderboard() {
  const [filter, setFilter] = useState<"week" | "month" | "all">("week");
  const [users, setUsers] = useState<LeaderboardUser[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchLeaderboard();
  }, [filter]);

  const fetchLeaderboard = async () => {
    setLoading(true);
    try {
      // Fetch high scores from Firestore
      const usersRef = collection(db, "users");
      const q = query(usersRef, orderBy("xp", "desc"), limit(20));
      const querySnapshot = await getDocs(q);

      const dbUsers: LeaderboardUser[] = [];
      querySnapshot.forEach((doc) => {
        const data = doc.data();
        dbUsers.push({
          id: doc.id,
          avatar: data.avatar || "👤",
          name: data.displayName || data.name || "Học viên ẩn danh",
          xp: data.xp || 0,
          wordsLearned: data.wordsLearnedCount || data.wordsLearned || 0,
          streak: data.streak || 0,
          level: data.level || 1,
        });
      });

      // Sort by XP descending
      dbUsers.sort((a, b) => b.xp - a.xp);
      setUsers(dbUsers);
    } catch (error) {
      console.warn("Lỗi tải bảng xếp hạng:", error);
      setUsers([]);
    } finally {
      setLoading(false);
    }
  };

  const filteredUsers = users.filter((u) =>
    u.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const top3 = filteredUsers.slice(0, 3);
  const remaining = filteredUsers.slice(3);

  return (
    <div id="leaderboard-page" className="max-w-4xl mx-auto py-8 px-4">
      {/* Intro */}
      <div className="text-center mb-8">
        <div className="inline-flex p-3 bg-amber-50 border border-amber-200 rounded-2xl text-amber-600 mb-3">
          <Trophy className="w-8 h-8 fill-amber-100" />
        </div>
        <h1 className="text-3xl font-black text-slate-800 tracking-tight font-sans">Bảng Xếp Hạng Cao Thủ</h1>
        <p className="text-slate-500 mt-1 max-w-md mx-auto">
          Học tập bền bỉ, tích lũy XP hằng ngày và so tài cùng cộng đồng học viên khắp Việt Nam.
        </p>
      </div>

      {/* Controls & Search */}
      <div className="flex flex-col md:flex-row gap-4 justify-between items-center mb-8 bg-white p-4 rounded-2xl border border-slate-100 shadow-sm">
        {/* Filters */}
        <div className="flex bg-slate-100 p-1 rounded-xl w-full md:w-auto">
          <button
            onClick={() => setFilter("week")}
            className={`flex-1 md:flex-none px-5 py-2 rounded-lg text-sm font-bold transition ${
              filter === "week"
                ? "bg-white text-blue-600 shadow-sm"
                : "text-slate-500 hover:text-slate-800"
            }`}
          >
            Tuần này
          </button>
          <button
            onClick={() => setFilter("month")}
            className={`flex-1 md:flex-none px-5 py-2 rounded-lg text-sm font-bold transition ${
              filter === "month"
                ? "bg-white text-blue-600 shadow-sm"
                : "text-slate-500 hover:text-slate-800"
            }`}
          >
            Tháng này
          </button>
          <button
            onClick={() => setFilter("all")}
            className={`flex-1 md:flex-none px-5 py-2 rounded-lg text-sm font-bold transition ${
              filter === "all"
                ? "bg-white text-blue-600 shadow-sm"
                : "text-slate-500 hover:text-slate-800"
            }`}
          >
            Tất cả thời gian
          </button>
        </div>

        {/* Search Input */}
        <div className="relative w-full md:w-72">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
          <input
            type="text"
            placeholder="Tìm kiếm đối thủ..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-blue-500 bg-slate-50/50"
          />
        </div>
      </div>

      {loading ? (
        <div className="text-center py-12">
          <div className="w-10 h-10 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-slate-500">Đang đồng bộ thứ hạng hằng tuần...</p>
        </div>
      ) : (
        <div className="space-y-8">
          {/* Top 3 Podium Cards */}
          {top3.length > 0 && (
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 items-end max-w-3xl mx-auto py-4">
              {/* Rank 2 */}
              {top3[1] && (
                <div className="bg-white border border-slate-200 rounded-3xl p-6 text-center shadow-sm relative order-2 sm:order-1 sm:h-[220px] flex flex-col justify-between">
                  <div className="absolute -top-5 left-1/2 -translate-x-1/2 w-10 h-10 bg-slate-100 rounded-full flex items-center justify-center border-2 border-slate-200">
                    <Medal className="w-5 h-5 text-slate-400" />
                  </div>
                  <div className="mt-2">
                    <span className="text-4xl block mb-2">{top3[1].avatar}</span>
                    <h3 className="font-bold text-slate-800 text-sm truncate">{top3[1].name}</h3>
                    <span className="text-xs font-semibold text-slate-400 block mt-0.5">Cấp độ {top3[1].level}</span>
                  </div>
                  <div className="bg-slate-50 rounded-xl py-2 mt-4">
                    <span className="text-lg font-black text-slate-700 block">{top3[1].xp.toLocaleString()} XP</span>
                    <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">Hạng 2</span>
                  </div>
                </div>
              )}

              {/* Rank 1 (Tallest Center) */}
              {top3[0] && (
                <div className="bg-gradient-to-b from-amber-50 to-white border-2 border-amber-300 rounded-3xl p-6 text-center shadow-md relative order-1 sm:order-2 sm:h-[260px] flex flex-col justify-between scale-105">
                  <div className="absolute -top-6 left-1/2 -translate-x-1/2 w-12 h-12 bg-amber-400 rounded-full flex items-center justify-center border-4 border-white shadow-md">
                    <Trophy className="w-5 h-5 text-white fill-white animate-bounce" />
                  </div>
                  <div className="mt-4">
                    <span className="text-5xl block mb-2">{top3[0].avatar}</span>
                    <h3 className="font-black text-slate-800 text-base truncate">{top3[0].name}</h3>
                    <span className="text-xs font-bold text-amber-600 block mt-0.5">Cấp độ {top3[0].level}</span>
                  </div>
                  <div className="bg-amber-100/50 border border-amber-200/50 rounded-xl py-2.5 mt-4">
                    <span className="text-xl font-black text-amber-700 block">{top3[0].xp.toLocaleString()} XP</span>
                    <span className="text-[10px] text-amber-600 font-black uppercase tracking-wider block">Quán Quân</span>
                  </div>
                </div>
              )}

              {/* Rank 3 */}
              {top3[2] && (
                <div className="bg-white border border-slate-200 rounded-3xl p-6 text-center shadow-sm relative order-3 sm:h-[200px] flex flex-col justify-between">
                  <div className="absolute -top-5 left-1/2 -translate-x-1/2 w-10 h-10 bg-orange-50 rounded-full flex items-center justify-center border-2 border-orange-200">
                    <Award className="w-5 h-5 text-orange-500" />
                  </div>
                  <div className="mt-2">
                    <span className="text-4xl block mb-2">{top3[2].avatar}</span>
                    <h3 className="font-bold text-slate-800 text-sm truncate">{top3[2].name}</h3>
                    <span className="text-xs font-semibold text-slate-400 block mt-0.5">Cấp độ {top3[2].level}</span>
                  </div>
                  <div className="bg-orange-50/50 rounded-xl py-2 mt-4">
                    <span className="text-lg font-black text-orange-700 block">{top3[2].xp.toLocaleString()} XP</span>
                    <span className="text-[10px] text-orange-400 font-bold uppercase tracking-wider block">Hạng 3</span>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Remaining Competitors List */}
          <div className="bg-white border border-slate-100 rounded-2xl shadow-sm overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-100 bg-slate-50/50 flex justify-between text-xs font-bold text-slate-400 uppercase tracking-wider">
              <span>Xếp hạng học viên</span>
              <span>Điểm số tích lũy</span>
            </div>

            <div className="divide-y divide-slate-100">
              {remaining.map((user, index) => {
                const globalRank = index + 4;
                return (
                  <div
                    key={user.id}
                    className="px-6 py-4 flex items-center justify-between hover:bg-slate-50/50 transition"
                  >
                    <div className="flex items-center gap-4 min-w-0">
                      <span className="w-6 text-center text-sm font-bold text-slate-400">
                        {globalRank}
                      </span>
                      <span className="text-2xl w-10 h-10 bg-slate-50 rounded-full flex items-center justify-center shrink-0">
                        {user.avatar}
                      </span>
                      <div className="min-w-0">
                        <h4 className="font-bold text-slate-800 text-sm truncate flex items-center gap-1.5">
                          <span>{user.name}</span>
                          {user.streak >= 10 && (
                            <span className="bg-orange-50 border border-orange-100 text-orange-600 px-1.5 py-0.5 rounded text-[10px] font-bold flex items-center gap-0.5">
                              <Flame className="w-3 h-3 fill-orange-500 text-orange-500" />
                              <span>{user.streak}</span>
                            </span>
                          )}
                        </h4>
                        <p className="text-xs text-slate-400 font-medium">
                          Cấp {user.level} • Đã thuộc {user.wordsLearned} từ vựng
                        </p>
                      </div>
                    </div>

                    <div className="text-right">
                      <span className="font-black text-slate-800 text-sm">
                        {user.xp.toLocaleString()}
                      </span>
                      <span className="text-[10px] text-slate-400 font-bold block">XP</span>
                    </div>
                  </div>
                );
              })}

              {filteredUsers.length === 0 && (
                <div className="py-12 text-center text-slate-400">
                  <p className="font-semibold">Không tìm thấy kết quả phù hợp</p>
                  <p className="text-xs mt-1">Hãy thử gõ tên học viên khác</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
