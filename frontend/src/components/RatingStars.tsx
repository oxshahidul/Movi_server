"use client";

import React, { useState } from "react";
import { Star } from "lucide-react";
import { useAuthStore } from "../store/useAuthStore";
import { fetchApi } from "../lib/api";

interface RatingStarsProps {
  contentId: string;
  contentType: "MOVIE" | "SERIES";
  currentRating?: number | string | null;
  userInitialRating?: number | null;
}

export default function RatingStars({
  contentId,
  contentType,
  currentRating,
  userInitialRating,
}: RatingStarsProps) {
  const { user, openAuthModal } = useAuthStore();
  const [hovered, setHovered] = useState<number | null>(null);
  const [userRating, setUserRating] = useState<number | null>(userInitialRating || null);
  const [displayAverage, setDisplayAverage] = useState<string | number | null>(currentRating || null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [toast, setToast] = useState<string | null>(null);

  const handleRate = async (star: number) => {
    if (!user) {
      openAuthModal("login");
      return;
    }

    try {
      setIsSubmitting(true);
      const res = await fetchApi("/library/rate", {
        method: "POST",
        body: JSON.stringify({
          contentId,
          contentType,
          rating: star,
        }),
      });

      if (res.success && res.data) {
        setUserRating(res.data.userRating);
        setDisplayAverage(res.data.averageRating);
        setToast(`You rated this ${star}/10!`);
        setTimeout(() => setToast(null), 3000);
      }
    } catch (err: any) {
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex flex-col sm:flex-row sm:items-center gap-3 p-3.5 rounded-2xl bg-cinema-900/60 border border-cinema-800">
      <div className="flex items-center space-x-1.5">
        <span className="text-xs font-bold text-white uppercase tracking-wider">
          Community:
        </span>
        <span className="flex items-center space-x-1 text-amber-400 font-extrabold text-sm">
          <Star className="w-4 h-4 fill-amber-400" />
          <span>{displayAverage || "0.0"} / 10</span>
        </span>
      </div>

      <div className="hidden sm:block h-4 w-px bg-cinema-700/60" />

      {/* 10 Star Interactive Rating */}
      <div className="flex items-center space-x-1">
        <span className="text-xs text-cinema-muted mr-1">Your Rating:</span>
        <div className="flex items-center space-x-0.5">
          {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((star) => {
            const isFilled =
              hovered !== null ? star <= hovered : userRating !== null && star <= userRating;

            return (
              <button
                key={star}
                type="button"
                disabled={isSubmitting}
                onMouseEnter={() => setHovered(star)}
                onMouseLeave={() => setHovered(null)}
                onClick={() => handleRate(star)}
                className="p-0.5 text-cinema-700 hover:scale-125 transition-transform"
                title={`Rate ${star}/10`}
              >
                <Star
                  className={`w-3.5 h-3.5 transition-colors ${
                    isFilled ? "fill-amber-400 text-amber-400" : "text-cinema-700 hover:text-amber-300"
                  }`}
                />
              </button>
            );
          })}
        </div>
        {userRating && (
          <span className="text-xs font-mono font-bold text-amber-300 ml-1.5">
            ({userRating}/10)
          </span>
        )}
      </div>

      {toast && (
        <span className="text-[11px] font-semibold text-emerald-400 animate-fade-in sm:ml-auto">
          {toast}
        </span>
      )}
    </div>
  );
}
