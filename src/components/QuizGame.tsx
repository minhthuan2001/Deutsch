import React, { useState, useEffect } from "react";
import { Word } from "../data/vocabulary";
import { ArrowLeft, RefreshCw, Trophy, Check, X, AlertCircle, Sparkles, HelpCircle } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

interface QuizGameProps {
  words: Word[];
  topicName: string;
  onBack: () => void;
  onEarnXP: (xp: number, wordsCount: number) => void;
}

interface QuizQuestion {
  word: Word;
  questionText: string;
  options: string[];
  correctAnswer: string;
  type: "de_to_vi" | "vi_to_de";
}

export default function QuizGame({ words, topicName, onBack, onEarnXP }: QuizGameProps) {
  const [questions, setQuestions] = useState<QuizQuestion[]>([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [isAnswered, setIsAnswered] = useState(false);
  const [score, setScore] = useState(0);
  const [showSummary, setShowSummary] = useState(false);
  const [xpEarned, setXpEarned] = useState(0);

  useEffect(() => {
    generateQuiz();
  }, [words]);

  const generateQuiz = () => {
    if (words.length < 4) return;

    // Pick up to 10 random words for the quiz
    const shuffledWords = [...words].sort(() => 0.5 - Math.random());
    const quizWords = shuffledWords.slice(0, Math.min(10, words.length));

    const generatedQuestions: QuizQuestion[] = quizWords.map((word) => {
      const isDeToVi = Math.random() > 0.5;
      const questionText = isDeToVi
        ? `Nghĩa của từ "${word.article ? word.article + ' ' : ''}${word.german}" là gì?`
        : `Từ tiếng Đức nào tương ứng với nghĩa "${word.vietnamese}"?`;

      const correctAnswer = isDeToVi ? word.vietnamese : word.german;

      // Get incorrect options
      const otherWords = words.filter((w) => w.id !== word.id);
      const shuffledOthers = otherWords.sort(() => 0.5 - Math.random());

      const incorrectOptions: string[] = [];
      for (const item of shuffledOthers) {
        const value = isDeToVi ? item.vietnamese : item.german;
        if (!incorrectOptions.includes(value) && value !== correctAnswer) {
          incorrectOptions.push(value);
        }
        if (incorrectOptions.length === 3) break;
      }

      // Combine and shuffle options
      const options = [correctAnswer, ...incorrectOptions].sort(() => 0.5 - Math.random());

      return {
        word,
        questionText,
        options,
        correctAnswer,
        type: isDeToVi ? "de_to_vi" : "vi_to_de",
      };
    });

    setQuestions(generatedQuestions);
    setCurrentQuestionIndex(0);
    setSelectedOption(null);
    setIsAnswered(false);
    setScore(0);
    setShowSummary(false);
    setXpEarned(0);
  };

  const handleOptionSelect = (option: string) => {
    if (isAnswered) return;

    setSelectedOption(option);
    setIsAnswered(true);

    const isCorrect = option === questions[currentQuestionIndex].correctAnswer;
    if (isCorrect) {
      setScore((prev) => prev + 1);
      setXpEarned((prev) => prev + 20);
    }
  };

  const handleNext = () => {
    setSelectedOption(null);
    setIsAnswered(false);

    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
    } else {
      setShowSummary(true);
      // Finalize and save XP
      onEarnXP(xpEarned, score);
    }
  };

  if (words.length < 4) {
    return (
      <div id="quiz-empty" className="bg-white rounded-2xl p-8 shadow-sm border border-slate-100 text-center max-w-md mx-auto my-12">
        <AlertCircle className="w-12 h-12 text-amber-500 mx-auto mb-4" />
        <h3 className="text-xl font-semibold text-slate-800 mb-2">Không đủ từ vựng mẫu</h3>
        <p className="text-slate-500 mb-6">Trò chơi trắc nghiệm yêu cầu ít nhất 4 từ vựng trong kho dữ liệu để thiết kế đáp án.</p>
        <button onClick={onBack} className="bg-blue-500 text-white px-6 py-2 rounded-xl font-medium hover:bg-blue-600 transition">
          Quay lại
        </button>
      </div>
    );
  }

  const currentQuestion = questions[currentQuestionIndex];

  return (
    <div id="quiz-arena" className="max-w-2xl mx-auto py-4 px-4">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <button
          onClick={onBack}
          className="flex items-center gap-2 text-slate-600 hover:text-slate-900 transition font-medium"
        >
          <ArrowLeft className="w-5 h-5" />
          <span>Thoát trắc nghiệm</span>
        </button>
        <div className="text-center">
          <span className="text-xs font-semibold text-amber-600 uppercase tracking-wider block">Trắc Nghiệm Ghi Nhớ</span>
          <h2 className="text-lg font-bold text-slate-800">{topicName}</h2>
        </div>
        <div className="bg-amber-50 border border-amber-200 text-amber-700 px-3 py-1 rounded-full text-sm font-semibold flex items-center gap-1">
          <Sparkles className="w-4 h-4 text-amber-500 fill-amber-500" />
          <span>+{xpEarned} XP</span>
        </div>
      </div>

      {!showSummary && currentQuestion ? (
        <div>
          {/* Progress Indicator */}
          <div className="w-full bg-slate-100 rounded-full h-2.5 mb-6">
            <div
              className="bg-amber-500 h-2.5 rounded-full transition-all duration-300"
              style={{ width: `${((currentQuestionIndex + 1) / questions.length) * 100}%` }}
            ></div>
          </div>

          <div className="flex justify-between text-slate-500 text-sm mb-4 font-medium">
            <span>Câu {currentQuestionIndex + 1} / {questions.length}</span>
            <span>Đúng: {score}</span>
          </div>

          {/* Question Box */}
          <div className="bg-white border border-slate-200 rounded-3xl p-8 shadow-sm mb-6">
            <div className="w-10 h-10 bg-amber-50 rounded-xl flex items-center justify-center mb-4 text-amber-600">
              <HelpCircle className="w-6 h-6" />
            </div>
            <h3 className="text-xl md:text-2xl font-black text-slate-800 tracking-tight leading-snug">
              {currentQuestion.questionText}
            </h3>
          </div>

          {/* Options List */}
          <div className="grid grid-cols-1 gap-3 mb-6">
            {currentQuestion.options.map((option, idx) => {
              const isSelected = selectedOption === option;
              const isCorrectOption = option === currentQuestion.correctAnswer;
              const isWrongSelection = isSelected && !isCorrectOption;

              let optionStyle = "border-slate-200 hover:border-slate-300 hover:bg-slate-50 text-slate-800 bg-white";
              if (isAnswered) {
                if (isCorrectOption) {
                  optionStyle = "bg-emerald-50 border-emerald-400 text-emerald-700 font-bold shadow-sm shadow-emerald-50";
                } else if (isWrongSelection) {
                  optionStyle = "bg-rose-50 border-rose-400 text-rose-700 font-bold shadow-sm shadow-rose-50";
                } else {
                  optionStyle = "bg-slate-50 border-slate-200 text-slate-400 opacity-60";
                }
              }

              return (
                <button
                  key={idx}
                  onClick={() => handleOptionSelect(option)}
                  disabled={isAnswered}
                  className={`w-full p-4 rounded-2xl border text-left font-medium transition duration-200 flex items-center justify-between text-base ${optionStyle}`}
                >
                  <span className="flex items-center gap-3">
                    <span className="w-8 h-8 bg-slate-100 rounded-lg flex items-center justify-center text-xs text-slate-500 font-bold">
                      {String.fromCharCode(65 + idx)}
                    </span>
                    <span>{option}</span>
                  </span>
                  {isAnswered && isCorrectOption && (
                    <Check className="w-5 h-5 text-emerald-600 shrink-0" />
                  )}
                  {isAnswered && isWrongSelection && (
                    <X className="w-5 h-5 text-rose-600 shrink-0" />
                  )}
                </button>
              );
            })}
          </div>

          {/* Explanation / Example Panel */}
          <AnimatePresence>
            {isAnswered && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 10 }}
                className="bg-slate-50 border border-slate-200 rounded-2xl p-5 mb-6"
              >
                <div className="flex gap-2 items-center mb-2">
                  <span className="text-xs bg-slate-200 text-slate-700 font-bold px-2 py-0.5 rounded-md">
                    Chi tiết từ vựng
                  </span>
                  <span className="text-xs text-slate-500 italic">
                    {currentQuestion.word.hint}
                  </span>
                </div>
                <p className="text-slate-800 font-bold mb-1">
                  {currentQuestion.word.article ? `${currentQuestion.word.article} ` : ""}
                  {currentQuestion.word.german} = {currentQuestion.word.vietnamese}
                </p>
                <div className="text-xs text-slate-500">
                  <p className="font-semibold text-slate-600 mt-1.5">Ví dụ:</p>
                  <p className="font-mono text-slate-700 italic">"{currentQuestion.word.exampleDe}"</p>
                  <p className="text-slate-500">({currentQuestion.word.exampleVi})</p>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Next Button */}
          {isAnswered && (
            <button
              onClick={handleNext}
              className="w-full bg-slate-900 hover:bg-black text-white p-4 rounded-2xl font-bold tracking-wide transition duration-200 text-center shadow-lg hover:shadow-xl"
            >
              {currentQuestionIndex === questions.length - 1 ? "Hoàn thành trắc nghiệm" : "Câu tiếp theo"}
            </button>
          )}
        </div>
      ) : (
        /* Quiz Summary Screen */
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-white border border-slate-200 rounded-3xl p-8 shadow-md text-center"
        >
          <div className="w-20 h-20 bg-amber-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <Trophy className="w-10 h-10 text-amber-500 fill-amber-100" />
          </div>

          <h3 className="text-2xl font-black text-slate-800 mb-2 font-sans">
            Hoàn thành trắc nghiệm!
          </h3>
          <p className="text-slate-500 max-w-sm mx-auto mb-6">
            Bạn đã hoàn thành bài thi trắc nghiệm từ vựng thuộc chủ đề <strong className="text-slate-800">{topicName}</strong>.
          </p>

          {/* Score Widgets */}
          <div className="grid grid-cols-2 gap-4 max-w-sm mx-auto mb-8">
            <div className="bg-slate-50 border border-slate-100 rounded-2xl p-4">
              <span className="text-2xl font-black text-slate-800 block">
                {score} / {questions.length}
              </span>
              <span className="text-xs text-slate-500 font-medium">Số câu đúng</span>
            </div>
            <div className="bg-amber-50 border border-amber-100 rounded-2xl p-4">
              <span className="text-2xl font-black text-amber-600 block">
                +{xpEarned}
              </span>
              <span className="text-xs text-slate-500 font-medium">XP nhận được</span>
            </div>
          </div>

          {/* Actions */}
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <button
              onClick={generateQuiz}
              className="bg-slate-100 hover:bg-slate-200 text-slate-700 px-6 py-3 rounded-xl font-bold transition flex items-center justify-center gap-2"
            >
              <RefreshCw className="w-5 h-5" />
              <span>Làm bài mới</span>
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
