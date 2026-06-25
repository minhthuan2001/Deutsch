import React, { useState, useEffect } from "react";
import { Word } from "../data/vocabulary";
import { ArrowLeft, RefreshCw, Trophy, Check, X, AlertCircle, Sparkles, Key, Lightbulb } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

interface FillBlankGameProps {
  words: Word[];
  topicName: string;
  onBack: () => void;
  onEarnXP: (xp: number, wordsCount: number) => void;
}

interface BlankQuestion {
  word: Word;
  sentenceWithBlank: string;
  correctAnswer: string;
  clue: string;
}

export default function FillBlankGame({ words, topicName, onBack, onEarnXP }: FillBlankGameProps) {
  const [questions, setQuestions] = useState<BlankQuestion[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [userInput, setUserInput] = useState("");
  const [isAnswered, setIsAnswered] = useState(false);
  const [isCorrect, setIsCorrect] = useState(false);
  const [score, setScore] = useState(0);
  const [showSummary, setShowSummary] = useState(false);
  const [xpEarned, setXpEarned] = useState(0);
  const [showHint, setShowHint] = useState(false);

  useEffect(() => {
    generateQuestions();
  }, [words]);

  const generateQuestions = () => {
    // Filter words that have examples
    const eligibleWords = words.filter((w) => w.exampleDe && w.exampleDe.length > 0);
    if (eligibleWords.length === 0) return;

    // Pick up to 5 words for fill blank challenge (as it requires typing and is higher friction)
    const shuffled = [...eligibleWords].sort(() => 0.5 - Math.random());
    const selected = shuffled.slice(0, Math.min(5, eligibleWords.length));

    const generated: BlankQuestion[] = selected.map((word) => {
      let sentenceWithBlank = word.exampleDe;
      let matched = false;

      // Clean the German word to find (e.g. "der Zug" -> "Zug")
      const cleanGerman = word.german.replace(/^(der|die|das)\s+/i, "").trim();
      const possibleWords = [word.german, cleanGerman];
      
      for (const w of possibleWords) {
        if (!w) continue;
        const escaped = w.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&');
        const regex = new RegExp(`\\b${escaped}\\w*\\b`, "gi");
        if (regex.test(sentenceWithBlank)) {
          sentenceWithBlank = sentenceWithBlank.replace(regex, "_______");
          matched = true;
          break;
        }
      }

      // If we couldn't match using the regex, let's do a simple substring replacement for safety
      if (!matched) {
        const cleanGermanLower = cleanGerman.toLowerCase();
        const sentenceLower = sentenceWithBlank.toLowerCase();
        const idx = sentenceLower.indexOf(cleanGermanLower);
        if (idx !== -1) {
          sentenceWithBlank = sentenceWithBlank.substring(0, idx) + "_______" + sentenceWithBlank.substring(idx + cleanGerman.length);
          matched = true;
        }
      }

      // If still not matched (e.g. separable verbs like ankommen or completely different conjugation), 
      // do NOT leak the word! Instead, show a clean prompt asking for the word based on its Vietnamese translation.
      if (!matched) {
        sentenceWithBlank = `Từ tiếng Đức nào có nghĩa là: "${word.vietnamese}"?`;
      }

      return {
        word,
        sentenceWithBlank,
        correctAnswer: cleanGerman.toLowerCase().trim(),
        clue: word.vietnamese,
      };
    });

    setQuestions(generated);
    setCurrentIndex(0);
    setUserInput("");
    setIsAnswered(false);
    setScore(0);
    setShowSummary(false);
    setXpEarned(0);
    setShowHint(false);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (isAnswered || !userInput.trim()) return;

    const cleanInput = userInput.toLowerCase().trim();
    const cleanAnswer = questions[currentIndex].correctAnswer;

    // Direct match, or match without gender article
    const matched = cleanInput === cleanAnswer || cleanInput === cleanAnswer.replace(/^(der|die|das)\s+/, "");

    setIsCorrect(matched);
    setIsAnswered(true);

    if (matched) {
      setScore((prev) => prev + 1);
      setXpEarned((prev) => prev + 25); // Spellings are tougher, more XP!
    }
  };

  const handleNext = () => {
    setUserInput("");
    setIsAnswered(false);
    setShowHint(false);

    if (currentIndex < questions.length - 1) {
      setCurrentIndex(currentIndex + 1);
    } else {
      setShowSummary(true);
      onEarnXP(xpEarned, score);
    }
  };

  if (questions.length === 0) {
    return (
      <div id="fill-empty" className="bg-white rounded-2xl p-8 shadow-sm border border-slate-100 text-center max-w-md mx-auto my-12">
        <AlertCircle className="w-12 h-12 text-amber-500 mx-auto mb-4" />
        <h3 className="text-xl font-semibold text-slate-800 mb-2">Không đủ dữ liệu mẫu</h3>
        <p className="text-slate-500 mb-6">Trò chơi điền từ đòi hỏi từ vựng phải đi kèm câu ví dụ cụ thể.</p>
        <button onClick={onBack} className="bg-blue-500 text-white px-6 py-2 rounded-xl font-medium hover:bg-blue-600 transition">
          Quay lại
        </button>
      </div>
    );
  }

  const currentQuestion = questions[currentIndex];

  return (
    <div id="fill-arena" className="max-w-2xl mx-auto py-4 px-4">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <button
          onClick={onBack}
          className="flex items-center gap-2 text-slate-600 hover:text-slate-900 transition font-medium"
        >
          <ArrowLeft className="w-5 h-5" />
          <span>Thoát điền từ</span>
        </button>
        <div className="text-center">
          <span className="text-xs font-semibold text-violet-600 uppercase tracking-wider block">Thử Thách Điền Từ</span>
          <h2 className="text-lg font-bold text-slate-800">{topicName}</h2>
        </div>
        <div className="bg-amber-50 border border-amber-200 text-amber-700 px-3 py-1 rounded-full text-sm font-semibold flex items-center gap-1">
          <Sparkles className="w-4 h-4 text-amber-500 fill-amber-500" />
          <span>+{xpEarned} XP</span>
        </div>
      </div>

      {!showSummary && currentQuestion ? (
        <div>
          {/* Progress Bar */}
          <div className="w-full bg-slate-100 rounded-full h-2.5 mb-6">
            <div
              className="bg-violet-600 h-2.5 rounded-full transition-all duration-300"
              style={{ width: `${((currentIndex + 1) / questions.length) * 100}%` }}
            ></div>
          </div>

          <div className="flex justify-between text-slate-500 text-sm mb-4 font-medium">
            <span>Câu {currentIndex + 1} / {questions.length}</span>
            <span>Chính xác: {score}</span>
          </div>

          {/* Prompt / Context Card */}
          <div className="bg-white border border-slate-200 rounded-3xl p-8 shadow-sm mb-6 space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-xs bg-violet-50 text-violet-700 font-bold px-2.5 py-1 rounded-full">
                Hoàn thành câu sau
              </span>
              <button
                type="button"
                onClick={() => setShowHint(!showHint)}
                className="text-xs text-amber-600 hover:text-amber-700 font-semibold flex items-center gap-1 bg-amber-50 border border-amber-100 px-2.5 py-1 rounded-full transition"
              >
                <Lightbulb className="w-3.5 h-3.5" />
                <span>Gợi ý nghĩa</span>
              </button>
            </div>

            <div className="py-4">
              <p className="text-xl md:text-2xl font-black text-slate-800 tracking-tight leading-relaxed text-center font-sans">
                "{currentQuestion.sentenceWithBlank}"
              </p>
              <p className="text-slate-500 text-sm text-center mt-2">
                ({currentQuestion.word.exampleVi})
              </p>
            </div>

            <AnimatePresence>
              {showHint && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  className="bg-amber-50/50 border border-amber-100 rounded-xl p-3 text-xs text-amber-800"
                >
                  <strong className="block mb-0.5">Nghĩa của từ cần điền:</strong>
                  {currentQuestion.clue} {currentQuestion.word.plural ? `(Số nhiều: ${currentQuestion.word.plural})` : ""}
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Form Input */}
          <form onSubmit={handleSubmit} className="space-y-4 mb-6">
            <div>
              <label htmlFor="german-input" className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
                Nhập từ tiếng Đức cần điền (Không phân biệt hoa thường)
              </label>
              <input
                id="german-input"
                type="text"
                autoComplete="off"
                disabled={isAnswered}
                value={userInput}
                onChange={(e) => setUserInput(e.target.value)}
                placeholder="Nhập câu trả lời của bạn..."
                className={`w-full p-4 rounded-2xl border-2 text-lg font-bold font-sans focus:outline-none transition duration-200 ${
                  isAnswered
                    ? isCorrect
                      ? "bg-emerald-50 border-emerald-400 text-emerald-800"
                      : "bg-rose-50 border-rose-400 text-rose-800"
                    : "border-slate-200 focus:border-violet-500 focus:ring-4 focus:ring-violet-500/15 text-slate-800"
                }`}
              />
            </div>

            {!isAnswered ? (
              <button
                type="submit"
                disabled={!userInput.trim()}
                className="w-full bg-violet-600 hover:bg-violet-700 disabled:opacity-50 text-white p-4 rounded-2xl font-bold tracking-wide transition duration-200 text-center shadow-md shadow-violet-100"
              >
                Kiểm tra kết quả
              </button>
            ) : (
              <div className="space-y-4">
                {/* Result Feedback Banner */}
                <div className={`p-4 rounded-2xl flex items-start gap-3 border ${
                  isCorrect
                    ? "bg-emerald-100/60 border-emerald-200 text-emerald-800"
                    : "bg-rose-100/60 border-rose-200 text-rose-800"
                }`}>
                  {isCorrect ? (
                    <Check className="w-5 h-5 text-emerald-600 mt-0.5 shrink-0" />
                  ) : (
                    <X className="w-5 h-5 text-rose-600 mt-0.5 shrink-0" />
                  )}
                  <div>
                    <h4 className="font-bold">{isCorrect ? "Đúng rồi! Tuyệt vời" : "Chưa chính xác"}</h4>
                    <p className="text-sm mt-0.5">
                      Đáp án đúng là: <strong className="font-sans underline">{currentQuestion.word.german}</strong>
                      {currentQuestion.word.article ? ` (Giống: ${currentQuestion.word.article})` : ""}
                    </p>
                    {currentQuestion.word.hint && (
                      <p className="text-xs mt-1 text-slate-600">
                        {currentQuestion.word.hint}
                      </p>
                    )}
                  </div>
                </div>

                <button
                  type="button"
                  onClick={handleNext}
                  className="w-full bg-slate-900 hover:bg-black text-white p-4 rounded-2xl font-bold tracking-wide transition duration-200 text-center"
                >
                  {currentIndex === questions.length - 1 ? "Xem tổng kết" : "Câu tiếp theo"}
                </button>
              </div>
            )}
          </form>
        </div>
      ) : (
        /* Game Summary */
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-white border border-slate-200 rounded-3xl p-8 shadow-md text-center"
        >
          <div className="w-20 h-20 bg-violet-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <Trophy className="w-10 h-10 text-violet-600 fill-violet-100" />
          </div>

          <h3 className="text-2xl font-black text-slate-800 mb-2 font-sans">
            Thử thách hoàn tất!
          </h3>
          <p className="text-slate-500 max-w-sm mx-auto mb-6">
            Bạn đã xuất sắc hoàn thành thử thách chính tả điền từ cho chủ đề <strong className="text-slate-800">{topicName}</strong>.
          </p>

          {/* Scores */}
          <div className="grid grid-cols-2 gap-4 max-w-sm mx-auto mb-8">
            <div className="bg-slate-50 border border-slate-100 rounded-2xl p-4">
              <span className="text-2xl font-black text-slate-800 block">
                {score} / {questions.length}
              </span>
              <span className="text-xs text-slate-500 font-medium">Chính tả đúng</span>
            </div>
            <div className="bg-violet-50 border border-violet-100 rounded-2xl p-4">
              <span className="text-2xl font-black text-violet-600 block">
                +{xpEarned}
              </span>
              <span className="text-xs text-slate-500 font-medium">XP nhận được</span>
            </div>
          </div>

          {/* Actions */}
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <button
              onClick={generateQuestions}
              className="bg-slate-100 hover:bg-slate-200 text-slate-700 px-6 py-3 rounded-xl font-bold transition flex items-center justify-center gap-2"
            >
              <RefreshCw className="w-5 h-5" />
              <span>Chơi ván mới</span>
            </button>
            <button
              onClick={onBack}
              className="bg-blue-500 hover:bg-blue-600 text-white px-8 py-3 rounded-xl font-bold shadow-md shadow-blue-200 transition"
            >
              Trở về Trang chủ
            </button>
          </div>
        </motion.div>
      )}
    </div>
  );
}
