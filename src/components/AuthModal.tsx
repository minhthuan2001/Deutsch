import React, { useState } from "react";
import { auth, db } from "../firebase";
import {
  GoogleAuthProvider,
  signInWithPopup
} from "firebase/auth";
import { doc, setDoc, getDoc } from "firebase/firestore";
import { X, Check, AlertCircle, ShieldCheck } from "lucide-react";

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAuthSuccess: (user: any) => void;
}

export default function AuthModal({ isOpen, onClose, onAuthSuccess }: AuthModalProps) {
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const handleGoogleSignIn = async () => {
    setError(null);
    setSuccess(null);
    setLoading(true);
    try {
      const provider = new GoogleAuthProvider();
      const userCredential = await signInWithPopup(auth, provider);
      const user = userCredential.user;

      // Fetch user info or create if it doesn't exist
      const userDocRef = doc(db, "users", user.uid);
      const userDoc = await getDoc(userDocRef);

      let profileData: any = {};
      if (userDoc.exists()) {
        profileData = userDoc.data();
        if (profileData.admin === undefined) {
          profileData.admin = 0;
          await setDoc(userDocRef, { ...profileData, admin: 0 });
        }
      } else {
        // Create profile for new Google user
        profileData = {
          uid: user.uid,
          displayName: user.displayName || "Khách bộ hành",
          email: user.email || "",
          avatar: "🦊", // default avatar
          xp: 150, // starting gift XP
          level: 1,
          streak: 1,
          wordsLearnedCount: 0,
          lastActiveDate: new Date().toISOString(),
          admin: 0, // default admin status to 0
        };
        await setDoc(userDocRef, profileData);
      }

      onAuthSuccess({ ...user, ...profileData });
      setSuccess("Đăng nhập bằng Google thành công!");
      setTimeout(() => {
        onClose();
      }, 1000);
    } catch (err: any) {
      console.error(err);
      setError("Không thể đăng nhập bằng Google: " + (err.code === "auth/popup-closed-by-user" ? "Hộp thoại đăng nhập bị đóng." : err.message));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in">
      <div className="relative w-full max-w-sm bg-white border border-slate-100 rounded-3xl shadow-2xl p-8 overflow-y-auto max-h-[90vh]">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute right-6 top-6 p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-50 rounded-full transition"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Brand Header */}
        <div className="text-center mb-8">
          <span className="text-5xl block mb-3">🇩🇪</span>
          <h2 className="text-2xl font-black text-slate-800 tracking-tight font-sans">
            Đăng Nhập Học Viện
          </h2>
          <p className="text-slate-500 text-sm mt-1.5 leading-relaxed">
            Đăng nhập nhanh với Google để lưu tiến trình học tập, mở rộng vốn từ và tham gia bảng xếp hạng!
          </p>
        </div>

        {/* Feedback Messages */}
        {error && (
          <div className="p-3 bg-rose-50 border border-rose-100 text-rose-700 text-xs font-semibold rounded-xl flex gap-2 items-center mb-4">
            <AlertCircle className="w-4 h-4 text-rose-500 shrink-0" />
            <span>{error}</span>
          </div>
        )}
        {success && (
          <div className="p-3 bg-emerald-50 border border-emerald-100 text-emerald-700 text-xs font-semibold rounded-xl flex gap-2 items-center mb-4">
            <Check className="w-4 h-4 text-emerald-500 shrink-0" />
            <span>{success}</span>
          </div>
        )}

        {/* Google Sign In Button */}
        <button
          type="button"
          onClick={handleGoogleSignIn}
          disabled={loading}
          className="w-full border border-slate-200 hover:bg-slate-50 text-slate-700 font-bold p-3.5 rounded-2xl tracking-wide transition text-sm flex items-center justify-center gap-3 shadow-sm bg-white disabled:opacity-50"
        >
          {loading ? (
            <span className="w-5 h-5 border-2 border-slate-400 border-t-transparent rounded-full animate-spin"></span>
          ) : (
            <>
              <svg className="w-5 h-5 shrink-0" viewBox="0 0 24 24">
                <path
                  fill="#4285F4"
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                />
                <path
                  fill="#34A853"
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                />
                <path
                  fill="#FBBC05"
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l3.66-2.85z"
                />
                <path
                  fill="#EA4335"
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.85c.87-2.6 3.3-4.53 12-4.53z"
                />
              </svg>
              <span>Đăng nhập với Google</span>
            </>
          )}
        </button>

        {/* Security Guard Information */}
        <div className="flex items-center gap-1.5 justify-center mt-6 text-[10px] text-slate-400 font-bold">
          <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
          <span>Hệ thống bảo mật Firebase Auth bảo vệ</span>
        </div>
      </div>
    </div>
  );
}
