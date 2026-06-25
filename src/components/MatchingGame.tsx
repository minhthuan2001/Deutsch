import React, { useState, useEffect, useRef } from "react";
import { Word } from "../data/vocabulary";
import { ArrowLeft, RefreshCw, Zap, Trophy, Timer, CheckCircle, AlertCircle } from "lucide-react";
import { motion } from "motion/react";

interface MatchingGameProps {
  words: Word[];
  topicName: string;
  onBack: () => void;
  onEarnXP: (xp: number, wordsCount: number) => void;
}

interface CardItem {
  id: string; // original word ID + type (e.g., fam_1_de or fam_1_vi)
  wordId: string;
  text: string;
  lang: "de" | "vi";
  isMatched: boolean;
  isSelected: boolean;
  isError: boolean;
}

export default function MatchingGame({ words, topicName, onBack, onEarnXP }: MatchingGameProps) {
  const [cards, setCards] = useState<CardItem[]>([]);
  const [selectedCards, setSelectedCards] = useState<CardItem[]>([]);
  const [timer, setTimer] = useState(0);
  const [isPlaying, setIsPlaying] = useState(true);
  const [showSummary, setShowSummary] = useState(false);
  const [matchedCount, setMatchedCount] = useState(0);
  const [moves, setMoves] = useState(0);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  // Initialize game cards (take 6 random words from the selection)
  useEffect(() => {
    initializeGame();
    return () => stopTimer();
  }, [words]);

  const startTimer = () => {
    stopTimer();
    intervalRef.current = setInterval(() => {
      setTimer((prev) => prev + 1);
    }, 1000);
  };

  const stopTimer = () => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }
  };

  const initializeGame = () => {
    stopTimer();
    setTimer(0);
    setMoves(0);
    setMatchedCount(0);
    setShowSummary(false);
    setIsPlaying(true);

    // Shuffle and pick 6 words max for matching grid to fit neatly on screen
    const shuffledWords = [...words].sort(() => 0.5 - Math.random());
    const selectedWords = shuffledWords.slice(0, 6);

    const initialCards: CardItem[] = [];

    selectedWords.forEach((word) => {
      // Add German card
      initialCards.push({
        id: `${word.id}_de`,
        wordId: word.id,
        text: word.german,
        lang: "de",
        isMatched: false,
        isSelected: false,
        isError: false,
      });
      // Add Vietnamese card
      initialCards.push({
        id: `${word.id}_vi`,
        wordId: word.id,
        text: word.vietnamese,
        lang: "vi",
        isMatched: false,
        isSelected: false,
        isError: false,
      });
    });

    // Shuffle the final deck
    setCards(initialCards.sort(() => 0.5 - Math.random()));
    startTimer();
  };

  const handleCardClick = (clickedCard: CardItem) => {
    if (clickedCard.isMatched || clickedCard.isSelected || selectedCards.length >= 2 || !isPlaying) {
      return;
    }

    // Mark card as selected
    const updatedCards = cards.map((card) =>
      card.id === clickedCard.id ? { ...card, isSelected: true } : card
    );
    setCards(updatedCards);

    const newSelections = [...selectedCards, clickedCard];
    setSelectedCards(newSelections);

    if (newSelections.length === 2) {
      setMoves((prev) => prev + 1);
      checkMatch(newSelections);
    }
  };

  const checkMatch = (selections: CardItem[]) => {
    const [first, second] = selections;

    // Must select different languages and correct match of IDs
    const isSameWord = first.wordId === second.wordId;
    const isDifferentLang = first.lang !== second.lang;

    if (isSameWord && isDifferentLang) {
      // CORRECT MATCH
      setTimeout(() => {
        const updatedCards = cards.map((card) =>
          card.wordId === first.wordId
            ? { ...card, isMatched: true, isSelected: false }
            : card
        );
        setCards(updatedCards);
        setSelectedCards([]);

        const newMatchedCount = matchedCount + 1;
        setMatchedCount(newMatchedCount);

        // Check win condition (6 words = 6 matches)
        if (newMatchedCount === 6) {
          stopTimer();
          setIsPlaying(false);
          setTimeout(() => {
            setShowSummary(true);
            // Award XP (Base 40 XP, + bonus for speed)
            const speedBonus = Math.max(10, 60 - timer);
            const totalXp = 40 + speedBonus;
            onEarnXP(totalXp, 6);
          }, 800);
        }
      }, 300);
    } else {
      // INCORRECT MATCH
      setTimeout(() => {
        const errorCards = cards.map((card) =>
          card.id === first.id || card.id === second.id
            ? { ...card, isError: true }
            : card
        );
        setCards(errorCards);

        setTimeout(() => {
          const resetCards = cards.map((card) =>
            card.id === first.id || card.id === second.id
              ? { ...card, isSelected: false, isError: false }
              : card
          );
          setCards(resetCards);
          setSelectedCards([]);
        }, 500);
      }, 300);
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs < 10 ? "0" : ""}${secs}`;
  };

  // Compute calculated XP for win view
  const finalXpEarned = Math.max(50, 100 - timer);

  if (words.length < 6) {
    return (
      <div id="matching-empty" className="bg-white rounded-2xl p-8 shadow-sm border border-slate-100 text-center max-w-md mx-auto my-12">
        <AlertCircle className="w-12 h-12 text-amber-500 mx-auto mb-4" />
        <h3 className="text-xl font-semibold text-slate-800 mb-2">Không đủ từ vựng</h3>
        <p className="text-slate-500 mb-6">Trò chơi ghép cặp yêu cầu ít nhất 6 từ vựng để bắt đầu.</p>
        <button onClick={onBack} className="bg-blue-500 text-white px-6 py-2 rounded-xl font-medium hover:bg-blue-600 transition">
          Quay lại
        </button>
      </div>
    );
  }

  return (
    <div id="matching-arena" className="max-w-4xl mx-auto py-4 px-4">
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
          <span className="text-xs font-semibold text-emerald-600 uppercase tracking-wider block">Ghép Cặp Siêu Tốc</span>
          <h2 className="text-lg font-bold text-slate-800">{topicName}</h2>
        </div>
        <div className="flex items-center gap-4 bg-slate-50 border border-slate-200 px-4 py-1.5 rounded-full text-slate-700 text-sm font-semibold">
          <div className="flex items-center gap-1">
            <Timer className="w-4 h-4 text-blue-500 animate-pulse" />
            <span>{formatTime(timer)}</span>
          </div>
          <span className="text-slate-300">|</span>
          <div className="flex items-center gap-1">
            <Zap className="w-4 h-4 text-amber-500" />
            <span>Lượt: {moves}</span>
          </div>
        </div>
      </div>

      {!showSummary ? (
        <div className="space-y-6">
          {/* Main Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
            {cards.map((card) => (
              <motion.button
                key={card.id}
                onClick={() => handleCardClick(card)}
                whileHover={{ scale: card.isMatched ? 1 : 1.03 }}
                whileTap={{ scale: card.isMatched ? 1 : 0.98 }}
                className={`min-h-[120px] p-4 rounded-2xl flex items-center justify-center text-center transition-all duration-200 shadow-sm border font-medium ${
                  card.isMatched
                    ? "bg-emerald-50 border-emerald-200 text-emerald-600 opacity-30 cursor-not-allowed"
                    : card.isError
                    ? "bg-rose-50 border-rose-300 text-rose-600 animate-bounce"
                    : card.isSelected
                    ? "bg-blue-50 border-blue-400 text-blue-700 shadow-md ring-2 ring-blue-400/20"
                    : "bg-white hover:bg-slate-50 border-slate-200 text-slate-800 hover:border-slate-300"
                }`}
                disabled={card.isMatched}
              >
                <div>
                  {card.lang === "de" && !card.isMatched && (
                    <span className="text-xs font-semibold text-blue-500 uppercase tracking-wider block mb-1">
                      Deutsch
                    </span>
                  )}
                  {card.lang === "vi" && !card.isMatched && (
                    <span className="text-xs font-semibold text-emerald-500 uppercase tracking-wider block mb-1">
                      Vietnamese
                    </span>
                  )}
                  <p className="text-base font-bold font-sans break-words">{card.text}</p>
                </div>
              </motion.button>
            ))}
          </div>

          <div className="text-center text-xs text-slate-400 font-medium">
            Mẹo: Hãy ghép 1 từ tiếng Đức và 1 nghĩa tiếng Việt tương ứng càng nhanh càng tốt!
          </div>
        </div>
      ) : (
        /* Win Screen */
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-white border border-slate-200 rounded-3xl p-8 shadow-md text-center max-w-md mx-auto"
        >
          <div className="w-20 h-20 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <Trophy className="w-10 h-10 text-emerald-600 fill-emerald-100" />
          </div>

          <h3 className="text-2xl font-black text-slate-800 mb-2 font-sans">
            Thắng cuộc xuất sắc!
          </h3>
          <p className="text-slate-500 mb-6">
            Bạn đã ghép cặp chính xác toàn bộ các từ chỉ trong <strong className="text-slate-800">{formatTime(timer)}</strong> với <strong className="text-slate-800">{moves} lượt</strong> đi.
          </p>

          <div className="bg-slate-50 border border-slate-100 rounded-2xl p-4 flex justify-around mb-8">
            <div>
              <span className="text-2xl font-black text-blue-600 block">{formatTime(timer)}</span>
              <span className="text-xs text-slate-500 font-medium">Thời gian</span>
            </div>
            <div className="w-px bg-slate-200"></div>
            <div>
              <span className="text-2xl font-black text-amber-500 block">+{finalXpEarned}</span>
              <span className="text-xs text-slate-500 font-medium">XP tích lũy</span>
            </div>
          </div>

          <div className="flex flex-col gap-3">
            <button
              onClick={initializeGame}
              className="bg-blue-500 hover:bg-blue-600 text-white px-6 py-3 rounded-xl font-bold shadow-md shadow-blue-200 transition flex items-center justify-center gap-2"
            >
              <RefreshCw className="w-5 h-5" />
              <span>Chơi ván mới</span>
            </button>
            <button
              onClick={onBack}
              className="bg-slate-100 hover:bg-slate-200 text-slate-700 px-6 py-3 rounded-xl font-bold transition"
            >
              Trở về Trang chủ
            </button>
          </div>
        </motion.div>
      )}
    </div>
  );
}
