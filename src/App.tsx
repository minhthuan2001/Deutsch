import React, { useState, useEffect } from "react";
import { onAuthStateChanged, signOut } from "firebase/auth";
import { doc, getDoc, updateDoc, setDoc, collection, getDocs, writeBatch, deleteDoc } from "firebase/firestore";
import { auth, db, OperationType, handleFirestoreError } from "./firebase";
import { vocabularyData, topics, Topic, Word } from "./data/vocabulary";

// Components
import Navbar from "./components/Navbar";
import LandingPage from "./components/LandingPage";
import Dashboard from "./components/Dashboard";
import Leaderboard from "./components/Leaderboard";
import AuthModal from "./components/AuthModal";

// Games
import FlashcardGame from "./components/FlashcardGame";
import MatchingGame from "./components/MatchingGame";
import QuizGame from "./components/QuizGame";
import FillBlankGame from "./components/FillBlankGame";

import { Sparkles, Trophy, Flame, Play, X, Info } from "lucide-react";

export const getLocalDateString = () => {
  const d = new Date();
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
};

export default function App() {
  const [user, setUser] = useState<any>(null);
  const [activeTab, setActiveTab] = useState<"home" | "catalog" | "leaderboard" | "dashboard">("home");
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [loading, setLoading] = useState(true);

  // Dynamic Vocabulary and Topics lists loaded from Firestore (with fallbacks)
  const [topicsList, setTopicsList] = useState<Topic[]>(topics);
  const [wordsList, setWordsList] = useState<Word[]>(vocabularyData);
  const [dbLoading, setDbLoading] = useState(true);

  // User's topic-by-topic learning progress
  const [topicProgress, setTopicProgress] = useState<Record<string, {
    topicId: string;
    completed: boolean;
    xpGained: number;
    learnedWordsCount: number;
    lastStudied: string;
  }>>({});

  // User's daily activity progress mapped by YYYY-MM-DD
  const [dailyActivity, setDailyActivity] = useState<Record<string, {
    words: number;
    xp: number;
  }>>({});

  // Load and Seed Vocabulary Topics and Words from Firestore
  useEffect(() => {
    async function loadAndSeedVocabulary() {
      try {
        setDbLoading(true);
        const topicsColRef = collection(db, "topics");
        const topicsSnap = await getDocs(topicsColRef);
        
        let loadedTopics: Topic[] = [];
        let loadedWords: Word[] = [];

        // Load existing topics
        topicsSnap.forEach((docSnap) => {
          loadedTopics.push(docSnap.data() as Topic);
        });

        // Load existing words
        const wordsColRef = collection(db, "words");
        const wordsSnap = await getDocs(wordsColRef);
        wordsSnap.forEach((docSnap) => {
          loadedWords.push(docSnap.data() as Word);
        });

        // Identify any missing topics from static definitions and seed them
        const missingTopics = topics.filter((t) => !loadedTopics.some((lt) => lt.id === t.id));
        if (missingTopics.length > 0) {
          console.log(`Seeding ${missingTopics.length} missing topics to Firestore...`);
          const topicsBatch = writeBatch(db);
          missingTopics.forEach((t) => {
            const topicDocRef = doc(db, "topics", t.id);
            topicsBatch.set(topicDocRef, t);
            loadedTopics.push(t);
          });
          await topicsBatch.commit();
        }

        // Identify any missing words from static definitions and seed them in batch chunks
        const missingWords = vocabularyData.filter((w) => !loadedWords.some((lw) => lw.id === w.id));
        if (missingWords.length > 0) {
          console.log(`Seeding ${missingWords.length} missing vocabulary words to Firestore...`);
          const chunks: Word[][] = [];
          for (let i = 0; i < missingWords.length; i += 400) {
            chunks.push(missingWords.slice(i, i + 400));
          }

          for (const chunk of chunks) {
            const wordsBatch = writeBatch(db);
            chunk.forEach((w) => {
              const wordDocRef = doc(db, "words", w.id);
              wordsBatch.set(wordDocRef, w);
              loadedWords.push(w);
            });
            await wordsBatch.commit();
          }
        }

        // Fallback safety if loadedWords is empty
        if (loadedWords.length === 0) {
          loadedWords = vocabularyData;
        }

        const sortedTopics = [...loadedTopics].sort((a, b) => {
          const order = ["A1", "A2", "B1", "B2"];
          const levelDiff = order.indexOf(a.level) - order.indexOf(b.level);
          if (levelDiff !== 0) return levelDiff;
          return a.name.localeCompare(b.name);
        });

        setTopicsList(sortedTopics);
        setWordsList(loadedWords);
      } catch (err) {
        console.warn("Lỗi đồng bộ dữ liệu từ vựng từ Firestore:", err);
        // Fallback to static lists
        const sortedTopics = [...topics].sort((a, b) => {
          const order = ["A1", "A2", "B1", "B2"];
          const levelDiff = order.indexOf(a.level) - order.indexOf(b.level);
          if (levelDiff !== 0) return levelDiff;
          return a.name.localeCompare(b.name);
        });
        setTopicsList(sortedTopics);
        setWordsList(vocabularyData);
      } finally {
        setDbLoading(false);
      }
    }

    loadAndSeedVocabulary();
  }, []);

  // Reactive listener to load topic progress when user session updates
  useEffect(() => {
    async function loadUserProgress() {
      if (user && !user.isGuest) {
        try {
          const progressColRef = collection(db, "users", user.uid, "progress");
          const progressSnap = await getDocs(progressColRef);
          const progressMap: Record<string, any> = {};
          progressSnap.forEach((docSnap) => {
            progressMap[docSnap.id] = docSnap.data();
          });
          setTopicProgress(progressMap);

          // Load daily activity
          const activityColRef = collection(db, "users", user.uid, "daily_activity");
          const activitySnap = await getDocs(activityColRef);
          const activityMap: Record<string, any> = {};
          activitySnap.forEach((docSnap) => {
            activityMap[docSnap.id] = docSnap.data();
          });
          setDailyActivity(activityMap);
        } catch (err) {
          console.warn("Lỗi tải tiến độ học tập từ Firestore:", err);
        }
      } else if (user && user.isGuest) {
        // Load progress from localStorage for guests
        const localProgress = localStorage.getItem("de_vocab_guest_progress");
        if (localProgress) {
          try {
            setTopicProgress(JSON.parse(localProgress));
          } catch (e) {
            console.warn(e);
          }
        } else {
          setTopicProgress({});
        }

        // Load daily activity from localStorage for guests
        const localActivity = localStorage.getItem("de_vocab_guest_activity");
        if (localActivity) {
          try {
            setDailyActivity(JSON.parse(localActivity));
          } catch (e) {
            console.warn(e);
          }
        } else {
          setDailyActivity({});
        }
      } else {
        setTopicProgress({});
        setDailyActivity({});
      }
    }
    loadUserProgress();
  }, [user?.uid, user?.isGuest]);

  // Active game states
  const [activeGame, setActiveGame] = useState<{
    topicId: string;
    mode: "flashcard" | "matching" | "quiz" | "fill";
  } | null>(null);

  // Gamification reward announcement modal
  const [showRewardNotification, setShowRewardNotification] = useState<{
    xp: number;
    msg: string;
    levelUp?: boolean;
    level?: number;
  } | null>(null);

  // Firebase auth state listener
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      setLoading(true);
      if (firebaseUser) {
        try {
          const userDocRef = doc(db, "users", firebaseUser.uid);
          let userDoc = null;
          let hasPerms = true;
          try {
            userDoc = await getDoc(userDocRef);
          } catch (err) {
            console.warn("Firestore permissions unavailable, using local session:", err);
            hasPerms = false;
          }

          if (hasPerms && userDoc && userDoc.exists()) {
            const data = userDoc.data();
            const isAdminDefined = data.admin !== undefined;
            const adminVal = isAdminDefined ? data.admin : 0;

            setUser({
              uid: firebaseUser.uid,
              email: firebaseUser.email,
              ...data,
              admin: adminVal,
            });

            // If admin is undefined in Firestore, update it to 0 so it gets stored in Firebase
            if (!isAdminDefined && hasPerms) {
              try {
                await updateDoc(userDocRef, { admin: 0 });
              } catch (err) {
                console.warn("Failed to set default admin: 0 in Firestore:", err);
              }
            }

            // Auto update streak on login if needed
            updateUserStreak(firebaseUser.uid, { ...data, admin: adminVal });
          } else {
            // New user fallback profile
            const fallbackProfile = {
              uid: firebaseUser.uid,
              displayName: firebaseUser.displayName || firebaseUser.email?.split("@")[0] || "Học viên mới",
              email: firebaseUser.email,
              avatar: "🦊",
              xp: 150,
              level: 1,
              streak: 1,
              wordsLearnedCount: 0,
              lastActiveDate: new Date().toISOString(),
              admin: 0, // default admin status to 0
            };
            if (hasPerms) {
              try {
                await setDoc(userDocRef, fallbackProfile);
              } catch (err) {
                console.warn("Error creating user profile in Firestore:", err);
              }
            }
            setUser({
              uid: firebaseUser.uid,
              email: firebaseUser.email,
              ...fallbackProfile,
            });
          }
        } catch (error) {
          console.warn("Lỗi đồng bộ hồ sơ người dùng, sử dụng dự phòng:", error);
          setUser({
            isGuest: true,
            displayName: firebaseUser.displayName || "Khách bộ hành",
            avatar: "👤",
            xp: 150,
            level: 1,
            streak: 1,
            wordsLearnedCount: 0,
            lastActiveDate: new Date().toISOString(),
          });
        }
      } else {
        // Guest user loaded from LocalStorage
        const localGuest = localStorage.getItem("de_vocab_guest");
        if (localGuest) {
          setUser(JSON.parse(localGuest));
        } else {
          const newGuest = {
            isGuest: true,
            displayName: "Khách bộ hành",
            avatar: "👤",
            xp: 0,
            level: 1,
            streak: 1,
            wordsLearnedCount: 0,
            lastActiveDate: new Date().toISOString(),
          };
          localStorage.setItem("de_vocab_guest", JSON.stringify(newGuest));
          setUser(newGuest);
        }
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const updateUserStreak = async (uid: string, data: any) => {
    try {
      const today = new Date().toDateString();
      const lastActive = data.lastActiveDate ? new Date(data.lastActiveDate).toDateString() : "";

      if (today !== lastActive) {
        const yesterday = new Date();
        yesterday.setDate(yesterday.getDate() - 1);
        const yesterdayStr = yesterday.toDateString();

        let newStreak = data.streak || 1;
        if (lastActive === yesterdayStr) {
          newStreak += 1;
        } else if (lastActive !== today) {
          newStreak = 1; // reset streak if missed a day
        }

        const userDocRef = doc(db, "users", uid);
        try {
          await updateDoc(userDocRef, {
            streak: newStreak,
            lastActiveDate: new Date().toISOString(),
          });
        } catch (err) {
          console.warn("Firestore offline or locked, local streak updated only:", err);
        }

        setUser((prev: any) => (prev ? { ...prev, streak: newStreak } : null));
      }
    } catch (error) {
      console.warn("Lỗi cập nhật streak hằng ngày:", error);
    }
  };

  const handleSignOut = async () => {
    try {
      await signOut(auth);
      setUser(null);
      // Reset guest storage or reload
      const newGuest = {
        isGuest: true,
        displayName: "Khách bộ hành",
        avatar: "👤",
        xp: 0,
        level: 1,
        streak: 1,
        wordsLearnedCount: 0,
        lastActiveDate: new Date().toISOString(),
      };
      localStorage.setItem("de_vocab_guest", JSON.stringify(newGuest));
      setUser(newGuest);
      setActiveTab("home");
    } catch (error) {
      console.error("Đăng xuất thất bại:", error);
    }
  };

  const handleAuthSuccess = (userData: any) => {
    setUser(userData);
  };

  // Gamification: Earn XP logic
  const handleEarnXP = async (xpGained: number, wordsCountLearned: number) => {
    if (!user) return;

    const currentXp = user.xp || 0;
    const newXp = currentXp + xpGained;

    // Level up calculation: Each level requires 1000 XP
    const currentLevel = user.level || 1;
    const newLevel = Math.floor(newXp / 1000) + 1;
    const isLevelUp = newLevel > currentLevel;

    const newWordsCount = (user.wordsLearnedCount || 0) + wordsCountLearned;

    const updatedUser = {
      ...user,
      xp: newXp,
      level: newLevel,
      wordsLearnedCount: newWordsCount,
      lastActiveDate: new Date().toISOString(),
    };

    setUser(updatedUser);

    // Save to Firestore if registered, else localStorage
    if (!user.isGuest) {
      try {
        const userDocRef = doc(db, "users", user.uid);
        try {
          await updateDoc(userDocRef, {
            xp: newXp,
            level: newLevel,
            wordsLearnedCount: newWordsCount,
            lastActiveDate: new Date().toISOString(),
          });
        } catch (err) {
          console.warn("Firestore offline or locked, progress saved locally:", err);
        }
      } catch (error) {
        console.warn("Lỗi lưu điểm số hằng ngày:", error);
      }
    } else {
      localStorage.setItem("de_vocab_guest", JSON.stringify(updatedUser));
    }

    // Save daily activity progress
    const todayStr = getLocalDateString();
    const existingDay = dailyActivity[todayStr] || { words: 0, xp: 0 };
    const updatedDay = {
      words: existingDay.words + wordsCountLearned,
      xp: existingDay.xp + xpGained
    };
    const updatedDailyActivity = {
      ...dailyActivity,
      [todayStr]: updatedDay
    };
    setDailyActivity(updatedDailyActivity);

    if (!user.isGuest) {
      try {
        const activityDocRef = doc(db, "users", user.uid, "daily_activity", todayStr);
        await setDoc(activityDocRef, {
          date: todayStr,
          words: updatedDay.words,
          xp: updatedDay.xp
        }, { merge: true });
      } catch (err) {
        console.warn("Lỗi lưu hoạt động hằng ngày lên Firestore:", err);
      }
    } else {
      localStorage.setItem("de_vocab_guest_activity", JSON.stringify(updatedDailyActivity));
    }

    // Save Topic-specific progress
    if (activeGame) {
      const activeTopicId = activeGame.topicId;
      const topicWordsCount = wordsList.filter(w => w.topicId === activeTopicId).length || 1;
      
      const existingProgress = topicProgress[activeTopicId];
      const prevLearnedCount = existingProgress?.learnedWordsCount || 0;
      const newLearnedCount = Math.min(topicWordsCount, prevLearnedCount + wordsCountLearned);
      const isCompleted = newLearnedCount >= topicWordsCount;
      const newTopicXpGained = (existingProgress?.xpGained || 0) + xpGained;

      const progressData = {
        topicId: activeTopicId,
        completed: isCompleted,
        xpGained: newTopicXpGained,
        learnedWordsCount: newLearnedCount,
        lastStudied: new Date().toISOString()
      };

      const updatedTopicProgress = {
        ...topicProgress,
        [activeTopicId]: progressData
      };
      setTopicProgress(updatedTopicProgress);

      if (!user.isGuest) {
        try {
          const progressDocRef = doc(db, "users", user.uid, "progress", activeTopicId);
          await setDoc(progressDocRef, progressData);
        } catch (err) {
          console.warn("Không thể lưu tiến độ học tập của chủ đề lên Firestore:", err);
        }
      } else {
        localStorage.setItem("de_vocab_guest_progress", JSON.stringify(updatedTopicProgress));
      }
    }

    // Trigger reward panel overlay notification
    setShowRewardNotification({
      xp: xpGained,
      msg: `Bạn đã ôn tập thành công thêm ${wordsCountLearned} từ vựng mới thuộc chủ đề!`,
      levelUp: isLevelUp,
      level: newLevel,
    });
  };

  const handleUpdateUser = async (updatedFields: Partial<any>) => {
    if (!user) return;
    const updatedUser = { ...user, ...updatedFields };
    setUser(updatedUser);
    if (!user.isGuest) {
      try {
        const userDocRef = doc(db, "users", user.uid);
        await updateDoc(userDocRef, updatedFields);
      } catch (err) {
        console.warn("Lỗi cập nhật hồ sơ người dùng trên Firestore:", err);
      }
    } else {
      localStorage.setItem("de_vocab_guest", JSON.stringify(updatedUser));
    }
  };

  // Admin/Developer Helpers to add custom topics and words dynamically
  const handleAddWord = async (newWord: Word) => {
    if (!user || user.isGuest) {
      console.warn("Chỉ cho phép tài khoản Google thêm từ mới.");
      return false;
    }
    try {
      const wordDocRef = doc(db, "words", newWord.id);
      await setDoc(wordDocRef, newWord);
      setWordsList((prev) => [...prev, newWord]);
      setTopicsList((prevTopics) => 
        prevTopics.map((t) => 
          t.id === newWord.topicId ? { ...t, count: t.count + 1 } : t
        )
      );
      return true;
    } catch (err) {
      console.error("Lỗi thêm từ vựng mới lên Firestore:", err);
      // Fallback update local state
      setWordsList((prev) => [...prev, newWord]);
      return false;
    }
  };

  const handleAddTopic = async (newTopic: Topic) => {
    if (!user || user.isGuest) {
      console.warn("Chỉ cho phép tài khoản Google thêm chủ đề mới.");
      return false;
    }
    try {
      const topicDocRef = doc(db, "topics", newTopic.id);
      await setDoc(topicDocRef, newTopic);
      setTopicsList((prev) => {
        const updated = [...prev, newTopic];
        return updated.sort((a, b) => {
          const order = ["A1", "A2", "B1", "B2"];
          const levelDiff = order.indexOf(a.level) - order.indexOf(b.level);
          if (levelDiff !== 0) return levelDiff;
          return a.name.localeCompare(b.name);
        });
      });
      return true;
    } catch (err) {
      console.error("Lỗi thêm chủ đề mới lên Firestore:", err);
      // Fallback update local state
      setTopicsList((prev) => [...prev, newTopic]);
      return false;
    }
  };

  const handleDeleteWord = async (wordId: string) => {
    if (!user || user.isGuest) {
      console.warn("Chỉ cho phép tài khoản Google xóa từ vựng.");
      return false;
    }
    try {
      const wordDocRef = doc(db, "words", wordId);
      const wordToDelete = wordsList.find(w => w.id === wordId);
      await deleteDoc(wordDocRef);
      setWordsList((prev) => prev.filter(w => w.id !== wordId));
      if (wordToDelete) {
        setTopicsList((prevTopics) => 
          prevTopics.map((t) => 
            t.id === wordToDelete.topicId ? { ...t, count: Math.max(0, t.count - 1) } : t
          )
        );
      }
      return true;
    } catch (err) {
      console.error("Lỗi xóa từ vựng trên Firestore:", err);
      // Fallback: delete locally anyway
      setWordsList((prev) => prev.filter(w => w.id !== wordId));
      return false;
    }
  };

  const handleDeleteWordsByTopic = async (topicId: string) => {
    if (!user || user.isGuest) {
      console.warn("Chỉ cho phép tài khoản Google xóa từ vựng.");
      return { success: false, count: 0 };
    }
    const wordsToDelete = wordsList.filter(w => w.topicId === topicId);
    if (wordsToDelete.length === 0) {
      return { success: true, count: 0 };
    }

    try {
      // Use writeBatch to delete all words of this topic atomically
      const batch = writeBatch(db);
      wordsToDelete.forEach(w => {
        const wordDocRef = doc(db, "words", w.id);
        batch.delete(wordDocRef);
      });
      await batch.commit();

      setWordsList((prev) => prev.filter(w => w.topicId !== topicId));
      setTopicsList((prevTopics) => 
        prevTopics.map((t) => 
          t.id === topicId ? { ...t, count: 0 } : t
        )
      );
      return { success: true, count: wordsToDelete.length };
    } catch (err) {
      console.error("Lỗi xóa từ vựng hàng loạt theo chủ đề trên Firestore:", err);
      // Fallback: delete locally anyway
      setWordsList((prev) => prev.filter(w => w.topicId !== topicId));
      setTopicsList((prevTopics) => 
        prevTopics.map((t) => 
          t.id === topicId ? { ...t, count: 0 } : t
        )
      );
      return { success: false, count: wordsToDelete.length };
    }
  };

  const getFilteredWords = () => {
    if (!activeGame) return [];
    return wordsList.filter((w) => w.topicId === activeGame.topicId);
  };

  const getActiveTopicName = () => {
    if (!activeGame) return "";
    const activeTopic = topicsList.find(t => t.id === activeGame.topicId);
    if (activeTopic) {
      return `${activeTopic.name} (${activeTopic.nameDe})`;
    }
    return "Chủ đề ngẫu nhiên";
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] flex flex-col font-sans select-none">
      {/* Top Banner Navigation bar */}
      <Navbar
        user={user}
        activeTab={activeTab}
        onTabChange={(tab) => {
          setActiveTab(tab);
          setActiveGame(null); // Close game when shifting tabs
        }}
        onOpenAuth={() => setIsAuthOpen(true)}
        onSignOut={handleSignOut}
      />

      {/* Main Container Workspace */}
      <main className="flex-grow">
        {loading ? (
          <div className="py-24 text-center">
            <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-slate-500 font-semibold text-sm">Đang tải học viện tiếng Đức của bạn...</p>
          </div>
        ) : activeGame ? (
          /* Render Active Gamified Arena Section */
          <div className="py-8 bg-slate-50/50">
            {activeGame.mode === "flashcard" && (
              <FlashcardGame
                words={getFilteredWords()}
                topicName={getActiveTopicName()}
                onBack={() => setActiveGame(null)}
                onEarnXP={handleEarnXP}
              />
            )}
            {activeGame.mode === "matching" && (
              <MatchingGame
                words={getFilteredWords()}
                topicName={getActiveTopicName()}
                onBack={() => setActiveGame(null)}
                onEarnXP={handleEarnXP}
              />
            )}
            {activeGame.mode === "quiz" && (
              <QuizGame
                words={getFilteredWords()}
                topicName={getActiveTopicName()}
                onBack={() => setActiveGame(null)}
                onEarnXP={handleEarnXP}
              />
            )}
            {activeGame.mode === "fill" && (
              <FillBlankGame
                words={getFilteredWords()}
                topicName={getActiveTopicName()}
                onBack={() => setActiveGame(null)}
                onEarnXP={handleEarnXP}
              />
            )}
          </div>
        ) : (
          /* Standard Navigation Tab Switch Workspace */
          <div className="animate-fade-in">
            {activeTab === "home" && (
              <LandingPage
                user={user}
                topicsList={topicsList}
                wordsList={wordsList}
                topicProgress={topicProgress}
                onSelectTopicGame={(topicId, mode) => {
                  if (!user || user.isGuest) {
                    setIsAuthOpen(true);
                  } else {
                    setActiveGame({ topicId, mode });
                  }
                }}
                onOpenAuth={() => setIsAuthOpen(true)}
                onTabChange={setActiveTab}
              />
            )}
            {activeTab === "catalog" && (
              <LandingPage
                user={user}
                topicsList={topicsList}
                wordsList={wordsList}
                topicProgress={topicProgress}
                onSelectTopicGame={(topicId, mode) => {
                  if (!user || user.isGuest) {
                    setIsAuthOpen(true);
                  } else {
                    setActiveGame({ topicId, mode });
                  }
                }}
                onOpenAuth={() => setIsAuthOpen(true)}
                onTabChange={setActiveTab}
              />
            )}
            {activeTab === "leaderboard" && <Leaderboard />}
            {activeTab === "dashboard" && (
              <Dashboard
                user={user}
                topicsList={topicsList}
                wordsList={wordsList}
                topicProgress={topicProgress}
                dailyActivity={dailyActivity}
                onAddWord={handleAddWord}
                onAddTopic={handleAddTopic}
                onDeleteWord={handleDeleteWord}
                onDeleteWordsByTopic={handleDeleteWordsByTopic}
                onUpdateUser={handleUpdateUser}
                onNavigateToCatalog={() => {
                  setActiveTab("catalog");
                  setTimeout(() => {
                    document.getElementById("vocabulary-catalog-section")?.scrollIntoView({ behavior: "smooth" });
                  }, 100);
                }}
              />
            )}
          </div>
        )}
      </main>

      {/* Auth Modal Form */}
      <AuthModal
        isOpen={isAuthOpen}
        onClose={() => setIsAuthOpen(false)}
        onAuthSuccess={handleAuthSuccess}
      />

      {/* Gamification Reward Overlay Modal */}
      {showRewardNotification && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
          <div className="bg-white border border-slate-100 rounded-[32px] p-8 shadow-2xl max-w-sm text-center space-y-6 relative animate-scale-up">
            <button
              onClick={() => setShowRewardNotification(null)}
              className="absolute right-5 top-5 p-1.5 text-slate-400 hover:text-slate-600 rounded-full transition hover:bg-slate-50"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="w-20 h-20 bg-amber-50 rounded-full flex items-center justify-center mx-auto text-4xl animate-bounce">
              🎉
            </div>

            <div className="space-y-2">
              <h3 className="text-2xl font-black text-slate-800 tracking-tight font-sans">
                {showRewardNotification.levelUp ? "Thăng Cấp Rực Rỡ!" : "Tuyệt Vời Học Viên!"}
              </h3>
              <p className="text-slate-500 text-sm max-w-xs mx-auto leading-relaxed">
                {showRewardNotification.msg}
              </p>
            </div>

            {/* Achievement visual scores */}
            <div className="bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-100 rounded-2xl p-4 flex justify-center items-center gap-2">
              <Sparkles className="w-5 h-5 text-amber-500 fill-amber-500" />
              <span className="font-black text-amber-700 text-lg">+{showRewardNotification.xp} XP tích lũy</span>
            </div>

            {showRewardNotification.levelUp && (
              <div className="bg-gradient-to-r from-blue-500 to-indigo-600 text-white border border-blue-400 rounded-2xl p-4">
                <span className="text-[10px] font-bold uppercase tracking-widest block opacity-75">Học Viện Thăng Hạng</span>
                <span className="font-black text-xl">CHẠM CẤP ĐỘ {showRewardNotification.level}</span>
              </div>
            )}

            <button
              onClick={() => setShowRewardNotification(null)}
              className="w-full bg-slate-900 hover:bg-black text-white p-4 rounded-xl font-bold transition"
            >
              Tiếp tục hành trình
            </button>
          </div>
        </div>
      )}

      {/* Footer Section */}
      <footer className="bg-slate-950 text-slate-400 py-12 px-4 sm:px-6 lg:px-8 border-t border-slate-900">
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-8">
          <div>
            <div className="flex items-center gap-2 text-white font-black text-lg mb-4">
              <span className="text-2xl">🇩🇪</span>
              <span>Deutsch học viên</span>
            </div>
            <p className="text-slate-500 text-sm leading-relaxed max-w-sm">
              Hệ thống học từ vựng tiếng Đức bằng phương pháp gamification (game hóa) toàn diện nhất, đồng hành giúp bạn ghi nhớ sâu và đột phá phản xạ ngoại ngữ.
            </p>
          </div>

          <div>
            <h4 className="text-white font-bold text-sm mb-4">Môn Học Game Hóa</h4>
            <ul className="space-y-2.5 text-sm font-semibold">
              <li><button onClick={() => { setActiveTab("home"); window.scrollTo({ top: 0, behavior: "smooth" }); }} className="hover:text-white transition">Học từ vựng theo chủ đề</button></li>
              <li><button onClick={() => { setActiveTab("leaderboard"); window.scrollTo({ top: 0, behavior: "smooth" }); }} className="hover:text-white transition">Đua bảng xếp hạng tuần</button></li>
              <li><button onClick={() => { if (user) setActiveTab("dashboard"); else setIsAuthOpen(true); window.scrollTo({ top: 0, behavior: "smooth" }); }} className="hover:text-white transition">Phân tích Bảng điều khiển</button></li>
            </ul>
          </div>

          <div>
            <h4 className="text-white font-bold text-sm mb-4">Điều Khoản & Bảo Mật</h4>
            <p className="text-slate-500 text-xs leading-relaxed mb-3">
              Mọi dữ liệu từ vựng thuộc hệ thống chuẩn ngữ pháp CEFR A1-B1. Bản quyền © 2026.
            </p>
            <div className="flex gap-4 text-xs font-bold">
              <a href="#" className="hover:text-white transition">Điều khoản sử dụng</a>
              <a href="#" className="hover:text-white transition">Chính sách bảo mật</a>
            </div>
          </div>
        </div>
        <div className="max-w-7xl mx-auto border-t border-slate-900 mt-8 pt-6 text-center text-xs text-slate-600 font-bold">
          @2026 Deutsch lernen with Minh Thuận
        </div>
      </footer>
    </div>
  );
}
