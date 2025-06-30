import React, { useEffect, useRef, useState, useCallback } from "react";
import List from "./List";

interface Song {
  songName: string;
  artist: string;
  url: string;
}

// Şarkı listesi örneği. Gerçek URL'leri buraya eklemelisiniz.
// Eğer bir URL geçersizse (dosya yoksa), hata mesajı görünecektir.
// const songs: Song[] = [
//   { songName: "Song Title 1", artist: "Artist 1", url: "/songs/song1.mp3" },
//   { songName: "Song Title 2", artist: "Artist 2", url: "/songs/song2.mp3" },
//   { songName: "Invalid Song", artist: "Error Artist", url: "/nonexistent-song.mp3" }, // Hatalı URL testi için
// ];

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
  const [songs, setSongs] = useState<Song[] | []>([]);
  const [volume, setVolume] = useState(1);
  const [isMuted, setIsMuted] = useState(false);

  // const [isPaused, setIsPaused] = useState(false); // Bu state kullanılmıyor gibi duruyor
  const [isShuffle, setIsShuffle] = useState(false);

  const sliceDuration = mode === "short" ? 15 : mode === "long" ? 45 : 0;
  const progressInterval = useRef<NodeJS.Timeout | null>(null);

  const clearTimers = () => {
    if (progressInterval.current) {
      clearInterval(progressInterval.current);
      progressInterval.current = null;
    }
  };

  // goNextSong fonksiyonunu useCallback ile sarmalıyoruz
  // Bu, useEffect'in bağımlılık dizisindeki referansının değişmesini engeller.
  const goNextSong = useCallback(() => {
    setCurrentIndex((prev) => {
      if (isShuffle) {
        // Rastgele bir sonraki şarkıyı seç
        let nextIndex;
        do {
          nextIndex = Math.floor(Math.random() * songs.length);
        } while (nextIndex === prev && songs.length > 1); // Aynı şarkıyı tekrar seçmemeye çalış
        return nextIndex;
      } else {
        // Sıradaki şarkıya geç
        return (prev + 1) % songs.length;
      }
    });
  }, [isShuffle, songs]); // isShuffle değiştiğinde fonksiyon yenilenebilir

  // Hata durumunda çalışacak callback
  const handleAudioError = useCallback(() => {
    alert(
      "Şarkı yüklenirken bir hata oluştu. Lütfen URL'yi kontrol edin veya sonraki şarkıya geçin."
    );
    setIsPlaying(false); // Hata durumunda çalmayı durdur
    clearTimers(); // Timers'ı temizle
  }, []); // Bağımlılığı yok, sadece bir kez oluşur

  // playCurrentSong fonksiyonu useCallback ile sarmalanmalı,
  // çünkü diğer useEffect'lerde bağımlılık olarak kullanılıyor.
  const playCurrentSong = useCallback(() => {

    if (songs.length === 0) {
      alert("Şarkı listesi boş");
      setIsPlaying(false);
      return;
    }

    const audio = audioRef.current;
    if (!audio) return;

    clearTimers();

    const song = songs[currentIndex];
    if (song?.url === null || song?.url === "") {
      alert("Şarkı URL'i boş veya null");
      setIsPlaying(false);
      return;
    }

    // Önceki hata dinleyicisini temizlemek ve yenisini atamak için iyi bir yer.
    // Ancak handleError'ı useEffect içinde global olarak bir kere eklediğimiz için burada tekrar eklemeye gerek yok.
    // Sadece eski bir yüklü src'yi temizleyip, yeni src'yi atamak yeterli.
    audio.src = song?.url;
    audio.load(); // Yükleme işlemini başlat

    audio.onloadedmetadata = () => {
      const fullDuration = audio.duration;
      const st = mode === "normal" ? 0 : 30; // Start time is only 30s in non-normal modes
      audio.currentTime = st;
      setStartTime(st);

      const playDuration =
        mode === "normal"
          ? fullDuration
          : Math.min(sliceDuration, fullDuration - st);

      setDuration(playDuration);
      setProgress(0);

      // Küçük bir gecikme ile çalmayı başlat, bazen onloadedmetadata hemen currentTime set etmeyebilir
      setTimeout(() => {
        audio.volume = isMuted ? 0 : volume;
        audio
          .play()
          .then(() => {
            setIsPlaying(true); // Çalma başarılı olduğunda isPlaying'i ayarla
            progressInterval.current = setInterval(() => {
              const now = audio.currentTime;
              const elapsed = now - st;
              setProgress(elapsed);

              // Şarkının bitiş kontrolü
              if (
                (mode !== "normal" && elapsed >= playDuration - 0.2) || // Slice modunda bitişe yakınsa
                (mode === "normal" && now >= fullDuration - 0.2) // Normal modda bitişe yakınsa
              ) {
                audio.pause();
                clearTimers();

                if (zapActive) {
                  const transitionAudio = new Audio(
                    "/effects/transition-1.wav"
                  );
                  transitionAudio
                    .play()
                    .catch((e) => console.error("Geçiş sesi çalma hatası:", e)); // Hata yakalama
                  transitionAudio.onended = () => {
                    goNextSong();
                  };
                } else {
                  goNextSong();
                }
              }
            }, 200); // Progress update interval
          })
          .catch((error) => {
            // audio.play() Promise'i tarafından yakalanan hatalar (örn. Autoplay engellendi)
            console.error("Şarkı çalma hatası (play() Promise):", error);
            // Kullanıcı etkileşimi olmadan otomatik oynatma engellenmiş olabilir
            setIsPlaying(false);
            alert(
              "Şarkı otomatik olarak başlatılamadı. Oynatma düğmesine tıklamanız gerekebilir."
            );
          });
      }, 50); // Small timeout to ensure currentTime is set
    };
  }, [currentIndex, mode, sliceDuration, zapActive, goNextSong, songs]);

  // Sadece bir kez Audio elementine hata dinleyicisini ekler
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    audio.addEventListener("error", handleAudioError);

    // Bileşen unmount edildiğinde olay dinleyicisini kaldır
    return () => {
      audio.removeEventListener("error", handleAudioError);
    };
  }, [handleAudioError]); // handleAudioError değiştiğinde (ki değişmemeli) tekrar ekler

  useEffect(() => {
    if (isPlaying) {
      playCurrentSong();
    } else {
      clearTimers();
      const audio = audioRef.current;
      if (audio) audio.pause();
    }
    // `playCurrentSong` useCallback ile sarmalandığı için buraya eklemeliyiz.
    // Ancak `currentIndex` veya `isPlaying` değiştiğinde `playCurrentSong` çağrıldığı için
    // `playCurrentSong`'u doğrudan buraya eklememiz mantıksız olabilir.
    // Önceki `useEffect`'i [mode] bağımlılığıyla koruyup, bu `useEffect`i sadece `isPlaying` ve `currentIndex` yönetimi için kullanabiliriz.
  }, [currentIndex, isPlaying, playCurrentSong]);

  useEffect(() => {
    if (mode === "normal") setStartTime(0);
    else setStartTime(30);

    // Eğer zaten çalıyorsa, modu değiştirdiğimizde şarkıyı yeniden yükle
    if (isPlaying) playCurrentSong();
  }, [mode, isPlaying, playCurrentSong]); // isPlaying ve playCurrentSong eklendi

  const handleStartToggle = () => {
    setIsPlaying(true);
    setCurrentIndex(0); // İlk şarkıdan başla
    // playCurrentSong useEffect tarafından tetiklenecek
  };

  // const handleStop = () => {
  //   setIsPlaying(false);
  //   setProgress(0);
  //   const audio = audioRef.current;
  //   if (audio) {
  //     audio.pause();
  //     audio.currentTime = 0;
  //   }
  //   clearTimers();
  // };

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const vol = parseFloat(e.target.value);
    setVolume(vol);
    if (audioRef.current) {
      audioRef.current.volume = vol;
      setIsMuted(vol === 0);
    }
  };

  const toggleMute = () => {
    if (!audioRef.current) return;
    if (isMuted) {
      audioRef.current.volume = volume || 1;
      setIsMuted(false);
    } else {
      audioRef.current.volume = 0;
      setIsMuted(true);
    }
  };

  const handleZapToggle = () => {
    const zapAudio = new Audio(
      zapActive ? "/effects/zappin-out.wav" : "/effects/zappin-in.wav"
    );
    zapAudio.play().catch((e) => console.error("Zap sesi çalma hatası:", e)); // Hata yakalama
    setZapActive((prev) => !prev);
    // Eğer zapActive false ise (yani açılıyorsa) moda "short" olarak ayarla,
    // yoksa (kapanıyorsa) "normal" moda dön.
    if (!zapActive) {
      // Şu an aktif değilse, yani açılıyor
      setMode("short");
    } else {
      // Şu an aktifse, yani kapanıyor
      setMode("normal");
    }
  };

  const handlePauseToggle = () => {
    const audio = audioRef.current;
    if (!audio) return;

    if (audio.paused) {
      audio
        .play()
        .then(() => setIsPlaying(true))
        .catch((error) => {
          console.error("Çalma düğmesiyle başlatma hatası:", error);
          alert("Şarkı başlatılamadı. Tarayıcı ayarlarınızı kontrol edin.");
        });
    } else {
      audio.pause();
      setIsPlaying(false);
    }
  };

  const handleNextSong = () => {
    const audio = audioRef.current;
    if (audio) audio.pause(); // Şarkıyı durdur

    if (zapActive) {
      const transitionAudio = new Audio("/effects/transition-1.wav");
      transitionAudio
        .play()
        .catch((e) => console.error("Geçiş sesi çalma hatası:", e)); // Hata yakalama
      transitionAudio.onended = () => {
        goNextSong();
      };
    } else {
      goNextSong();
    }
  };

  const handlePrevSong = () => {
    const audio = audioRef.current;
    if (audio) audio.pause(); // Önceki şarkıya geçerken mevcut şarkıyı durdur
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

  const currentSong = songs[currentIndex];
  // Progress ve toplam uzunluk hesaplamaları
  const actualProgress = mode === "normal" ? progress : progress + startTime;
  const totalLength = audioRef.current?.duration || duration; // duration state'i metadata yüklenmeden önce 0 olabilir

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && file.type === "audio/mpeg") {
      const newSong: Song = {
        songName: file.name,
        artist: "Yüklenen Şarkı",
        url: URL.createObjectURL(file),
      };
      setSongs((prev) => [...prev, newSong]);
    }
  };

  return (
    <div style={{ display: "flex", gap: "1rem" }}>
      <div
        style={{
          width: "400px",
          backgroundColor: "black",
          padding: "1rem",
          borderRadius: "16px",
          lineHeight: "1.2",
        }}
      >
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
              padding: "1rem",
              borderRadius: "16px",
            }}
          />
        </div>
        {/* currentSong objesinin tanımlı olduğundan emin olun */}
        <h2>{currentSong ? currentSong.songName : "No Song Selected"}</h2>
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

        <div
          style={{
            display: "flex",
            gap: "0.5rem",
            marginTop: "1rem",
            flexWrap: "wrap",
          }}
        >
          <button className="music-player-button" onClick={handleSkipBackward}>
            ⏪
          </button>
          <button className="music-player-button" onClick={handlePrevSong}>
            ⏮️
          </button>
          <button
            className="music-player-button"
            onClick={isPlaying ? handlePauseToggle : handleStartToggle}
          >
            {isPlaying ? "⏸️" : "▶️"}
          </button>
          <button className="music-player-button" onClick={handleNextSong}>
            ⏭️
          </button>
          <button className="music-player-button" onClick={handleSkipForward}>
            ⏩
          </button>
          <button
            className={
              isShuffle ? "music-player-button-active" : "music-player-button"
            }
            onClick={() => {
              setIsShuffle((prev) => !prev);
              const transitionAudio2 = new Audio("/effects/transition-2.wav");
              transitionAudio2
                .play()
                .catch((e) => console.error("Shuffle sesi çalma hatası:", e)); // Hata yakalama
            }}
          >
            🔀
          </button>
          <button
            className={
              zapActive ? "music-player-button-active" : "music-player-button"
            }
            onClick={handleZapToggle}
          >
            ZAP
          </button>
          <div
            style={
              zapActive
                ? { display: "flex", gap: "0.5rem" }
                : { display: "none" }
            }
          >
            {(["short", "long"] as Mode[]).map((m) => (
              <button
                key={m}
                onClick={() => setMode(m)}
                disabled={!zapActive}
                className={
                  mode === m
                    ? "music-player-button-active"
                    : "music-player-button"
                }
              >
                {m === "short" ? "15s" : "45s"}
              </button>
            ))}
          </div>
        </div>

        <div style={{ display: "flex", marginTop: "0.5rem", color: "white" }}>
          <button
            className="music-player-button-long"
            onClick={toggleMute}
            style={{ marginBottom: "0.5rem" }}
          >
            {isMuted || volume === 0
              ? `🔇 ${Math.round((isMuted ? 0 : volume) * 100)}%`
              : volume < 0.5
              ? `🔉 ${Math.round((isMuted ? 0 : volume) * 100)}%`
              : `🔊 ${Math.round((isMuted ? 0 : volume) * 100)}%`}
          </button>
          <div className="volume-bar">
            <input
              type="range"
              min="0"
              max="1"
              step="0.01"
              value={isMuted ? 0 : volume}
              onChange={handleVolumeChange}
              style={{ width: "100%", backgroundColor: "#1a1a1a" }}
            />
          </div>
        </div>
      </div>
      <div style={{ marginTop: "1rem" }}>
        <input
          id="upload-input"
          type="file"
          accept=".mp3"
          onChange={handleFileUpload}
          style={{ display: "none" }}
        />
        <label
          htmlFor="upload-input"
          style={{ display: "flex", cursor: "pointer", marginLeft: "0.5rem" }}
        >
          <img
            src="/icons/cloud-arrow-up-solid-white.svg"
            alt="Upload"
            style={{
              width: "20px",
              height: "20px",
              objectFit: "contain",
              backgroundColor: "#1a1a1a",
              padding: "1rem",
              borderRadius: "8px",
            }}
          />
          <div style={{ alignContent: "center", paddingInline: "0.5rem" }}>
            {" "}
            Upload your song{" "}
          </div>
        </label>

        {songs.length > 0 && (
          <List
            songs={songs}
            currentIndex={currentIndex}
            onSelect={(index) => {
              setCurrentIndex(index);
              setIsPlaying(true); // Tıklanınca direkt çalsın
            }}
          />
        )}
      </div>
    </div>
  );
};

export default Player;
