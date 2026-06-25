import React, { useState } from "react";
import { topics, Topic, vocabularyData, Word } from "../data/vocabulary";
import { Sparkles, Gamepad2, Award, TrendingUp, CheckCircle, Flame, ArrowRight, Play, BookOpen, Layers } from "lucide-react";

interface LandingPageProps {
  user: any;
  onSelectTopicGame: (topicId: string, gameMode: "flashcard" | "matching" | "quiz" | "fill") => void;
  onOpenAuth: () => void;
  onTabChange: (tab: "home" | "catalog" | "leaderboard" | "dashboard") => void;
  topicsList?: Topic[];
  wordsList?: Word[];
  topicProgress?: Record<string, any>;
}

export default function LandingPage({
  user,
  onSelectTopicGame,
  onOpenAuth,
  onTabChange,
  topicsList,
  wordsList,
  topicProgress
}: LandingPageProps) {
  const activeTopics = topicsList || topics;
  const activeWords = wordsList || vocabularyData;

  const [selectedTopic, setSelectedTopic] = useState<Topic | null>(null);

  const handleTopicClick = (topic: Topic) => {
    setSelectedTopic(topic);
    // Smoothly scroll down to game selection area
    setTimeout(() => {
      document.getElementById("game-modes-section")?.scrollIntoView({ behavior: "smooth" });
    }, 100);
  };

  const launchGame = (mode: "flashcard" | "matching" | "quiz" | "fill") => {
    if (selectedTopic) {
      onSelectTopicGame(selectedTopic.id, mode);
    }
  };

  const getTopicVocabularyCount = (topicId: string) => {
    return activeWords.filter((w) => w.topicId === topicId).length;
  };

  const features = [
    {
      icon: <Layers className="w-6 h-6 text-blue-600" />,
      title: "Học từ vựng theo chủ đề",
      desc: "Kho dữ liệu phong phú bao quát từ giao tiếp gia đình, đi làm, đi ăn nhà hàng, mua sắm tới các giáo trình luyện thi chứng chỉ.",
      badge: "Hỗ trợ A1–B2"
    },
    {
      icon: <Gamepad2 className="w-6 h-6 text-emerald-600" />,
      title: "Trò chơi ôn tập lý thú",
      desc: "Vượt qua thử thách Flashcard, ghép cặp siêu tốc, điền từ chính tả và trắc nghiệm ghi nhớ thông minh giúp học mà không chán.",
      badge: "Trò chơi tương tác"
    },
    {
      icon: <TrendingUp className="w-6 h-6 text-amber-600" />,
      title: "Theo dõi tiến độ bài bản",
      desc: "Hệ thống ghi nhận chính xác số từ đã thuộc, ngày học liên tục (streak) và tỷ lệ chính xác của bạn giúp cải thiện phản xạ tiếng Đức.",
      badge: "Lưu tiến độ học tập"
    },
    {
      icon: <Award className="w-6 h-6 text-purple-600" />,
      title: "Thành tích & Tranh tài",
      desc: "So tài XP hàng tuần cùng hàng ngàn học viên xuất sắc, tích lũy huy hiệu cao quý và thăng cấp trình độ Đức ngữ vượt trội.",
      badge: "Bảng xếp hạng tuần"
    }
  ];

  return (
    <div id="landing-container" className="space-y-16 pb-16">
      {/* 1. Hero Section */}
      <section className="relative bg-slate-950 text-white py-20 px-4 sm:px-6 lg:px-8 overflow-hidden rounded-b-[40px] md:rounded-b-[64px] border-b border-slate-800 shadow-xl">
        {/* Abstract design blobs */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-amber-500/5 rounded-full blur-3xl"></div>

        <div className="max-w-5xl mx-auto text-center space-y-8 relative z-10">
          {/* Main Badge */}
          <div className="inline-flex items-center gap-2 bg-slate-900 border border-slate-800 px-4 py-1.5 rounded-full text-xs font-semibold text-blue-400">
            <span className="w-2 h-2 bg-blue-400 rounded-full animate-ping"></span>
            <span>Phương pháp Gamification hiện đại nhất Việt Nam 🇻🇳🇩🇪</span>
          </div>

          <div className="space-y-4">
            <h1 className="text-4xl sm:text-5xl md:text-6xl font-black tracking-tight leading-none font-sans">
              Chơi game – Nhớ từ vựng – <br className="hidden sm:inline" />
              <span className="bg-gradient-to-r from-blue-400 via-amber-400 to-emerald-400 bg-clip-text text-transparent">
                Nâng trình tiếng Đức
              </span>
            </h1>
            <p className="text-slate-400 text-base sm:text-lg md:text-xl max-w-2xl mx-auto leading-relaxed">
              Hệ thống học từ vựng tiếng Đức thông minh vượt bậc. Kết hợp giữa trò chơi tương tác, theo dõi tiến độ chính xác hằng ngày và so tài cùng bạn bè.
            </p>
          </div>

          {/* Action CTAs */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <button
              onClick={() => {
                document.getElementById("vocabulary-catalog-section")?.scrollIntoView({ behavior: "smooth" });
              }}
              className="w-full sm:w-auto bg-blue-500 hover:bg-blue-600 text-white font-extrabold px-8 py-4 rounded-2xl tracking-wide transition shadow-lg shadow-blue-500/20 text-base"
            >
              Bắt đầu học ngay
            </button>
            {!user && (
              <button
                onClick={onOpenAuth}
                className="w-full sm:w-auto bg-slate-900 hover:bg-slate-800 border border-slate-800 hover:border-slate-700 text-white font-bold px-8 py-4 rounded-2xl transition text-base"
              >
                Đăng ký miễn phí
              </button>
            )}
          </div>

          {/* Feature highlights */}
          <div className="pt-6 grid grid-cols-2 md:grid-cols-4 gap-4 max-w-4xl mx-auto border-t border-slate-900/80">
            <div className="text-center bg-slate-900/40 p-3 rounded-2xl border border-slate-900">
              <span className="text-2xl block mb-1">💾</span>
              <p className="text-xs font-semibold text-slate-300">Lưu tiến độ học tập</p>
            </div>
            <div className="text-center bg-slate-900/40 p-3 rounded-2xl border border-slate-900">
              <span className="text-2xl block mb-1">🎮</span>
              <p className="text-xs font-semibold text-slate-300">Trò chơi tương tác</p>
            </div>
            <div className="text-center bg-slate-900/40 p-3 rounded-2xl border border-slate-900">
              <span className="text-2xl block mb-1">🏆</span>
              <p className="text-xs font-semibold text-slate-300">Bảng xếp hạng tuần</p>
            </div>
            <div className="text-center bg-slate-900/40 p-3 rounded-2xl border border-slate-900">
              <span className="text-2xl block mb-1">🎓</span>
              <p className="text-xs font-semibold text-slate-300">Hỗ trợ từ A1 đến B2</p>
            </div>
          </div>
        </div>
      </section>

      {/* 2. Features Grid */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        <div className="text-center max-w-2xl mx-auto">
          <h2 className="text-3xl font-black text-slate-800 tracking-tight font-sans">
            Học hiệu quả bằng phương pháp Game hóa
          </h2>
          <p className="text-slate-500 mt-2">
            Không còn những bảng từ vựng tẻ nhạt. Deutsch Học Viên biến mỗi ngày học từ mới thành một thử thách ghi nhớ hào hứng!
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {features.map((feat, idx) => (
            <div
              key={idx}
              className="bg-white border border-slate-100 rounded-3xl p-6 shadow-sm hover:shadow-md transition duration-300 space-y-4"
            >
              <div className="w-12 h-12 bg-slate-50 rounded-2xl flex items-center justify-center shrink-0">
                {feat.icon}
              </div>
              <div className="space-y-1">
                <span className="text-[10px] bg-slate-100 text-slate-500 font-extrabold uppercase tracking-wider px-2 py-0.5 rounded-full">
                  {feat.badge}
                </span>
                <h3 className="text-lg font-bold text-slate-800 font-sans mt-2">{feat.title}</h3>
                <p className="text-slate-500 text-sm leading-relaxed">{feat.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* 3. Selected Topic Play Arena & Game Modes */}
      {selectedTopic && (
        <section
          id="game-modes-section"
          className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 scroll-mt-24"
        >
          <div className="bg-gradient-to-r from-slate-900 to-slate-800 text-white rounded-[32px] p-8 shadow-xl border border-slate-800 space-y-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 pb-6 border-b border-slate-800">
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-4xl">{selectedTopic.image}</span>
                  <div>
                    <span className="text-[10px] bg-blue-500 text-white font-black px-2 py-0.5 rounded uppercase tracking-wider">
                      Cấp độ {selectedTopic.level}
                    </span>
                    <h3 className="text-2xl font-black font-sans mt-1">
                      Chủ đề: {selectedTopic.name} ({selectedTopic.nameDe})
                    </h3>
                  </div>
                </div>
                <p className="text-slate-400 text-sm mt-1.5 max-w-lg leading-relaxed">
                  {selectedTopic.description}
                </p>
              </div>
              <span className="bg-slate-800 border border-slate-700 text-slate-300 px-4 py-1.5 rounded-2xl text-xs font-bold shrink-0">
                {getTopicVocabularyCount(selectedTopic.id)} từ vựng sẵn sàng
              </span>
            </div>

            <div className="space-y-4">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">
                Hãy lựa chọn 1 đấu trường trò chơi ôn tập:
              </h4>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Mode 1 */}
                <button
                  onClick={() => launchGame("flashcard")}
                  className="bg-slate-800/80 hover:bg-slate-800 border border-slate-700/50 hover:border-blue-500 p-5 rounded-2xl text-left transition duration-200 group flex items-start justify-between"
                >
                  <div className="space-y-1 pr-4">
                    <h5 className="font-bold text-base text-white flex items-center gap-2">
                      <span>🎴 Flashcard Lật Nghĩa</span>
                    </h5>
                    <p className="text-xs text-slate-400">Xem từ vựng tiếng Đức, đoán nghĩa tiếng Việt và chấm điểm trí nhớ.</p>
                  </div>
                  <Play className="w-5 h-5 text-slate-500 group-hover:text-blue-400 shrink-0 mt-1 transition" />
                </button>

                {/* Mode 2 */}
                <button
                  onClick={() => launchGame("matching")}
                  className="bg-slate-800/80 hover:bg-slate-800 border border-slate-700/50 hover:border-emerald-500 p-5 rounded-2xl text-left transition duration-200 group flex items-start justify-between"
                >
                  <div className="space-y-1 pr-4">
                    <h5 className="font-bold text-base text-white flex items-center gap-2">
                      <span>⚡ Ghép Cặp Siêu Tốc</span>
                    </h5>
                    <p className="text-xs text-slate-400">So khớp từ tiếng Đức và tiếng Việt tương ứng thật nhanh để nhận Speed-XP.</p>
                  </div>
                  <Play className="w-5 h-5 text-slate-500 group-hover:text-emerald-400 shrink-0 mt-1 transition" />
                </button>

                {/* Mode 3 */}
                <button
                  onClick={() => launchGame("quiz")}
                  className="bg-slate-800/80 hover:bg-slate-800 border border-slate-700/50 hover:border-amber-500 p-5 rounded-2xl text-left transition duration-200 group flex items-start justify-between"
                >
                  <div className="space-y-1 pr-4">
                    <h5 className="font-bold text-base text-white flex items-center gap-2">
                      <span>📝 Trắc Nghiệm Chọn Từ</span>
                    </h5>
                    <p className="text-xs text-slate-400">Luyện tập chọn nghĩa chuẩn nhất trong 4 đáp án cho sẵn.</p>
                  </div>
                  <Play className="w-5 h-5 text-slate-500 group-hover:text-amber-400 shrink-0 mt-1 transition" />
                </button>

                {/* Mode 4 */}
                <button
                  onClick={() => launchGame("fill")}
                  className="bg-slate-800/80 hover:bg-slate-800 border border-slate-700/50 hover:border-purple-500 p-5 rounded-2xl text-left transition duration-200 group flex items-start justify-between"
                >
                  <div className="space-y-1 pr-4">
                    <h5 className="font-bold text-base text-white flex items-center gap-2">
                      <span>✍️ Điền Từ Chính Tả</span>
                    </h5>
                    <p className="text-xs text-slate-400">Thử thách nhập chữ từ bàn phím theo ngữ cảnh để luyện kỹ năng viết.</p>
                  </div>
                  <Play className="w-5 h-5 text-slate-500 group-hover:text-purple-400 shrink-0 mt-1 transition" />
                </button>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* 4. Vocabulary Catalog Topics */}
      <section id="vocabulary-catalog-section" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        <div className="text-center max-w-2xl mx-auto">
          <h2 className="text-3xl font-black text-slate-800 tracking-tight font-sans">
            Thư viện chủ đề Từ vựng
          </h2>
          <p className="text-slate-500 mt-2">
            Chọn một chủ đề bất kỳ dưới đây để bắt đầu ngay trận chiến rèn luyện từ vựng tiếng Đức.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {activeTopics.map((topic) => {
            const count = getTopicVocabularyCount(topic.id);
            const isSelected = selectedTopic?.id === topic.id;

            const progress = topicProgress?.[topic.id];
            const learnedWordsCount = progress?.learnedWordsCount || 0;
            const progressPercentage = Math.min(100, Math.round((learnedWordsCount / (count || 1)) * 100));
            const isCompleted = progress?.completed || progressPercentage >= 100;

            return (
              <div
                key={topic.id}
                className={`bg-white border-2 rounded-3xl p-6 transition duration-300 flex flex-col justify-between group ${
                  isSelected
                    ? "border-blue-500 shadow-md ring-4 ring-blue-500/10"
                    : "border-slate-100 hover:border-slate-200 shadow-sm hover:shadow"
                }`}
              >
                <div>
                  {/* Topic badge and icon */}
                  <div className="flex justify-between items-start mb-4">
                    <span className="text-4xl bg-slate-50 w-14 h-14 rounded-2xl flex items-center justify-center border border-slate-100 group-hover:scale-110 duration-200 transition">
                      {topic.image}
                    </span>
                    <span className="bg-slate-100 text-slate-600 px-2.5 py-1 rounded-lg text-xs font-bold uppercase tracking-wider">
                      {topic.level}
                    </span>
                  </div>

                  {/* Title */}
                  <div className="space-y-1 mb-3">
                    <h3 className="text-lg font-black text-slate-800 font-sans group-hover:text-blue-600 transition">
                      {topic.name}
                    </h3>
                    <p className="text-xs font-mono text-slate-400 italic">
                      ({topic.nameDe})
                    </p>
                  </div>

                  <p className="text-xs text-slate-400 line-clamp-2 leading-relaxed mb-4">
                    {topic.description}
                  </p>

                  {/* Progress bar */}
                  {progress && learnedWordsCount > 0 && (
                    <div className="mt-3 pt-3 border-t border-slate-50 space-y-1.5">
                      <div className="flex justify-between items-center text-[10px] font-bold">
                        <span className="text-slate-400">Tiến trình:</span>
                        <span className={isCompleted ? "text-emerald-600" : "text-blue-600"}>
                          {progressPercentage}% ({learnedWordsCount}/{count})
                        </span>
                      </div>
                      <div className="w-full bg-slate-100 rounded-full h-1.5 overflow-hidden">
                        <div
                          className={`h-full transition-all duration-300 ${
                            isCompleted ? "bg-emerald-500" : "bg-blue-500"
                          }`}
                          style={{ width: `${progressPercentage}%` }}
                        ></div>
                      </div>
                      {isCompleted && (
                        <div className="flex items-center gap-1 text-[10px] text-emerald-600 font-black mt-1">
                          <CheckCircle className="w-3.5 h-3.5 text-emerald-500 fill-emerald-100" />
                          <span>Đã thuộc chủ đề!</span>
                        </div>
                      )}
                    </div>
                  )}
                </div>

                <div className="space-y-4 pt-4 border-t border-slate-50">
                  <div className="flex justify-between items-center text-xs font-bold text-slate-500">
                    <span className="flex items-center gap-1">
                      <BookOpen className="w-3.5 h-3.5" />
                      <span>{count} Từ vựng</span>
                    </span>
                    <span className="text-slate-400">Độ khó: {topic.level}</span>
                  </div>

                  <button
                    onClick={() => handleTopicClick(topic)}
                    className={`w-full py-3 rounded-xl font-bold text-xs tracking-wide transition flex items-center justify-center gap-1.5 ${
                      isSelected
                        ? "bg-slate-900 text-white"
                        : "bg-blue-50 hover:bg-blue-100 text-blue-600"
                    }`}
                  >
                    <span>{isSelected ? "Đang chọn chủ đề" : "Bắt đầu học"}</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </section>
    </div>
  );
}
