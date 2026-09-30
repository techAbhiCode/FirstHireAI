import { signInWithPopup, signInWithRedirect } from "firebase/auth";
import axios from "axios";
import { auth, provider } from "../utils/firebase";
import { FcGoogle } from "react-icons/fc";
import { FiX } from "react-icons/fi";
import { BiBrain } from "react-icons/bi";
import { SiKaios } from "react-icons/si";
import api from "../utils/axios";

import { useState } from "react";

export function LoginModal({ onClose, setUser }) {
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [showRedirectOption, setShowRedirectOption] = useState(false);

  const handleGoogleLogin = async () => {
    setLoading(true);
    setErrorMsg("");
    try {
      const result = await signInWithPopup(auth, provider);
      const token = await result.user.getIdToken();
      const response = await api.post("/api/auth/login", { token });
      if (response.data?.sessionId) {
        localStorage.setItem("sessionId", response.data.sessionId);
      }
      setUser(response.data.user);
      onClose();
    } catch (error) {
      console.error("Popup login error:", error);
      if (error.code === "auth/popup-blocked") {
        setShowRedirectOption(true);
        setErrorMsg("Browser ne popup block kiya. Niche diye button se Direct Sign In kijiye.");
      } else if (error.code === "auth/unauthorized-domain") {
        setErrorMsg("Domain Authorized nahi hai: Firebase Console me jakar first-hire-ai.vercel.app add kijiye.");
      } else if (error.code === "auth/popup-closed-by-user") {
        setErrorMsg("Google popup band kar diya gaya. Dobara click karke account choose kijiye.");
      } else if (error.code === "auth/cancelled-popup-request") {
        setErrorMsg("Login request cancel ho gayi. Dobara koshish kijiye.");
      } else {
        setErrorMsg(`${error.code || 'Error'}: ${error.message || 'Login failed'}`);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleRedirectLogin = async () => {
    setLoading(true);
    try {
      await signInWithRedirect(auth, provider);
    } catch (err) {
      setErrorMsg(err.message || "Redirect failed.");
      setLoading(false);
    }
  };

  return (
    <div className="
      fixed inset-0 z-50
      flex items-center justify-center
      bg-black/40 backdrop-blur-md
      px-4
    ">

      <div className="
        relative w-full max-w-sm
        bg-[#0A0A0A]/80 backdrop-blur-2xl
        border border-amber-200
        rounded-2xl
        overflow-hidden
        shadow-[0_8px_32px_rgba(0,0,0,0.25)]
      ">

        {/* glass sheen */}
        <div className="absolute inset-0 bg-gradient-to-br from-white/[0.08] via-transparent to-transparent pointer-events-none" />

        {/* Header */}
        <div className="relative p-7">

          <button
            onClick={onClose}
            className="
              absolute top-4 right-4
              text-white/30 hover:text-white
              transition-colors
            "
          >
            <FiX size={16} />
          </button>

          <h2 className="
            text-lg
            font-bold
            text-center
            mb-2
            text-white
          ">
            Sign in to{" "}
            <span className="font-extrabold text-lg tracking-tight text-white">
              Fresher.AI
            </span>
          </h2>

          <p className="
            text-white/45
            text-center
            text-xs
          ">
            Continue your AI interview journey
          </p>

          {/* Google */}
          <div className="mt-7 space-y-3">
            <button
              onClick={handleGoogleLogin}
              disabled={loading}
              className="
                w-full
                flex items-center justify-center gap-3
                py-3
                rounded-xl
                border border-white/15
                bg-white/10 backdrop-blur-md
                hover:border-white/25
                hover:bg-white/[0.14]
                disabled:opacity-50
                shadow-inner
                transition-all
              "
            >
              <FcGoogle size={18} />
              <span className="text-white font-medium text-sm">
                {loading ? "Signing in..." : "Continue with Google (Popup)"}
              </span>
            </button>

            {showRedirectOption && (
              <button
                onClick={handleRedirectLogin}
                disabled={loading}
                className="
                  w-full
                  flex items-center justify-center gap-3
                  py-2.5
                  rounded-xl
                  border border-amber-400/40
                  bg-amber-500/20 backdrop-blur-md
                  hover:bg-amber-500/30
                  text-amber-200 font-medium text-xs
                  transition-all
                "
              >
                <span>Popup blocked? Click here for Direct Sign In</span>
              </button>
            )}

            {errorMsg && (
              <p className="text-red-400 text-xs text-center mt-2 px-1">
                {errorMsg}
              </p>
            )}
          </div>

        </div>

        {/* Bottom */}
        <div className="
          relative
          border-t border-white/10
          bg-black/30
          p-4
          text-center
        ">
          <p className="text-white/30 text-xs">
            Secure authentication powered by Firebase
          </p>
        </div>

      </div>
    </div>
  );
}