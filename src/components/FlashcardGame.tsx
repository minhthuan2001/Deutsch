import React, { useState } from "react";
import { Word } from "../data/vocabulary";
import { ArrowLeft, RefreshCw, Check, AlertCircle, Sparkles, Volume2 } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

interface FlashcardGameProps {
  words: Word[];
  topicName: string;
  onBack: () => void;
  onEarnXP: (xp: number, wordsCount: number) => void;
}

export default function FlashcardGame({ words, topicName, onBack, onEarnXP }: FlashcardGameProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [learnedWords, setLearnedWords] = useState<string[]>([]);
  const [reviewWords, setReviewWords] = useState<string[]>([]);
  const [showSummary, setShowSummary] = useState(false);
  const [xpEarned, setXpEarned] = useState(0);

  const currentWord = words[currentIndex];

  const handleFlip = () => {
    setIsFlipped(!isFlipped);
  };

  const handleSpeak = (text: string) => {
    if ("speechSynthesis" in window) {
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = "de-DE";
      window.speechSynthesis.speak(utterance);
    }
  };

  const handleMark = (status: "learned" | "review") => {
    if (status === "learned") {
      if (!learnedWords.includes(currentWord.id)) {
        setLearnedWords([...learnedWords, currentWord.id]);
        setXpEarned((prev) => prev + 15);
      }
    } else {
      if (!reviewWords.includes(currentWord.id)) {
        setReviewWords([...reviewWords, currentWord.id]);
      }
    }

    setIsFlipped(false);
    setTimeout(() => {
      if (currentIndex < words.length - 1) {
        setCurrentIndex(currentIndex + 1);
      } else {
        setShowSummary(true);
        // Calculate final XP earned
        const finalXp = learnedWords.length * 15 + (status === "learned" ? 15 : 0);
        const finalWordsLearned = learnedWords.length + (status === "learned" ? 1 : 0);
        onEarnXP(finalXp, finalWordsLearned);
      }
    }, 200);
  };

  const getArticleColor = (article?: string) => {
    switch (article) {
      case "der":
        return "bg-blue-100 text-blue-700 border-blue-300";
      case "die":
        return "bg-rose-100 text-rose-700 border-rose-300";
      case "das":
        return "bg-emerald-100 text-emerald-700 border-emerald-300";
      default:
        return "bg-slate-100 text-slate-700 border-slate-300";
    }
  };

  const getCardTypeLabel = (type: string) => {
    switch (type) {
      case "noun":
        return "Danh từ";
      case "verb":
        return "Động từ";
      case "adjective":
        return "Tính từ";
      case "phrase":
        return "Cụm từ";
      default:
        return "Khác";
    }
  };

  const restartGame = () => {
    setCurrentIndex(0);
    setIsFlipped(false);
    setLearnedWords([]);
    setReviewWords([]);
    setShowSummary(false);
    setXpEarned(0);
  };

  if (words.length === 0) {
    return (
      <div id="flashcard-empty" className="bg-white rounded-2xl p-8 shadow-sm border border-slate-100 text-center max-w-md mx-auto my-12">
        <AlertCircle className="w-12 h-12 text-amber-500 mx-auto mb-4" />
        <h3 className="text-xl font-semibold text-slate-800 mb-2">Không tìm thấy từ vựng</h3>
        <p className="text-slate-500 mb-6">Chủ đề này hiện chưa có dữ liệu từ vựng mẫu.</p>
        <button onClick={onBack} className="bg-blue-500 text-white px-6 py-2 rounded-xl font-medium hover:bg-blue-600 transition">
          Quay lại
        </button>
      </div>
    );
  }

  return (
    <div id="flashcard-arena" className="max-w-2xl mx-auto py-4 px-4">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <button
          onClick={onBack}
          className="flex items-center gap-2 text-slate-600 hover:text-slate-900 transition font-medium"
        >
          <ArrowLeft className="w-5 h-5" />
          <span>Thoát game</span>
        </button>
        <div className="text-center">
          <span className="text-xs font-semibold text-blue-600 uppercase tracking-wider block">Flashcard Arena</span>
          <h2 className="text-lg font-bold text-slate-800">{topicName}</h2>
        </div>
        <div className="bg-amber-50 border border-amber-200 text-amber-700 px-3 py-1 rounded-full text-sm font-semibold flex items-center gap-1">
          <Sparkles className="w-4 h-4 text-amber-500 fill-amber-500" />
          <span>+{xpEarned} XP</span>
        </div>
      </div>

      {!showSummary ? (
        <div>
          {/* Progress Bar */}
          <div className="w-full bg-slate-100 rounded-full h-2.5 mb-8">
            <div
              className="bg-blue-600 h-2.5 rounded-full transition-all duration-300"
              style={{ width: `${((currentIndex + 1) / words.length) * 100}%` }}
            ></div>
          </div>

          <div className="text-center text-slate-500 text-sm mb-4 font-medium">
            Từ số {currentIndex + 1} / {words.length}
          </div>

          {/* Flashcard Component */}
          <div className="perspective-1000 w-full aspect-video min-h-[350px] relative cursor-pointer mb-8" onClick={handleFlip}>
            <div
              className={`w-full h-full duration-500 transform-style-3d relative transition-transform ${
                isFlipped ? "rotate-y-180" : ""
              }`}
            >
              {/* Card Front */}
              <div className="absolute inset-0 backface-hidden bg-white border border-slate-200 rounded-3xl p-8 shadow-md flex flex-col justify-between hover:shadow-lg hover:border-slate-300 transition duration-300">
                <div className="flex justify-between items-start">
                  <span className={`text-xs font-bold uppercase tracking-wider px-2.5 py-1 rounded-full border ${getArticleColor(currentWord.article)}`}>
                    {currentWord.article ? `${currentWord.article} • ` : ""}
                    {getCardTypeLabel(currentWord.type)}
                  </span>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleSpeak(currentWord.german);
                    }}
                    className="p-3 bg-slate-50 hover:bg-slate-100 rounded-full text-slate-600 hover:text-blue-600 transition"
                    title="Nghe phát âm"
                  >
                    <Volume2 className="w-5 h-5" />
                  </button>
                </div>

                <div className="text-center py-6">
                  <h3 className="text-4xl md:text-5xl font-black text-slate-800 tracking-tight font-sans">
                    {currentWord.article ? `${currentWord.article} ` : ""}
                    <span className={currentWord.article === "der" ? "text-blue-600" : currentWord.article === "die" ? "text-rose-600" : currentWord.article === "das" ? "text-emerald-600" : "text-slate-800"}>
                      {currentWord.german}
                    </span>
                  </h3>
                  {currentWord.plural && (
                    <p className="text-slate-500 mt-2 font-medium">Số nhiều: {currentWord.plural}</p>
                  )}
                </div>

                <div className="text-center text-xs text-slate-400 font-medium animate-pulse flex items-center justify-center gap-1.5">
                  <RefreshCw className="w-4 h-4" />
                  <span>Click để lật xem nghĩa tiếng Việt</span>
                </div>
              </div>

              {/* Card Back */}
              <div className="absolute inset-0 backface-hidden rotate-y-180 bg-slate-900 text-white rounded-3xl p-8 shadow-md flex flex-col justify-between">
                <div className="flex justify-between items-start">
                  <span className="text-xs bg-slate-800 text-slate-300 border border-slate-700 font-bold uppercase tracking-wider px-2.5 py-1 rounded-full">
                    Nghĩa Tiếng Việt
                  </span>
                  <span className="text-xs font-medium text-slate-400 bg-slate-800 px-2.5 py-1 rounded-full">
                    {getCardTypeLabel(currentWord.type)}
                  </span>
                </div>

                <div className="text-center py-4">
                  <h4 className="text-3xl font-bold text-emerald-400 mb-2 font-sans">
                    {currentWord.vietnamese}
                  </h4>
                  {currentWord.hint && (
                    <p className="text-slate-300 text-sm max-w-md mx-auto leading-relaxed italic bg-slate-800/50 p-2.5 rounded-xl border border-slate-800">
                      {currentWord.hint}
                    </p>
                  )}
                </div>

                <div className="bg-slate-800/80 rounded-2xl p-4 border border-slate-700/50">
                  <p className="text-slate-300 font-mono text-xs mb-1 uppercase tracking-wide">Ví dụ:</p>
                  <p className="text-white text-sm font-semibold italic mb-1">
                    "{currentWord.exampleDe}"
                  </p>
                  <p className="text-slate-400 text-xs">
                    ({currentWord.exampleVi})
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Action buttons (only if flipped or as a general guide) */}
          <div className="flex gap-4 max-w-md mx-auto">
            <button
              onClick={() => handleMark("review")}
              className="flex-1 bg-white border-2 border-rose-200 text-rose-600 hover:bg-rose-50 px-6 py-4 rounded-2xl font-bold flex items-center justify-center gap-2 shadow-sm hover:shadow transition"
            >
              <RefreshCw className="w-5 h-5" />
              <span>Chưa thuộc</span>
            </button>
            <button
              onClick={() => handleMark("learned")}
              className="flex-1 bg-emerald-500 hover:bg-emerald-600 text-white px-6 py-4 rounded-2xl font-bold flex items-center justify-center gap-2 shadow-md shadow-emerald-200 hover:shadow-lg transition"
            >
              <Check className="w-5 h-5" />
              <span>Đã thuộc</span>
            </button>
          </div>
        </div>
      ) : (
        /* Summary view */
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-white border border-slate-200 rounded-3xl p-8 shadow-md text-center"
        >
          <div className="w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <Sparkles className="w-10 h-10 text-blue-600 fill-blue-600" />
          </div>

          <h3 className="text-2xl font-black text-slate-800 mb-2 font-sans">
            Hoàn thành học tập!
          </h3>
          <p className="text-slate-500 max-w-sm mx-auto mb-6">
            Bạn đã xuất sắc ôn tập qua {words.length} từ vựng thuộc chủ đề <strong className="text-slate-800">{topicName}</strong>.
          </p>

          {/* Stats */}
          <div className="grid grid-cols-2 gap-4 max-w-sm mx-auto mb-8">
            <div className="bg-emerald-50 border border-emerald-100 rounded-2xl p-4">
              <span className="text-2xl font-black text-emerald-600 block">
                {learnedWords.length}
              </span>
              <span className="text-xs text-slate-500 font-medium">Từ đã thuộc</span>
            </div>
            <div className="bg-amber-50 border border-amber-100 rounded-2xl p-4">
              <span className="text-2xl font-black text-amber-600 block">
                +{learnedWords.length * 15}
              </span>
              <span className="text-xs text-slate-500 font-medium">XP tích lũy</span>
            </div>
          </div>

          {/* Buttons */}
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <button
              onClick={restartGame}
              className="bg-slate-100 hover:bg-slate-200 text-slate-700 px-6 py-3 rounded-xl font-bold transition flex items-center justify-center gap-2"
            >
              <RefreshCw className="w-5 h-5" />
              <span>Học lại chủ đề này</span>
            </button>
            <button
              onClick={onBack}
              className="bg-blue-500 hover:bg-blue-600 text-white px-8 py-3 rounded-xl font-bold shadow-md shadow-blue-200 transition"
            >
              <span>Trở về Trang chủ</span>
            </button>
          </div>
        </motion.div>
      )}
    </div>
  );
}
