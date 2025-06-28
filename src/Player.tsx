import React, { useEffect, useRef, useState } from "react";

interface Song {
    songName: string,
    artist: string,
    url: string
}

const songs:Song[] = [
  { songName: "", artist:"", url: "/songs/song1.mp3" },
];

type Mode = "normal" | "short" | "long";

const formatTime = (seconds: number) => {
  const m = Math.floor(seconds / 60);
  const s = Math.floor(seconds % 60);
  return `${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
};

const Player: React.FC = () => {
  const audioRef = useRef<HTMLAudioElement>(null);

  const [currentIndex, setCurrentIndex] = useState(0);
  const [mode, setMode] = useState<Mode>("normal");
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [duration, setDuration] = useState(0);
  const [startTime, setStartTime] = useState(0);
  const [zapActive, setZapActive] = useState(false);

  const [isPaused, setIsPaused] = useState(false);
  const [isShuffle, setIsShuffle] = useState(false);

  const sliceDuration = mode === "short" ? 15 : mode === "long" ? 45 : 0;
  const progressInterval = useRef<NodeJS.Timeout | null>(null);

  const currentSongs = songs;

  const clearTimers = () => {
    if (progressInterval.current) {
      clearInterval(progressInterval.current);
      progressInterval.current = null;
    }
  };

  const playCurrentSong = () => {
    const audio = audioRef.current;
    if (!audio) return;

    clearTimers();

    const song = currentSongs[currentIndex];
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
        audio.play().then(() => {
          progressInterval.current = setInterval(() => {
            const now = audio.currentTime;
            const elapsed = now - st;
            setProgress(elapsed);

            if (
              (mode !== "normal" && elapsed >= playDuration - 0.2) ||
              (mode === "normal" && now >= fullDuration)
            ) {
              audio.pause();
              clearTimers();

              if(zapActive){
                  const transitionAudio = new Audio("/effects/transition-1.wav");
                  transitionAudio.play();
    
                  transitionAudio.onended = () => {
                    goNextSong()
                  };            
              }
              else{
                  goNextSong();  
              }
            
            }
          }, 200);


        });
      }, 50);
    };
  };

  useEffect(() => {
    if (mode === "normal") setStartTime(0);
    else setStartTime(30);

    if (isPlaying) playCurrentSong();
  }, [mode]);

  useEffect(() => {
    if (isPlaying) playCurrentSong();
    else {
      clearTimers();
      const audio = audioRef.current;
      if (audio) audio.pause();
    }
    return () => clearTimers();
  }, [currentIndex, isPlaying]);

  const handleStart = () => {
    setIsPlaying(true);
    setCurrentIndex(0);
  };

  const handleStop = () => {
    setIsPlaying(false);
    setProgress(0);
    const audio = audioRef.current;
    if (audio) {
      audio.pause();
      audio.currentTime = 0;
    }
    clearTimers();
  };

  const handleZapToggle = () => {
    const zapAudio = new Audio(zapActive ? "/effects/zappin-out.wav" : "/effects/zappin-in.wav");
    zapAudio.play();
    setZapActive(!zapActive);
    if (!zapActive) {
      setMode("short");
    } else {
      setMode("normal");
    }
  };

  const handlePauseToggle = () => {
    const audio = audioRef.current;
    if (!audio) return;
  
    if (audio.paused) {
      audio.play();
      setIsPlaying(true);
    } else {
      audio.pause();
      setIsPlaying(false);
    }
  };
  
  const handleNextSong = () => {

    const audio = audioRef.current;
    audio?.pause();

    if(zapActive){
        const transitionAudio = new Audio("/effects/transition-1.wav");
        transitionAudio.play();

        transitionAudio.onended = () => {
          goNextSong();
        };            
    }
    else{
        goNextSong();
    }

    
  };

  const goNextSong = () => {
    setCurrentIndex((prev) => {
        if (isShuffle) {
          const next = Math.floor(Math.random() * songs.length);
          return next === prev ? (next + 1) % songs.length : next;
        } else {
          return (prev + 1) % songs.length;
        }
      });
  }
  
  const handlePrevSong = () => {
    setCurrentIndex((prev) => (prev - 1 + songs.length) % songs.length);
  };
  
  const handleSkipForward = () => {
    const audio = audioRef.current;
    if (!audio) return;
    audio.currentTime = Math.min(audio.currentTime + 5, audio.duration);
  };
  
  const handleSkipBackward = () => {
    const audio = audioRef.current;
    if (!audio) return;
    audio.currentTime = Math.max(audio.currentTime - 5, 0);
  };

  const actualProgress = mode === "normal" ? progress : progress + startTime;
  const totalLength = audioRef.current?.duration || duration;

  return (
    <div style={{display:"flex", gap:"1rem"}}>
        <div style={{width:"400px", backgroundColor:"black", padding:"1rem", borderRadius: "16px", lineHeight:"1.2"}}>
            <div>
                <img
                    src="/icons/musical-note-128.png"
                    alt="Music Note"
                    style={{
                    width: "100px",
                    height: "100px",
                    objectFit: "contain",
                    marginBottom: "0.5rem",
                    backgroundColor: "brown", 
                    padding:"1rem",
                    borderRadius: "16px",
                    }}
                    
                />
            </div>
            <h2>{currentSongs[currentIndex].songName}</h2>
            <h4>{currentSongs[currentIndex].artist}</h4>
            <audio ref={audioRef} preload="auto" />

            <div style={{ margin: "1rem 0" }}>
                <progress
                value={actualProgress}
                max={totalLength}
                style={{ width: "100%", height: "10px" }}
                />
                <div style={{ fontSize: "0.9rem", marginTop: "4px" }}>
                {formatTime(actualProgress)} / {formatTime(totalLength)}
                </div>
            </div>

                <div style={{ display: "flex", gap: "0.5rem", marginTop: "1rem", flexWrap: "wrap" }}>
                    <button className="music-player-button" onClick={handleSkipBackward}>⏪</button>
                    <button className="music-player-button" onClick={handlePrevSong}>⏮️</button>
                    <button className="music-player-button" onClick={handlePauseToggle}>{isPlaying ? "⏸️" : "▶️"}</button>
                    <button className="music-player-button" onClick={handleNextSong}>⏭️</button>
                    <button className="music-player-button" onClick={handleSkipForward}>⏩</button>
                    <button 
                    className={isShuffle ? "music-player-button-active": "music-player-button"}
                    onClick={() => {
                        setIsShuffle((prev) => !prev)
                        const transitionAudio2 = new Audio("/effects/transition-2.wav");
                        transitionAudio2.play();
                       
                        }
                    }>
                        🔀
                    </button>
                    <button 
                className={zapActive ? "music-player-button-active": "music-player-button"}
                onClick={handleZapToggle}>⚡</button>
                <div style={zapActive ? { display: "flex", gap:"0.5rem" }: { display:"none" }}>
                    {(["short", "long"] as Mode[]).map((m) => (
                    <button
                        key={m}
                        onClick={() => setMode(m)}
                        disabled={!zapActive}
                        className={mode === m ? "music-player-button-active" : "music-player-button"}
                    >
                        {m === "short" ? "15s" : "45s"}
                    </button>
                    ))}

                </div>

                </div>

            <div style={{ display: "flex", gap: "0.5rem"}}>
                
                

            </div>
        </div>
    </div>
  );
};

export default Player;