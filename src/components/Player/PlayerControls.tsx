import React, { type RefObject } from 'react'
import type { Song } from '../../types/player';

type SetState<T> = React.Dispatch<React.SetStateAction<T>>;

interface PlayerControlsProps {
    audioRef: RefObject<HTMLAudioElement | null>;
    isPlaying: boolean;
    setIsPlaying: SetState<boolean>;
    isShuffle: boolean;
    setIsShuffle: SetState<boolean>;
    zapActive: boolean;
    songs: Song[] | [];
    setCurrentIndex: SetState<number>;
    handleNext: () => void; // <-- Eklendi
    handlePrev: () => void; // <-- Eklendi
}

const PlayerControls: React.FC<PlayerControlsProps> = ({
    audioRef,
    isPlaying,
    setIsPlaying,
    isShuffle,
    setIsShuffle,
    setCurrentIndex,
    handleNext, // <-- Eklendi
    handlePrev, // <-- Eklendi
}) => {

    const handleStartToggle = () => {
        setIsPlaying(true);
        setCurrentIndex(0); // İlk şarkıdan başla
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

    return (
        <div style={{
            display: "flex",
            gap: "0.5rem",
            flexWrap: "wrap",
        }}
        >
            <button className="music-player-button" onClick={handleSkipBackward}>
                ⏪
            </button>
            <button className="music-player-button" onClick={handlePrev}> {/* handlePrevSong yerine hook'tan gelen handlePrev */}
                ⏮️
            </button>
            <button
                className="music-player-button"
                onClick={isPlaying ? handlePauseToggle : handleStartToggle}
            >
                {isPlaying ? "⏸️" : "▶️"}
            </button>
            <button className="music-player-button" onClick={handleNext}> {/* handleNextSong yerine hook'tan gelen handleNext */}
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
                        .catch((e) => console.error("Shuffle sesi çalma hatası:", e));
                }}
            >
                🔀
            </button>
        </div>
    )
}

export default PlayerControls;