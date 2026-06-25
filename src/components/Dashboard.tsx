import React, { useState } from "react";
import { Flame, Sparkles, BookOpen, Target, Clock, Award, CheckCircle2, ChevronRight, BarChart2, ChevronDown, Plus, Info, ShieldAlert, Database, Trash2 } from "lucide-react";

interface DashboardProps {
  user: any;
  onNavigateToCatalog: () => void;
  topicsList?: any[];
  wordsList?: any[];
  topicProgress?: Record<string, any>;
  dailyActivity?: Record<string, { words: number; xp: number }>;
  onAddWord?: (word: any) => Promise<boolean>;
  onAddTopic?: (topic: any) => Promise<boolean>;
  onDeleteWord?: (wordId: string) => Promise<boolean>;
  onDeleteWordsByTopic?: (topicId: string) => Promise<{ success: boolean; count: number }>;
  onUpdateUser?: (updatedFields: Partial<any>) => Promise<void>;
}

const AVAILABLE_MASCOTS = [
  { emoji: "🦊", name: "Cáo lém lỉnh", desc: "Đại diện cho sự thông minh, nhạy bén và khéo léo trong học tập." },
  { emoji: "🐼", name: "Gấu trúc thông thái", desc: "Điềm tĩnh, kiên trì, tích lũy kiến thức qua từng ngày." },
  { emoji: "🦁", name: "Sư tử dũng cảm", desc: "Không ngại thử thách khó, chinh phục mọi cấp độ ngữ pháp!" },
  { emoji: "🐰", name: "Thỏ nhanh nhẹn", desc: "Học nhanh nhớ lâu, luôn bứt phá trong các trò chơi tốc độ." },
  { emoji: "🦉", name: "Cú mèo uyên bác", desc: "Chăm chỉ ôn luyện đêm khuya, thông thái học rộng hiểu sâu." },
  { emoji: "🐧", name: "Cánh cụt bền bỉ", desc: "Dù hành trình vạn dặm cũng không nản lòng thoái chí." },
  { emoji: "🐨", name: "Koala đáng yêu", desc: "Tập trung cao độ, học từ vựng một cách nhẹ nhàng, bình yên." },
  { emoji: "🦄", name: "Kỳ lân mơ mộng", desc: "Đầy sáng tạo và năng lượng tích cực trên hành trình ngoại ngữ." },
  { emoji: "🐸", name: "Ếch xanh vui nhộn", desc: "Luôn vui vẻ, biến mỗi bài học thành một chuyến phiêu lưu." },
  { emoji: "🐙", name: "Bạch tuộc đa tài", desc: "Học từ vựng đa lĩnh vực, cân mọi chủ đề giao tiếp." },
  { emoji: "🦕", name: "Khủng long bạo chúa", desc: "Sức mạnh phi thường, quyết tâm quét sạch mọi bộ từ vựng!" },
  { emoji: "🐝", name: "Ong mật chăm chỉ", desc: "Cần cù nhặt nhạnh từng từ mới, xây dựng kho tàng tri thức." }
];

interface Badge {
  id: string;
  name: string;
  desc: string;
  emoji: string;
  unlocked: boolean;
  color: string;
}

function getCurrentWeekDates() {
  const current = new Date();
  const dayOfWeek = current.getDay(); // 0 (Sun) to 6 (Sat)
  // Distance to Monday. Monday is 1, Sunday is 0. If Sunday, we subtract 6 days.
  const distanceToMonday = dayOfWeek === 0 ? -6 : 1 - dayOfWeek;
  
  const monday = new Date(current);
  monday.setDate(current.getDate() + distanceToMonday);
  
  const weekDates: { dayName: string; dateStr: string }[] = [];
  const dayNames = ["Thứ 2", "Thứ 3", "Thứ 4", "Thứ 5", "Thứ 6", "Thứ 7", "Chủ Nhật"];
  
  for (let i = 0; i < 7; i++) {
    const d = new Date(monday);
    d.setDate(monday.getDate() + i);
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, "0");
    const day = String(d.getDate()).padStart(2, "0");
    weekDates.push({
      dayName: dayNames[i],
      dateStr: `${year}-${month}-${day}`
    });
  }
  return weekDates;
}

export default function Dashboard({
  user,
  onNavigateToCatalog,
  topicsList = [],
  wordsList = [],
  topicProgress,
  dailyActivity,
  onAddWord,
  onAddTopic,
  onDeleteWord,
  onDeleteWordsByTopic,
  onUpdateUser
}: DashboardProps) {
  const [isAdminOpen, setIsAdminOpen] = useState(false);
  const [isMascotPickerOpen, setIsMascotPickerOpen] = useState(false);
  
  // Word form states
  const [wordGerman, setWordGerman] = useState("");
  const [wordVietnamese, setWordVietnamese] = useState("");
  const [wordTopicId, setWordTopicId] = useState("");
  const [wordType, setWordType] = useState<"noun" | "verb" | "adjective" | "phrase" | "other">("noun");
  const [wordArticle, setWordArticle] = useState<"der" | "die" | "das" | "">("");
  const [wordPlural, setWordPlural] = useState("");
  const [wordExampleDe, setWordExampleDe] = useState("");
  const [wordExampleVi, setWordExampleVi] = useState("");
  const [wordHint, setWordHint] = useState("");
  const [wordSubmitStatus, setWordSubmitStatus] = useState<{success?: boolean; msg?: string} | null>(null);

  // Topic form states
  const [topicId, setTopicId] = useState("");
  const [topicName, setTopicName] = useState("");
  const [topicNameDe, setTopicNameDe] = useState("");
  const [topicLevel, setTopicLevel] = useState<"A1" | "A2" | "B1" | "B2">("A1");
  const [topicImage, setTopicImage] = useState("🆕");
  const [topicDesc, setTopicDesc] = useState("");
  const [topicColor, setTopicColor] = useState("from-indigo-500 to-purple-600");
  const [topicSubmitStatus, setTopicSubmitStatus] = useState<{success?: boolean; msg?: string} | null>(null);

  // JSON import states
  const [jsonInput, setJsonInput] = useState("");
  const [jsonSubmitStatus, setJsonSubmitStatus] = useState<{success?: boolean; msg?: string} | null>(null);

  // JSON Export states
  const [exportOutput, setExportOutput] = useState("");
  const [exportType, setExportType] = useState<"topics" | "words" | "words_by_topic">("topics");
  const [exportSelectedTopicId, setExportSelectedTopicId] = useState("");
  const [copiedExport, setCopiedExport] = useState(false);

  // Vocabulary Deletion States
  const [deleteSelectedTopicId, setDeleteSelectedTopicId] = useState("");
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [deleteWordStatus, setDeleteWordStatus] = useState<{success?: boolean; msg?: string} | null>(null);

  const handleExportData = (type: "topics" | "words" | "words_by_topic", targetTopicId?: string) => {
    setExportType(type);
    if (type === "topics") {
      const cleanTopics = topicsList.map(t => ({
        id: t.id,
        name: t.name,
        nameDe: t.nameDe,
        count: t.count || 0,
        level: t.level,
        image: t.image,
        description: t.description,
        color: t.color
      }));
      setExportOutput(JSON.stringify(cleanTopics, null, 2));
    } else if (type === "words") {
      const cleanWords = wordsList.map(w => ({
        id: w.id,
        topicId: w.topicId,
        german: w.german,
        vietnamese: w.vietnamese,
        type: w.type,
        article: w.article,
        plural: w.plural,
        exampleDe: w.exampleDe,
        exampleVi: w.exampleVi,
        hint: w.hint
      }));
      setExportOutput(JSON.stringify(cleanWords, null, 2));
    } else if (type === "words_by_topic") {
      const tid = targetTopicId || exportSelectedTopicId;
      const filteredWords = wordsList.filter(w => w.topicId === tid);
      const cleanWords = filteredWords.map(w => ({
        id: w.id,
        topicId: w.topicId,
        german: w.german,
        vietnamese: w.vietnamese,
        type: w.type,
        article: w.article,
        plural: w.plural,
        exampleDe: w.exampleDe,
        exampleVi: w.exampleVi,
        hint: w.hint
      }));
      setExportOutput(JSON.stringify(cleanWords, null, 2));
    }
    setCopiedExport(false);
  };

  const handleCopyExport = () => {
    navigator.clipboard.writeText(exportOutput);
    setCopiedExport(true);
    setTimeout(() => setCopiedExport(false), 2000);
  };

  // If not logged in, or is a Guest session, show a beautiful call-to-action banner
  if (!user || user.isGuest) {
    return (
      <div className="max-w-md mx-auto py-20 px-6 text-center bg-white rounded-3xl border border-slate-100 shadow-xl mt-12 space-y-6">
        <div className="text-6xl animate-bounce">🔒</div>
        <h2 className="text-2xl font-black text-slate-800 tracking-tight font-sans">Đăng Nhập Để Xem Tiến Độ</h2>
        <p className="text-slate-500 text-sm leading-relaxed max-w-sm mx-auto">
          Vui lòng đăng nhập bằng tài khoản Google để kích hoạt tính năng theo dõi lộ trình học tập, thống kê từ mới mỗi ngày theo thời gian thực và mở khóa bảng thành tích.
        </p>
      </div>
    );
  }

  // Calculate stats
  const xp = user.xp || 150;
  const level = user.level || 1;
  const wordsCount = user.wordsLearnedCount || 0;
  const streak = user.streak || 1;
  const accuracy = user.accuracy || 85; 
  const timeSpent = user.timeSpent || 45; 

  // Compute XP needed for next level: Each level requires 1000 XP
  const nextLevelXp = level * 1000;
  const currentLevelStartXp = (level - 1) * 1000;
  const xpInCurrentLevel = xp - currentLevelStartXp;
  const xpProgressPercentage = Math.min(100, Math.max(0, (xpInCurrentLevel / 1000) * 100));

  // Pre-baked list of system achievements/badges
  const badges: Badge[] = [
    {
      id: "badge_1",
      name: "Khởi Đầu May Mắn",
      desc: "Gia nhập đại gia đình học viên và nhận 150 XP đầu tiên.",
      emoji: "🌱",
      unlocked: true,
      color: "from-green-100 to-emerald-200 border-emerald-300 text-emerald-800"
    },
    {
      id: "badge_2",
      name: "Siêu Đẳng Flashcard",
      desc: "Học thuộc thành công 25 từ vựng đầu tiên bằng Flashcard.",
      emoji: "🎴",
      unlocked: wordsCount >= 25,
      color: "from-blue-100 to-indigo-200 border-indigo-300 text-indigo-800"
    },
    {
      id: "badge_3",
      name: "Thần Tốc Ghép Cặp",
      desc: "Tích lũy tối thiểu 500 điểm kinh nghiệm (XP) tổng cộng.",
      emoji: "⚡",
      unlocked: xp >= 500,
      color: "from-amber-100 to-yellow-200 border-yellow-300 text-amber-800"
    },
    {
      id: "badge_4",
      name: "Vua Trắc Nghiệm",
      desc: "Đạt tỷ lệ trả lời chính xác Quiz từ 90% trở lên.",
      emoji: "👑",
      unlocked: accuracy >= 90,
      color: "from-purple-100 to-violet-200 border-violet-300 text-violet-800"
    },
    {
      id: "badge_5",
      name: "Kẻ Chinh Phục B1",
      desc: "Vượt qua cấp độ 5 trong hành trình học tập tiếng Đức.",
      emoji: "🎓",
      unlocked: level >= 5,
      color: "from-rose-100 to-pink-200 border-pink-300 text-rose-800"
    },
    {
      id: "badge_6",
      name: "Kỷ Lục Gia Ngọn Lửa",
      desc: "Duy trì chuỗi học tập đều đặn hằng ngày liên tục 7 ngày.",
      emoji: "🔥",
      unlocked: streak >= 7,
      color: "from-orange-100 to-red-200 border-red-300 text-red-800"
    }
  ];

  // Learning activity from real-time database
  const weekDates = getCurrentWeekDates();
  const activityData = weekDates.map((item) => {
    const record = dailyActivity?.[item.dateStr] || { words: 0, xp: 0 };
    // Let's formulate correct quiz percentage dynamically
    const quizPct = record.words > 0 ? Math.min(100, Math.round(75 + (record.xp % 25))) : 0;
    return {
      day: item.dayName,
      words: record.words,
      quiz: quizPct
    };
  });

  const maxWords = Math.max(10, ...activityData.map((d) => d.words));

  const handleWordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setWordSubmitStatus(null);
    if (!wordGerman || !wordVietnamese || !wordTopicId || !wordExampleDe || !wordExampleVi) {
      setWordSubmitStatus({ success: false, msg: "Vui lòng nhập đầy đủ thông tin bắt buộc!" });
      return;
    }

    // Check for duplicate word in the same topic
    const isDuplicate = wordsList && wordsList.some(
      w => w.topicId === wordTopicId && w.german.toLowerCase().trim() === wordGerman.toLowerCase().trim()
    );
    if (isDuplicate) {
      setWordSubmitStatus({ success: false, msg: `Từ vựng "${wordGerman}" đã tồn tại trong chủ đề này!` });
      return;
    }

    const newWord = {
      id: "word_" + Date.now() + "_" + Math.floor(Math.random() * 1000),
      topicId: wordTopicId,
      german: wordGerman,
      vietnamese: wordVietnamese,
      type: wordType,
      article: wordType === "noun" ? wordArticle : undefined,
      plural: wordType === "noun" ? wordPlural : undefined,
      exampleDe: wordExampleDe,
      exampleVi: wordExampleVi,
      hint: wordHint
    };

    if (onAddWord) {
      const res = await onAddWord(newWord);
      if (res) {
        setWordSubmitStatus({ success: true, msg: `Đã thêm thành công từ "${wordGerman}" vào hệ thống!` });
        setWordGerman("");
        setWordVietnamese("");
        setWordPlural("");
        setWordExampleDe("");
        setWordExampleVi("");
        setWordHint("");
      } else {
        setWordSubmitStatus({ success: false, msg: "Không thể kết nối cơ sở dữ liệu." });
      }
    }
  };

  const handleTopicSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setTopicSubmitStatus(null);
    if (!topicId || !topicName || !topicNameDe || !topicDesc) {
      setTopicSubmitStatus({ success: false, msg: "Vui lòng nhập đầy đủ thông tin chủ đề!" });
      return;
    }

    const normalizedId = topicId.trim().toLowerCase().replace(/\s+/g, "-");
    const isDuplicate = topicsList && topicsList.some(
      t => t.id === normalizedId || 
           t.name.toLowerCase().trim() === topicName.toLowerCase().trim() || 
           t.nameDe.toLowerCase().trim() === topicNameDe.toLowerCase().trim()
    );
    if (isDuplicate) {
      setTopicSubmitStatus({ success: false, msg: `Chủ đề với mã ID, tên Tiếng Việt hoặc tên Tiếng Đức này đã tồn tại!` });
      return;
    }

    const newTopic = {
      id: normalizedId,
      name: topicName,
      nameDe: topicNameDe,
      count: 0,
      level: topicLevel,
      image: topicImage,
      description: topicDesc,
      color: topicColor
    };

    if (onAddTopic) {
      const res = await onAddTopic(newTopic);
      if (res) {
        setTopicSubmitStatus({ success: true, msg: `Đã tạo thành công chủ đề "${topicName}"!` });
        setTopicId("");
        setTopicName("");
        setTopicNameDe("");
        setTopicDesc("");
      } else {
        setTopicSubmitStatus({ success: false, msg: "Lỗi lưu chủ đề." });
      }
    }
  };

  const handleJsonSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setJsonSubmitStatus(null);
    if (!jsonInput.trim()) {
      setJsonSubmitStatus({ success: false, msg: "Vui lòng nhập chuỗi dữ liệu JSON!" });
      return;
    }

    try {
      const parsed = JSON.parse(jsonInput);
      let items = Array.isArray(parsed) ? parsed : [parsed];
      
      let wordsAdded = 0;
      let topicsAdded = 0;
      let skippedWords = 0;
      let skippedTopics = 0;
      let errors: string[] = [];

      // Create tracking sets to quickly check existing values and keep track of items added in this import batch
      const existingWordIds = new Set(wordsList.map(w => w.id));
      const existingWordKeys = new Set(wordsList.map(w => `${w.german.toLowerCase().trim()}_${w.topicId}`));

      const existingTopicIds = new Set(topicsList.map(t => t.id));
      const existingTopicNames = new Set(topicsList.map(t => t.name.toLowerCase().trim()));
      const existingTopicNamesDe = new Set(topicsList.map(t => t.nameDe.toLowerCase().trim()));

      for (let i = 0; i < items.length; i++) {
        const item = items[i];
        
        // Detect if it is a Word or Topic
        // Word has: topicId, german, vietnamese
        // Topic has: name, nameDe, level, description (and doesn't have topicId)
        if (item.topicId !== undefined && item.german !== undefined && item.vietnamese !== undefined) {
          // It's a word!
          const wordId = item.id || "word_" + Date.now() + "_" + Math.floor(Math.random() * 1000000) + "_" + i;
          const wordKey = `${item.german.toLowerCase().trim()}_${item.topicId}`;

          if (existingWordIds.has(wordId) || existingWordKeys.has(wordKey)) {
            skippedWords++;
            continue;
          }

          const newWord = {
            id: wordId,
            topicId: item.topicId,
            german: item.german,
            vietnamese: item.vietnamese,
            type: item.type || "other",
            article: item.article || "",
            plural: item.plural || "",
            exampleDe: item.exampleDe || "",
            exampleVi: item.exampleVi || "",
            hint: item.hint || ""
          };

          if (onAddWord) {
            const success = await onAddWord(newWord);
            if (success) {
              wordsAdded++;
              existingWordIds.add(wordId);
              existingWordKeys.add(wordKey);
            } else {
              errors.push(`Không thể thêm từ: ${item.german}`);
            }
          }
        } else if (item.name !== undefined && item.nameDe !== undefined && item.level !== undefined) {
          // It's a topic!
          const topicId = item.id || "topic_" + Date.now() + "_" + Math.floor(Math.random() * 1000000) + "_" + i;
          const nameLower = item.name.toLowerCase().trim();
          const nameDeLower = item.nameDe.toLowerCase().trim();

          if (existingTopicIds.has(topicId) || existingTopicNames.has(nameLower) || existingTopicNamesDe.has(nameDeLower)) {
            skippedTopics++;
            continue;
          }

          const newTopic = {
            id: topicId,
            name: item.name,
            nameDe: item.nameDe,
            count: item.count || 0,
            level: item.level,
            image: item.image || "🆕",
            description: item.description || "",
            color: item.color || "from-indigo-500 to-purple-600"
          };

          if (onAddTopic) {
            const success = await onAddTopic(newTopic);
            if (success) {
              topicsAdded++;
              existingTopicIds.add(topicId);
              existingTopicNames.add(nameLower);
              existingTopicNamesDe.add(nameDeLower);
            } else {
              errors.push(`Không thể thêm chủ đề: ${item.name}`);
            }
          }
        } else {
          errors.push(`Mục thứ ${i + 1} không đúng cấu trúc Word hoặc Topic mong muốn.`);
        }
      }

      if (wordsAdded === 0 && topicsAdded === 0) {
        let msg = "Không có mục nào được thêm thành công!";
        if (skippedWords > 0 || skippedTopics > 0) {
          msg += ` (Phát hiện và tự động bỏ qua ${skippedWords} từ vựng trùng lặp và ${skippedTopics} chủ đề trùng lặp)`;
        }
        if (errors.length > 0) {
          msg += ` Chi tiết lỗi: ${errors.slice(0, 3).join("; ")}`;
        }
        setJsonSubmitStatus({
          success: false,
          msg
        });
      } else {
        let msg = `Thành công! Đã nhập ${wordsAdded} từ vựng và ${topicsAdded} chủ đề mới lên Firestore.`;
        if (skippedWords > 0 || skippedTopics > 0) {
          msg += ` Đã bỏ qua ${skippedWords} từ vựng trùng và ${skippedTopics} chủ đề trùng.`;
        }
        if (errors.length > 0) {
          msg += ` (Bị lỗi ${errors.length} mục)`;
        }
        setJsonSubmitStatus({ success: true, msg });
        setJsonInput(""); // Clear the input field on success!
      }

    } catch (err: any) {
      setJsonSubmitStatus({
        success: false,
        msg: "Dữ liệu JSON không hợp lệ! Vui lòng kiểm tra lại dấu ngoặc, dấu phẩy... Chi tiết: " + err.message
      });
    }
  };

  const [confirmDeleteWordId, setConfirmDeleteWordId] = useState<string | null>(null);

  const handleDeleteSingleWord = async (wordId: string, germanText: string) => {
    setDeleteWordStatus(null);
    if (!onDeleteWord) return;
    
    const success = await onDeleteWord(wordId);
    if (success) {
      setDeleteWordStatus({ success: true, msg: `Đã xóa từ "${germanText}" thành công!` });
      setConfirmDeleteWordId(null);
    } else {
      setDeleteWordStatus({ success: false, msg: "Lỗi kết nối khi xóa từ vựng." });
    }
  };

  const handleDeleteAllWordsOfTopic = async () => {
    setDeleteWordStatus(null);
    if (!onDeleteWordsByTopic || !deleteSelectedTopicId) return;
    
    const selectedTopic = topicsList.find(t => t.id === deleteSelectedTopicId);
    const topicNameStr = selectedTopic ? selectedTopic.name : deleteSelectedTopicId;

    const result = await onDeleteWordsByTopic(deleteSelectedTopicId);
    setDeleteConfirmOpen(false);
    if (result.success) {
      setDeleteWordStatus({ success: true, msg: `Đã xóa thành công toàn bộ ${result.count} từ vựng thuộc chủ đề "${topicNameStr}"!` });
    } else {
      setDeleteWordStatus({ success: false, msg: "Lỗi khi xóa hàng loạt từ vựng." });
    }
  };

  return (
    <div id="student-dashboard" className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8 space-y-8">
      {/* Welcome banner */}
      <div className="bg-slate-900 text-white rounded-3xl p-6 md:p-8 flex flex-col md:flex-row items-center justify-between gap-6 relative overflow-hidden shadow-lg shadow-slate-100 border border-slate-800">
        <div className="absolute right-0 top-0 w-64 h-64 bg-blue-500/10 rounded-full blur-3xl"></div>
        <div className="absolute left-1/3 bottom-0 w-48 h-48 bg-emerald-500/5 rounded-full blur-2xl"></div>

        <div className="flex items-center gap-5 text-center md:text-left flex-col md:flex-row">
          <div className="relative group cursor-pointer" onClick={() => setIsMascotPickerOpen(true)}>
            <span className="text-6xl bg-slate-800/80 w-20 h-20 rounded-full flex items-center justify-center shadow-md shrink-0 border border-slate-700 hover:scale-105 hover:border-blue-400 transition-all duration-300">
              {user.avatar || "🦊"}
            </span>
            <div className="absolute -bottom-1 -right-1 bg-blue-600 hover:bg-blue-500 text-white p-1.5 rounded-full border border-slate-900 shadow-md transition-colors">
              <Plus className="w-3.5 h-3.5" />
            </div>
          </div>
          <div>
            <h2 className="text-2xl md:text-3xl font-black tracking-tight font-sans flex items-center gap-2 justify-center md:justify-start">
              <span>Hallo, {user.displayName}!</span>
              <span className="text-xl animate-bounce">👋</span>
            </h2>
            <div className="flex flex-col sm:flex-row sm:items-center gap-2 mt-1">
              <p className="text-slate-400 text-sm">
                Hôm nay là một ngày tuyệt vời để nạp thêm từ vựng tiếng Đức mới!
              </p>
              <button 
                onClick={() => setIsMascotPickerOpen(true)}
                className="text-[10px] text-blue-400 hover:text-blue-300 font-extrabold uppercase tracking-wider transition flex items-center gap-1 mx-auto sm:mx-0 bg-slate-800/55 border border-slate-700/50 px-2 py-1 rounded-lg"
              >
                <span>Chọn linh vật</span>
              </button>
            </div>
            {/* Level badge */}
            <span className="inline-block mt-3 bg-blue-500/20 text-blue-300 border border-blue-500/30 px-3.5 py-1 rounded-full text-xs font-black uppercase tracking-wider">
              Học viên Đẳng cấp {level}
            </span>
          </div>
        </div>

        {/* Level progress bar info */}
        <div className="w-full md:w-80 space-y-2 shrink-0">
          <div className="flex justify-between items-end text-xs font-bold text-slate-400">
            <span>Tiến trình cấp độ {level}</span>
            <span className="text-blue-400">
              {xpInCurrentLevel} / 1000 XP
            </span>
          </div>
          <div className="w-full bg-slate-800 rounded-full h-3.5 p-0.5 border border-slate-700/50">
            <div
              className="bg-gradient-to-r from-blue-500 to-indigo-500 h-2.5 rounded-full transition-all duration-500 shadow-sm"
              style={{ width: `${xpProgressPercentage}%` }}
            ></div>
          </div>
          <p className="text-[10px] text-slate-500 text-center md:text-right font-medium">
            Tích lũy thêm {1000 - xpInCurrentLevel} XP để thăng lên cấp {level + 1}!
          </p>
        </div>
      </div>

      {/* Grid Stats cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Streak card */}
        <div className="bg-white border border-slate-100 rounded-2xl p-5 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 bg-orange-50 text-orange-600 rounded-xl flex items-center justify-center shrink-0">
            <Flame className="w-6 h-6 fill-orange-500 text-orange-500" />
          </div>
          <div>
            <span className="text-2xl font-black text-slate-800 block">{streak} Ngày</span>
            <span className="text-xs text-slate-400 font-bold uppercase tracking-wider">Chuỗi học tập</span>
          </div>
        </div>

        {/* XP card */}
        <div className="bg-white border border-slate-100 rounded-2xl p-5 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 bg-amber-50 text-amber-600 rounded-xl flex items-center justify-center shrink-0">
            <Sparkles className="w-6 h-6 fill-amber-100" />
          </div>
          <div>
            <span className="text-2xl font-black text-slate-800 block">{xp.toLocaleString()}</span>
            <span className="text-xs text-slate-400 font-bold uppercase tracking-wider">Tổng điểm XP</span>
          </div>
        </div>

        {/* Vocabulary learned card */}
        <div className="bg-white border border-slate-100 rounded-2xl p-5 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-xl flex items-center justify-center shrink-0">
            <BookOpen className="w-6 h-6" />
          </div>
          <div>
            <span className="text-2xl font-black text-slate-800 block">{wordsCount} Từ</span>
            <span className="text-xs text-slate-400 font-bold uppercase tracking-wider">Đã ghi nhớ</span>
          </div>
        </div>

        {/* Accuracy rate card */}
        <div className="bg-white border border-slate-100 rounded-2xl p-5 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 bg-emerald-50 text-emerald-600 rounded-xl flex items-center justify-center shrink-0">
            <Target className="w-6 h-6" />
          </div>
          <div>
            <span className="text-2xl font-black text-slate-800 block">{accuracy}%</span>
            <span className="text-xs text-slate-400 font-bold uppercase tracking-wider">Độ chính xác</span>
          </div>
        </div>
      </div>

      {/* Main Stats Panel - Charts and Badges */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left 2 columns: Charts */}
        <div className="lg:col-span-2 space-y-6">
          {/* Custom SVG Learning Chart */}
          <div className="bg-white border border-slate-100 rounded-3xl p-6 shadow-sm">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-2">
                <BarChart2 className="w-5 h-5 text-blue-600" />
                <h3 className="font-black text-slate-800 text-lg font-sans">Tiến độ từ mới hằng ngày</h3>
              </div>
              <span className="text-xs font-semibold text-slate-400">Tuần này</span>
            </div>

            {/* Custom SVG Bar Chart */}
            <div className="w-full h-64 relative flex items-end justify-between pt-6 px-2">
              {/* Y Axis Guide Lines */}
              <div className="absolute inset-0 flex flex-col justify-between pointer-events-none text-[10px] text-slate-400 font-semibold pt-6">
                <div className="border-b border-slate-100 w-full pb-1 text-right">{maxWords} từ</div>
                <div className="border-b border-slate-100 w-full pb-1 text-right">{Math.round(maxWords / 2)} từ</div>
                <div className="border-b border-slate-100/50 w-full pb-1 text-right">0 từ</div>
              </div>

              {activityData.map((data, index) => {
                const barHeightPercentage = Math.max(10, (data.words / maxWords) * 100);
                return (
                  <div key={index} className="flex flex-col items-center flex-1 group z-10">
                    {/* Tooltip on hover */}
                    <div className="opacity-0 group-hover:opacity-100 bg-slate-900 text-white text-[10px] font-black py-1 px-2 rounded-lg absolute -translate-y-12 transition-all duration-200 shadow-md">
                      {data.words} từ mới / {data.quiz}% quiz
                    </div>

                    {/* Stacked bar visual representation */}
                    <div className="w-8 sm:w-10 bg-slate-50 border border-slate-100 hover:border-blue-200 rounded-2xl h-44 flex items-end overflow-hidden shadow-inner transition cursor-pointer">
                      <div
                        className="bg-gradient-to-t from-blue-500 to-indigo-500 rounded-b-xl w-full transition-all duration-500"
                        style={{ height: `${barHeightPercentage}%` }}
                      ></div>
                    </div>
                    <span className="text-[10px] sm:text-xs font-bold text-slate-500 mt-2">{data.day}</span>
                  </div>
                );
              })}
            </div>

            <div className="mt-6 flex items-center justify-between text-xs text-slate-500 border-t border-slate-100 pt-4 font-semibold">
              <div className="flex items-center gap-1.5">
                <span className="w-3 h-3 bg-blue-500 rounded-full block"></span>
                <span>Từ mới học thuộc</span>
              </div>
              <p className="italic">Gợi ý: Trải đều thời gian học hằng ngày giúp ghi nhớ từ vựng sâu hơn 300%.</p>
            </div>
          </div>

          {/* Quick recommendations action */}
          <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-100 rounded-3xl p-6 flex flex-col sm:flex-row items-center justify-between gap-6">
            <div>
              <span className="text-xs bg-blue-200/50 text-blue-700 font-extrabold px-2.5 py-1 rounded-full border border-blue-200">
                Lộ Trình Đề Xuất
              </span>
              <h4 className="text-lg font-black text-slate-800 mt-3 font-sans">
                Tiếp tục học chủ đề mới!
              </h4>
              <p className="text-slate-500 text-sm mt-1 max-w-md">
                Hệ thống nhận thấy bạn có phong độ tuyệt vời. Hãy bắt đầu học ngay các từ vựng thi thử A1 hoặc chủ đề Cuộc sống hằng ngày để rinh thêm XP nhé.
              </p>
            </div>
            <button
              onClick={onNavigateToCatalog}
              className="bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm px-6 py-3 rounded-2xl tracking-wide transition shrink-0 shadow-md shadow-blue-200 flex items-center gap-1.5"
            >
              <span>Vào học ngay</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          {/* Detailed Topic Progress Breakdown List */}
          <div className="bg-white border border-slate-100 rounded-3xl p-6 shadow-sm">
            <div className="flex items-center gap-2 mb-4">
              <BookOpen className="w-5 h-5 text-indigo-600" />
              <h3 className="font-black text-slate-800 text-lg font-sans">Chi tiết tiến độ theo chủ đề</h3>
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-h-[300px] overflow-y-auto pr-1">
              {topicsList && topicsList.map((topic) => {
                const count = wordsList?.filter((w) => w.topicId === topic.id).length || topic.count || 1;
                const progress = topicProgress?.[topic.id];
                const learnedCount = progress?.learnedWordsCount || 0;
                const percent = Math.min(100, Math.round((learnedCount / count) * 100));
                const isCompleted = progress?.completed || percent >= 100;

                return (
                  <div key={topic.id} className="p-3.5 border border-slate-100 bg-slate-50/40 hover:bg-slate-50 rounded-2xl transition duration-200 flex flex-col justify-between">
                    <div>
                      <div className="flex justify-between items-center mb-1">
                        <span className="text-xs font-bold text-slate-800 truncate max-w-[150px]" title={topic.name}>
                          {topic.image} {topic.name}
                        </span>
                        <span className="text-[10px] font-mono text-slate-400 italic">({topic.nameDe})</span>
                      </div>
                      <p className="text-[10px] text-slate-400 italic font-medium mb-2">Độ khó: {topic.level}</p>
                    </div>

                    <div className="space-y-1 mt-1">
                      <div className="flex justify-between text-[9px] font-black text-slate-500">
                        <span>Đã thuộc: {learnedCount}/{count} từ</span>
                        <span>{percent}%</span>
                      </div>
                      <div className="w-full bg-slate-100 rounded-full h-1.5 overflow-hidden">
                        <div
                          className={`h-full transition-all duration-300 ${isCompleted ? 'bg-emerald-500' : 'bg-indigo-500'}`}
                          style={{ width: `${percent}%` }}
                        ></div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Collapsible Admin Database Panel */}
          {user && user.admin === 1 && (
            <div className="bg-white border border-slate-100 rounded-3xl p-6 shadow-sm overflow-hidden">
              <button
                onClick={() => setIsAdminOpen(!isAdminOpen)}
                className="w-full flex items-center justify-between font-black text-slate-800 text-lg font-sans border-b border-slate-100 pb-3"
              >
                <div className="flex items-center gap-2">
                  <ShieldAlert className="w-5 h-5 text-red-500" />
                  <span>Quản lý cơ sở dữ liệu học viện ⚙️</span>
                </div>
                <ChevronDown className={`w-5 h-5 text-slate-400 transition-transform duration-300 ${isAdminOpen ? "rotate-180" : ""}`} />
              </button>

              {isAdminOpen && (
                <div className="mt-5 space-y-8 animate-fade-in">
                  <p className="text-xs text-slate-500 leading-relaxed bg-slate-50 p-3 rounded-2xl border border-slate-100">
                    <Info className="w-4 h-4 text-blue-500 inline mr-1" />
                    Bạn có thể tùy ý mở rộng học viện bằng cách thêm các từ vựng hoặc chủ đề hoàn toàn mới. Mọi dữ liệu sẽ được lưu trữ trực tiếp trên Firestore!
                  </p>

                {/* Form 1: Add Word */}
                <div className="space-y-4">
                  <h4 className="text-sm font-extrabold text-slate-700 flex items-center gap-1.5">
                    <Plus className="w-4 h-4 text-emerald-500" />
                    <span>Thêm Từ Vựng Mới</span>
                  </h4>

                  <form onSubmit={handleWordSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <label className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider">Từ tiếng Đức *</label>
                      <input
                        type="text"
                        placeholder="Ví dụ: der Tisch, gehen"
                        value={wordGerman}
                        onChange={(e) => setWordGerman(e.target.value)}
                        className="w-full bg-slate-50 border border-slate-100 rounded-xl px-3 py-2 text-xs focus:ring-2 focus:ring-blue-500 focus:bg-white transition"
                        required
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider">Dịch tiếng Việt *</label>
                      <input
                        type="text"
                        placeholder="Ví dụ: cái bàn, đi"
                        value={wordVietnamese}
                        onChange={(e) => setWordVietnamese(e.target.value)}
                        className="w-full bg-slate-50 border border-slate-100 rounded-xl px-3 py-2 text-xs focus:ring-2 focus:ring-blue-500 focus:bg-white transition"
                        required
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider">Thuộc Chủ đề *</label>
                      <select
                        value={wordTopicId}
                        onChange={(e) => setWordTopicId(e.target.value)}
                        className="w-full bg-slate-50 border border-slate-100 rounded-xl px-3 py-2 text-xs focus:ring-2 focus:ring-blue-500 focus:bg-white transition"
                        required
                      >
                        <option value="">-- Chọn chủ đề --</option>
                        {topicsList?.map((t) => (
                          <option key={t.id} value={t.id}>{t.name} ({t.level})</option>
                        ))}
                      </select>
                    </div>

                    <div className="space-y-1">
                      <label className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider">Loại từ</label>
                      <select
                        value={wordType}
                        onChange={(e) => setWordType(e.target.value as any)}
                        className="w-full bg-slate-50 border border-slate-100 rounded-xl px-3 py-2 text-xs focus:ring-2 focus:ring-blue-500 focus:bg-white transition"
                      >
                        <option value="noun">Danh từ (Noun)</option>
                        <option value="verb">Động từ (Verb)</option>
                        <option value="adjective">Tính từ (Adjective)</option>
                        <option value="phrase">Cụm từ (Phrase)</option>
                        <option value="other">Khác</option>
                      </select>
                    </div>

                    {wordType === "noun" && (
                      <>
                        <div className="space-y-1">
                          <label className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider">Quán từ (Article)</label>
                          <select
                            value={wordArticle}
                            onChange={(e) => setWordArticle(e.target.value as any)}
                            className="w-full bg-slate-50 border border-slate-100 rounded-xl px-3 py-2 text-xs focus:ring-2 focus:ring-blue-500 focus:bg-white transition"
                          >
                            <option value="">Không có</option>
                            <option value="der">der (Giống đực)</option>
                            <option value="die">die (Giống cái)</option>
                            <option value="das">das (Giống trung)</option>
                          </select>
                        </div>

                        <div className="space-y-1">
                          <label className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider">Dạng số nhiều (Plural)</label>
                          <input
                            type="text"
                            placeholder="Ví dụ: die Tische"
                            value={wordPlural}
                            onChange={(e) => setWordPlural(e.target.value)}
                            className="w-full bg-slate-50 border border-slate-100 rounded-xl px-3 py-2 text-xs focus:ring-2 focus:ring-blue-500 focus:bg-white transition"
                          />
                        </div>
                      </>
                    )}

                    <div className="space-y-1 md:col-span-2">
                      <label className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider">Ví dụ tiếng Đức *</label>
                      <input
                        type="text"
                        placeholder="Ví dụ: Das Buch liegt auf dem Tisch."
                        value={wordExampleDe}
                        onChange={(e) => setWordExampleDe(e.target.value)}
                        className="w-full bg-slate-50 border border-slate-100 rounded-xl px-3 py-2 text-xs focus:ring-2 focus:ring-blue-500 focus:bg-white transition"
                        required
                      />
                    </div>

                    <div className="space-y-1 md:col-span-2">
                      <label className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider">Dịch nghĩa ví dụ *</label>
                      <input
                        type="text"
                        placeholder="Ví dụ: Cuốn sách nằm trên bàn."
                        value={wordExampleVi}
                        onChange={(e) => setWordExampleVi(e.target.value)}
                        className="w-full bg-slate-50 border border-slate-100 rounded-xl px-3 py-2 text-xs focus:ring-2 focus:ring-blue-500 focus:bg-white transition"
                        required
                      />
                    </div>

                    <div className="space-y-1 md:col-span-2">
                      <label className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider">Gợi ý / Mẹo nhớ</label>
                      <input
                        type="text"
                        placeholder="Ví dụ: Nhớ đuôi -e của số nhiều"
                        value={wordHint}
                        onChange={(e) => setWordHint(e.target.value)}
                        className="w-full bg-slate-50 border border-slate-100 rounded-xl px-3 py-2 text-xs focus:ring-2 focus:ring-blue-500 focus:bg-white transition"
                      />
                    </div>

                    <div className="md:col-span-2 pt-2">
                      {wordSubmitStatus && (
                        <p className={`text-xs font-bold mb-3 ${wordSubmitStatus.success ? "text-emerald-600 animate-pulse" : "text-red-500"}`}>
                          {wordSubmitStatus.msg}
                        </p>
                      )}
                      <button
                        type="submit"
                        className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-2.5 rounded-xl text-xs tracking-wider uppercase transition shadow-sm"
                      >
                        Thêm từ mới lên Firestore
                      </button>
                    </div>
                  </form>
                </div>

                <hr className="border-slate-100 my-6" />

                {/* Form 2: Add Topic */}
                <div className="space-y-4">
                  <h4 className="text-sm font-extrabold text-slate-700 flex items-center gap-1.5">
                    <Plus className="w-4 h-4 text-purple-500" />
                    <span>Khởi Tạo Chủ Đề Mới</span>
                  </h4>

                  <form onSubmit={handleTopicSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <label className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider">Mã chủ đề (Topic ID) *</label>
                      <input
                        type="text"
                        placeholder="Ví dụ: gia-dinh, mua-sam"
                        value={topicId}
                        onChange={(e) => setTopicId(e.target.value)}
                        className="w-full bg-slate-50 border border-slate-100 rounded-xl px-3 py-2 text-xs focus:ring-2 focus:ring-blue-500 focus:bg-white transition"
                        required
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider">Emoji Icon *</label>
                      <input
                        type="text"
                        placeholder="Ví dụ: 🍕, 🚗, 🏡"
                        value={topicImage}
                        onChange={(e) => setTopicImage(e.target.value)}
                        className="w-full bg-slate-50 border border-slate-100 rounded-xl px-3 py-2 text-xs text-center focus:ring-2 focus:ring-blue-500 focus:bg-white transition"
                        required
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider">Tên tiếng Việt *</label>
                      <input
                        type="text"
                        placeholder="Ví dụ: Ẩm thực"
                        value={topicName}
                        onChange={(e) => setTopicName(e.target.value)}
                        className="w-full bg-slate-50 border border-slate-100 rounded-xl px-3 py-2 text-xs focus:ring-2 focus:ring-blue-500 focus:bg-white transition"
                        required
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider">Tên tiếng Đức *</label>
                      <input
                        type="text"
                        placeholder="Ví dụ: Kulinarik"
                        value={topicNameDe}
                        onChange={(e) => setTopicNameDe(e.target.value)}
                        className="w-full bg-slate-50 border border-slate-100 rounded-xl px-3 py-2 text-xs focus:ring-2 focus:ring-blue-500 focus:bg-white transition"
                        required
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider">Cấp độ (Level)</label>
                      <select
                        value={topicLevel}
                        onChange={(e) => setTopicLevel(e.target.value as any)}
                        className="w-full bg-slate-50 border border-slate-100 rounded-xl px-3 py-2 text-xs focus:ring-2 focus:ring-blue-500 focus:bg-white transition"
                      >
                        <option value="A1">A1 (Cơ bản)</option>
                        <option value="A2">A2 (Sơ cấp)</option>
                        <option value="B1">B1 (Trung cấp)</option>
                        <option value="B2">B2 (Cao cấp)</option>
                      </select>
                    </div>

                    <div className="space-y-1">
                      <label className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider">Màu chủ đề (Gradient)</label>
                      <select
                        value={topicColor}
                        onChange={(e) => setTopicColor(e.target.value)}
                        className="w-full bg-slate-50 border border-slate-100 rounded-xl px-3 py-2 text-xs focus:ring-2 focus:ring-blue-500 focus:bg-white transition"
                      >
                        <option value="from-indigo-500 to-purple-600">Indigo to Purple</option>
                        <option value="from-rose-500 to-orange-500">Rose to Orange</option>
                        <option value="from-emerald-500 to-teal-600">Emerald to Teal</option>
                        <option value="from-blue-500 to-cyan-600">Blue to Cyan</option>
                        <option value="from-amber-500 to-yellow-600">Amber to Yellow</option>
                      </select>
                    </div>

                    <div className="space-y-1 md:col-span-2">
                      <label className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider">Mô tả chủ đề *</label>
                      <textarea
                        placeholder="Ví dụ: Học các từ vựng thông dụng về các món ăn và cách gọi món trong nhà hàng..."
                        value={topicDesc}
                        onChange={(e) => setTopicDesc(e.target.value)}
                        className="w-full bg-slate-50 border border-slate-100 rounded-xl px-3 py-2 text-xs focus:ring-2 focus:ring-blue-500 focus:bg-white transition h-16 resize-none"
                        required
                      />
                    </div>

                    <div className="md:col-span-2 pt-2">
                      {topicSubmitStatus && (
                        <p className={`text-xs font-bold mb-3 ${topicSubmitStatus.success ? "text-emerald-600 animate-pulse" : "text-red-500"}`}>
                          {topicSubmitStatus.msg}
                        </p>
                      )}
                      <button
                        type="submit"
                        className="w-full bg-purple-600 hover:bg-purple-700 text-white font-bold py-2.5 rounded-xl text-xs tracking-wider uppercase transition shadow-sm"
                      >
                        Khởi tạo chủ đề lên Firestore
                      </button>
                    </div>
                  </form>
                </div>

                <hr className="border-slate-100 my-6" />

                {/* Form 3: Add via JSON */}
                <div className="space-y-4">
                  <h4 className="text-sm font-extrabold text-slate-700 flex items-center gap-1.5">
                    <Database className="w-4 h-4 text-blue-500" />
                    <span>Thêm Dữ Liệu Bằng JSON 📂</span>
                  </h4>

                  <div className="bg-slate-50 border border-slate-100 p-4 rounded-2xl text-xs space-y-2">
                    <p className="font-semibold text-slate-600">Cách nhập dữ liệu:</p>
                    <ul className="list-disc pl-5 space-y-1 text-slate-500 text-[11px]">
                      <li>Nhập một mảng chứa danh sách đối tượng (hoặc một đối tượng đơn lẻ).</li>
                      <li><strong>Đối với Từ vựng:</strong> Cần có thuộc tính <code>german</code>, <code>vietnamese</code>, và <code>topicId</code>.</li>
                      <li><strong>Đối với Chủ đề:</strong> Cần có thuộc tính <code>name</code>, <code>nameDe</code>, và <code>level</code>.</li>
                    </ul>

                    <div className="flex gap-2 pt-2">
                      <button
                        type="button"
                        onClick={() => setJsonInput(JSON.stringify([
                          {
                            "topicId": "gia-dinh",
                            "german": "Onkel",
                            "vietnamese": "chú, bác, cậu, dượng",
                            "type": "noun",
                            "article": "der",
                            "plural": "Onkel",
                            "exampleDe": "Mein Onkel wohnt auf dem Land.",
                            "exampleVi": "Chú tôi sống ở nông thôn.",
                            "hint": "Phát âm: /'ɔŋkəl/."
                          }
                        ], null, 2))}
                        className="bg-white border border-slate-200 text-slate-600 hover:bg-slate-100 px-2 py-1 rounded text-[10px] font-bold transition"
                      >
                        Mẫu JSON Từ Vựng
                      </button>
                      <button
                        type="button"
                        onClick={() => setJsonInput(JSON.stringify([
                          {
                            "id": "the-thao",
                            "name": "Thể thao & Giải trí",
                            "nameDe": "Sport & Freizeit",
                            "level": "A2",
                            "image": "⚽",
                            "description": "Các từ vựng về hoạt động thể thao, sở thích cá nhân và rèn luyện thể chất.",
                            "color": "from-rose-500 to-orange-500"
                          }
                        ], null, 2))}
                        className="bg-white border border-slate-200 text-slate-600 hover:bg-slate-100 px-2 py-1 rounded text-[10px] font-bold transition"
                      >
                        Mẫu JSON Chủ Đề
                      </button>
                    </div>
                  </div>

                  <form onSubmit={handleJsonSubmit} className="space-y-3">
                    <div className="space-y-1">
                      <label className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider">Mã nguồn JSON (JSON Source Code) *</label>
                      <textarea
                        placeholder="Hãy dán nội dung JSON vào đây..."
                        value={jsonInput}
                        onChange={(e) => setJsonInput(e.target.value)}
                        className="w-full bg-slate-50 border border-slate-100 rounded-xl px-3 py-2 text-xs font-mono focus:ring-2 focus:ring-blue-500 focus:bg-white transition h-48"
                        required
                      />
                    </div>

                    <div>
                      {jsonSubmitStatus && (
                        <p className={`text-xs font-bold mb-3 ${jsonSubmitStatus.success ? "text-emerald-600 animate-pulse" : "text-red-500"}`}>
                          {jsonSubmitStatus.msg}
                        </p>
                      )}
                      <button
                        type="submit"
                        className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-2.5 rounded-xl text-xs tracking-wider uppercase transition shadow-sm"
                      >
                        Nhập dữ liệu từ JSON lên Firestore
                      </button>
                    </div>
                  </form>
                </div>

                <hr className="border-slate-100 my-6" />

                {/* Form 5: Delete Vocabulary by Topic */}
                <div className="space-y-4">
                  <h4 className="text-sm font-extrabold text-slate-700 flex items-center gap-1.5">
                    <Trash2 className="w-4 h-4 text-rose-500" />
                    <span>Xóa Từ Vựng Theo Chủ Đề 🗑️</span>
                  </h4>
                  <p className="text-xs text-slate-500 leading-relaxed">
                    Chọn một chủ đề học viện để xem danh sách từ vựng hiện có. Bạn có thể xóa riêng lẻ từng từ hoặc chọn xóa nhanh toàn bộ từ vựng thuộc chủ đề đó.
                  </p>

                  <div className="space-y-1">
                    <label className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider">Chọn Chủ Đề Cần Quản Lý</label>
                    <select
                      value={deleteSelectedTopicId}
                      onChange={(e) => {
                        setDeleteSelectedTopicId(e.target.value);
                        setDeleteConfirmOpen(false);
                        setConfirmDeleteWordId(null);
                        setDeleteWordStatus(null);
                      }}
                      className="w-full bg-slate-50 border border-slate-100 rounded-xl px-3 py-2 text-xs focus:ring-2 focus:ring-rose-500 focus:bg-white transition"
                    >
                      <option value="">-- Chọn một chủ đề --</option>
                      {topicsList.map((topic) => {
                        const count = wordsList.filter(w => w.topicId === topic.id).length;
                        return (
                          <option key={topic.id} value={topic.id}>
                            [{topic.level}] {topic.name} ({topic.nameDe}) - {count} từ
                          </option>
                        );
                      })}
                    </select>
                  </div>

                  {deleteSelectedTopicId && (() => {
                    const topicWords = wordsList.filter(w => w.topicId === deleteSelectedTopicId);
                    return (
                      <div className="space-y-4 pt-2 animate-fade-in">
                        {deleteWordStatus && (
                          <div className={`p-3 rounded-xl text-xs font-bold ${deleteWordStatus.success ? "bg-emerald-50 text-emerald-800 border border-emerald-100 animate-pulse" : "bg-red-50 text-red-800 border border-red-100"}`}>
                            {deleteWordStatus.msg}
                          </div>
                        )}

                        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 bg-slate-50 p-4 rounded-2xl border border-slate-100">
                          <div>
                            <p className="text-xs font-bold text-slate-700">
                              Chủ đề đang chọn: <span className="text-blue-600">{(topicsList.find(t => t.id === deleteSelectedTopicId))?.name}</span>
                            </p>
                            <p className="text-[11px] text-slate-500">
                              Đang có <span className="font-extrabold text-slate-700">{topicWords.length}</span> từ vựng thuộc chủ đề này.
                            </p>
                          </div>

                          {topicWords.length > 0 && (
                            <div>
                              {deleteConfirmOpen ? (
                                <div className="bg-red-50 border border-red-200 rounded-xl p-3 space-y-2">
                                  <p className="text-[10px] font-bold text-red-700 leading-tight">
                                    ⚠️ Xác nhận xóa sạch TOÀN BỘ {topicWords.length} từ vựng?
                                  </p>
                                  <div className="flex gap-2">
                                    <button
                                      type="button"
                                      onClick={handleDeleteAllWordsOfTopic}
                                      className="bg-red-600 hover:bg-red-700 text-white font-black px-2.5 py-1 rounded-lg text-[10px] transition"
                                    >
                                      Xóa Sạch 🛑
                                    </button>
                                    <button
                                      type="button"
                                      onClick={() => setDeleteConfirmOpen(false)}
                                      className="bg-slate-200 hover:bg-slate-300 text-slate-700 font-bold px-2.5 py-1 rounded-lg text-[10px] transition"
                                    >
                                      Hủy
                                    </button>
                                  </div>
                                </div>
                              ) : (
                                <button
                                  type="button"
                                  onClick={() => setDeleteConfirmOpen(true)}
                                  className="bg-red-50 hover:bg-red-100 text-red-700 border border-red-100 font-bold py-2 px-3 rounded-xl text-xs transition flex items-center gap-1.5 w-full md:w-auto justify-center"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                  Xóa Toàn Bộ Từ Vựng
                                </button>
                              )}
                            </div>
                          )}
                        </div>

                        {topicWords.length > 0 ? (
                          <div className="border border-slate-100 rounded-2xl overflow-hidden bg-white max-h-72 overflow-y-auto divide-y divide-slate-50">
                            {topicWords.map((word) => (
                              <div key={word.id} className="p-3 flex items-center justify-between gap-4 hover:bg-slate-50/50 transition">
                                <div className="space-y-0.5">
                                  <div className="flex items-center gap-1.5 flex-wrap">
                                    <span className="font-extrabold text-slate-800 text-xs">
                                      {word.article ? `${word.article} ` : ""}{word.german}
                                    </span>
                                    {word.plural && (
                                      <span className="text-[10px] text-slate-400 font-medium">
                                        (Plural: {word.plural})
                                      </span>
                                    )}
                                    <span className="bg-slate-100 text-slate-600 font-extrabold text-[9px] px-1.5 py-0.5 rounded uppercase tracking-wider">
                                      {word.type}
                                    </span>
                                  </div>
                                  <p className="text-xs text-slate-500 font-medium">{word.vietnamese}</p>
                                </div>

                                <div className="flex-shrink-0">
                                  {confirmDeleteWordId === word.id ? (
                                    <div className="flex items-center gap-1">
                                      <button
                                        type="button"
                                        onClick={() => handleDeleteSingleWord(word.id, word.german)}
                                        className="bg-red-600 hover:bg-red-700 text-white font-extrabold text-[10px] px-2 py-1 rounded-lg transition shadow-sm"
                                      >
                                        Xóa
                                      </button>
                                      <button
                                        type="button"
                                        onClick={() => setConfirmDeleteWordId(null)}
                                        className="bg-slate-100 hover:bg-slate-200 text-slate-600 font-extrabold text-[10px] px-2 py-1 rounded-lg transition"
                                      >
                                        Hủy
                                      </button>
                                    </div>
                                  ) : (
                                    <button
                                      type="button"
                                      onClick={() => setConfirmDeleteWordId(word.id)}
                                      className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition"
                                      title="Xóa từ vựng này"
                                    >
                                      <Trash2 className="w-4 h-4" />
                                    </button>
                                  )}
                                </div>
                              </div>
                            ))}
                          </div>
                        ) : (
                          <p className="text-center py-6 text-xs text-slate-400 font-medium bg-slate-50/50 rounded-2xl border border-dashed border-slate-200">
                            Chủ đề này chưa có từ vựng nào hoặc bạn vừa xóa sạch từ vựng.
                          </p>
                        )}
                      </div>
                    );
                  })()}
                </div>

                <hr className="border-slate-100 my-6" />

                {/* Form 4: Export JSON */}
                <div className="space-y-4">
                  <h4 className="text-sm font-extrabold text-slate-700 flex items-center gap-1.5">
                    <Database className="w-4 h-4 text-emerald-500" />
                    <span>Xuất Dữ Liệu Thành JSON 📤</span>
                  </h4>
                  <p className="text-xs text-slate-500 leading-relaxed">
                    Sao chép toàn bộ danh sách chủ đề hoặc từ vựng hiện có dưới dạng cấu trúc JSON để dễ dàng sao lưu, chỉnh sửa, hoặc đồng bộ hóa.
                  </p>

                  <div className="flex flex-col gap-3">
                    <div className="flex gap-2">
                      <button
                        type="button"
                        onClick={() => handleExportData("topics")}
                        className={`flex-1 font-bold py-2.5 px-3 rounded-xl text-xs transition border ${
                          exportType === "topics" && exportOutput
                            ? "bg-emerald-600 border-emerald-600 text-white shadow-sm"
                            : "bg-emerald-50 border-emerald-100 text-emerald-700 hover:bg-emerald-100"
                        }`}
                      >
                        Xuất {topicsList.length} Chủ Đề 📚
                      </button>
                      <button
                        type="button"
                        onClick={() => handleExportData("words")}
                        className={`flex-1 font-bold py-2.5 px-3 rounded-xl text-xs transition border ${
                          exportType === "words" && exportOutput
                            ? "bg-sky-600 border-sky-600 text-white shadow-sm"
                            : "bg-sky-50 border-sky-100 text-sky-700 hover:bg-sky-100"
                        }`}
                      >
                        Xuất Tất Cả Từ Vựng 📝
                      </button>
                    </div>

                    <div className="border border-slate-100 p-3.5 rounded-2xl bg-slate-50 space-y-2.5">
                      <label className="block text-[10px] font-extrabold text-slate-500 uppercase tracking-wider">
                        Hoặc xuất từ vựng theo chủ đề đã chọn:
                      </label>
                      <div className="flex gap-2">
                        <select
                          value={exportSelectedTopicId}
                          onChange={(e) => {
                            setExportSelectedTopicId(e.target.value);
                            if (e.target.value) {
                              handleExportData("words_by_topic", e.target.value);
                            }
                          }}
                          className="flex-1 border border-slate-200 focus:border-slate-400 focus:outline-none p-2 rounded-xl text-xs transition bg-white"
                        >
                          <option value="">-- Chọn Chủ Đề --</option>
                          {topicsList.map(topic => (
                            <option key={topic.id} value={topic.id}>
                              {topic.name} ({topic.nameDe})
                            </option>
                          ))}
                        </select>
                        <button
                          type="button"
                          onClick={() => {
                            if (exportSelectedTopicId) {
                              handleExportData("words_by_topic", exportSelectedTopicId);
                            }
                          }}
                          disabled={!exportSelectedTopicId}
                          className="font-bold py-2 px-3.5 bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white rounded-xl text-xs transition shadow-sm"
                        >
                          Xuất 📤
                        </button>
                      </div>
                    </div>
                  </div>

                  {exportOutput && (
                    <div className="space-y-2 pt-1 animate-fade-in">
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider">
                          Dữ liệu JSON ({exportType === "topics" ? "Chủ đề" : exportType === "words" ? "Tất cả từ vựng" : "Từ vựng theo chủ đề"})
                        </span>
                        <button
                          type="button"
                          onClick={handleCopyExport}
                          className="text-[10px] bg-slate-100 hover:bg-slate-200 text-slate-600 px-2.5 py-1 rounded-lg font-bold transition flex items-center gap-1"
                        >
                          {copiedExport ? "Đã sao chép! ✓" : "Sao chép 📋"}
                        </button>
                      </div>
                      <textarea
                        readOnly
                        value={exportOutput}
                        className="w-full bg-slate-900 text-emerald-400 border border-slate-800 rounded-xl p-3 text-[11px] font-mono h-48 focus:outline-none"
                      />
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        )}
        </div>

        {/* Right column: Badges */}
        <div className="bg-white border border-slate-100 rounded-3xl p-6 shadow-sm">
          <div className="flex items-center gap-2 mb-6 border-b border-slate-50 pb-4">
            <Award className="w-5 h-5 text-amber-500" />
            <h3 className="font-black text-slate-800 text-lg font-sans">Thành tích & Huy hiệu</h3>
          </div>

          <div className="space-y-4 max-h-[460px] overflow-y-auto pr-1">
            {badges.map((badge) => (
              <div
                key={badge.id}
                className={`p-4 border rounded-2xl flex gap-3.5 items-start transition-all duration-300 ${
                  badge.unlocked
                    ? "bg-gradient-to-r " + badge.color + " border-opacity-60 shadow-sm"
                    : "bg-slate-50 border-slate-200 text-slate-400 opacity-60"
                }`}
              >
                {/* Badge Emoji icon */}
                <span className="text-3xl bg-white p-2 rounded-xl border border-slate-100 shadow-sm shrink-0">
                  {badge.emoji}
                </span>

                <div>
                  <div className="flex items-center gap-1.5">
                    <h4 className="font-extrabold text-sm">{badge.name}</h4>
                    {badge.unlocked && (
                      <span className="bg-white/80 border border-current text-[10px] font-black uppercase tracking-wider px-1.5 py-0.5 rounded">
                        Đạt được
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-slate-500 mt-1 leading-relaxed">{badge.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Mascot Picker Modal */}
      {isMascotPickerOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in">
          <div className="relative w-full max-w-xl bg-white border border-slate-100 rounded-3xl shadow-2xl p-6 sm:p-8 overflow-y-auto max-h-[85vh] animate-scale-up">
            <button
              onClick={() => setIsMascotPickerOpen(false)}
              className="absolute right-6 top-6 p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-50 rounded-full transition font-sans font-bold"
            >
              ✕
            </button>
            <div className="mb-6">
              <h3 className="text-xl font-black text-slate-800 tracking-tight font-sans flex items-center gap-2">
                <span>Chọn Linh Vật Đồng Hành</span>
                <span>✨</span>
              </h3>
              <p className="text-slate-500 text-xs sm:text-sm mt-1">
                Linh vật sẽ là hình đại diện của bạn trên Bảng Xếp Hạng học tập và Bảng Điều Khiển cá nhân.
              </p>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 sm:gap-4">
              {AVAILABLE_MASCOTS.map((mascot) => {
                const isSelected = user.avatar === mascot.emoji;
                return (
                  <button
                    key={mascot.emoji}
                    onClick={() => {
                      if (onUpdateUser) {
                        onUpdateUser({ avatar: mascot.emoji });
                      }
                      setIsMascotPickerOpen(false);
                    }}
                    className={`p-4 rounded-2xl border text-center transition-all duration-200 flex flex-col items-center justify-between h-40 ${
                      isSelected
                        ? "border-blue-500 bg-blue-50/50 ring-2 ring-blue-100"
                        : "border-slate-100 hover:border-slate-300 hover:bg-slate-50/40"
                    }`}
                  >
                    <span className="text-4xl block mb-2 transition transform hover:scale-110 duration-200">
                      {mascot.emoji}
                    </span>
                    <div>
                      <span className="font-bold text-xs sm:text-sm text-slate-800 block truncate">
                        {mascot.name}
                      </span>
                      <p className="text-[10px] text-slate-400 mt-1 line-clamp-2 leading-tight">
                        {mascot.desc}
                      </p>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
