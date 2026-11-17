import { useState, useRef, useEffect, useCallback } from "react";
import type { Song, Mode } from "../types/player";

export const useAudioPlayer = () => {
  const audioRef = useRef<HTMLAudioElement>(null);
  const progressInterval = useRef<NodeJS.Timeout | null>(null);

  const [songs, setSongs] = useState<Song[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [mode, setMode] = useState<Mode>("normal");
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [duration, setDuration] = useState(0);
  const [startTime, setStartTime] = useState(0);
  const [zapActive, setZapActive] = useState(false);
  const [volume, setVolume] = useState(1);
  const [isMuted, setIsMuted] = useState(false);
  const [isShuffle, setIsShuffle] = useState(false);

  const sliceDuration = mode === "short" ? 15 : mode === "long" ? 45 : 0;

  const clearTimers = () => {
    if (progressInterval.current) {
      clearInterval(progressInterval.current);
      progressInterval.current = null;
    }
  };

  const goNextSong = useCallback(() => {
    setCurrentIndex((prev) => {
      if (isShuffle && songs.length > 1) {
        let nextIndex;
        do {
          nextIndex = Math.floor(Math.random() * songs.length);
        } while (nextIndex === prev);
        return nextIndex;
      } else {
        return (prev + 1) % songs.length;
      }
    });
  }, [isShuffle, songs.length]);

  const handleAudioError = useCallback(() => {
    alert("Şarkı yüklenirken bir hata oluştu. Lütfen URL'yi kontrol edin veya sonraki şarkıya geçin.");
    setIsPlaying(false);
    clearTimers();
  }, []);

  const playCurrentSong = useCallback(() => {
    if (songs.length === 0) {
      setIsPlaying(false);
      return;
    }

    const audio = audioRef.current;
    if (!audio) return;

    clearTimers();

    const song = songs[currentIndex];
    if (!song?.url) {
      setIsPlaying(false);
      return;
    }

    audio.src = song.url;
    audio.load();

    audio.onloadedmetadata = () => {
      const fullDuration = audio.duration;
      const st = mode === "normal" ? 0 : 30;
      audio.currentTime = st;
      setStartTime(st);

      const playDuration =
        mode === "normal" ? fullDuration : Math.min(sliceDuration, fullDuration - st);

      setDuration(playDuration);
      setProgress(0);

      setTimeout(() => {
        audio.volume = isMuted ? 0 : volume;
        audio
          .play()
          .then(() => {
            setIsPlaying(true);
            progressInterval.current = setInterval(() => {
              const now = audio.currentTime;
              const elapsed = now - st;
              setProgress(elapsed);

              if (
                (mode !== "normal" && elapsed >= playDuration - 0.2) ||
                (mode === "normal" && now >= fullDuration - 0.2)
              ) {
                audio.pause();
                clearTimers();

                if (zapActive) {
                  const transitionAudio = new Audio("/effects/transition-1.wav");
                  transitionAudio.play().catch((e) => console.error(e));
                  transitionAudio.onended = () => goNextSong();
                } else {
                  goNextSong();
                }
              }
            }, 200);
          })
          .catch((error) => {
            console.error("Oynatma hatası:", error);
            setIsPlaying(false);
          });
      }, 50);
    };
  }, [currentIndex, mode, sliceDuration, zapActive, goNextSong, songs, isMuted, volume]);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;
    audio.addEventListener("error", handleAudioError);
    return () => {
      audio.removeEventListener("error", handleAudioError);
    };
  }, [handleAudioError]);

  useEffect(() => {
    if (isPlaying) {
      playCurrentSong();
    } else {
      clearTimers();
      audioRef.current?.pause();
    }
  }, [currentIndex, isPlaying, playCurrentSong]);

  useEffect(() => {
    if (mode === "normal") setStartTime(0);
    else setStartTime(30);
    if (isPlaying) playCurrentSong();
  }, [mode, isPlaying, playCurrentSong]);

  // Kontrol fonksiyonları
  const togglePlay = () => {
    if (isPlaying) {
      audioRef.current?.pause();
      setIsPlaying(false);
    } else {
      if (songs.length === 0) {
        alert("Önce şarkı yüklemelisiniz!");
        return;
      }
      setIsPlaying(true);
    }
  };

  const handleNext = () => {
    audioRef.current?.pause();
    if (zapActive) {
      const transitionAudio = new Audio("/effects/transition-1.wav");
      transitionAudio.play().catch((e) => console.error(e));
      transitionAudio.onended = () => goNextSong();
    } else {
      goNextSong();
    }
  };

  const handlePrev = () => {
    audioRef.current?.pause();
    setCurrentIndex((prev) => (prev - 1 + songs.length) % songs.length);
  };

  const handleZapToggle = () => {
    const zapAudio = new Audio(zapActive ? "/effects/zappin-out.wav" : "/effects/zappin-in.wav");
    zapAudio.play().catch((e) => console.error(e));
    setZapActive((prev) => {
      const nextState = !prev;
      setMode(nextState ? "short" : "normal");
      return nextState;
    });
  };

  const currentSong = songs[currentIndex];
  const actualProgress = mode === "normal" ? progress : progress + startTime;
  const totalLength = audioRef.current?.duration || duration;

  return {
    audioRef,
    songs,
    setSongs,
    currentIndex,
    setCurrentIndex,
    mode,
    setMode,
    isPlaying,
    setIsPlaying,
    volume,
    setVolume,
    isMuted,
    setIsMuted,
    isShuffle,
    setIsShuffle,
    zapActive,
    currentSong,
    actualProgress,
    totalLength,
    togglePlay,
    handleNext,
    handlePrev,
    handleZapToggle,
  };
};