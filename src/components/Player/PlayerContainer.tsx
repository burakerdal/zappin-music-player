import React from "react";
import { useAudioPlayer } from "../../hooks/useAudioPlayer";
import ProgressBar from "./ProgressBar";
import PlayerControls from "./PlayerControls";
import ZapControls from "./ZapControls";
import VolumeControl from "./VolumeControl";
import FileUploader from "./FileUploader";
import List from "../List/List";

const PlayerContainer: React.FC = () => {
  const {
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
  } = useAudioPlayer();

  return (
    <div style={{ display: "flex", gap: "1rem" }}>
      <div
        style={{
          width: "500px",
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
        <h2>{currentSong ? currentSong.songName : "No Song Selected"}</h2>
        <audio ref={audioRef} preload="auto" />

        <ProgressBar actualProgress={actualProgress} totalLength={totalLength} />

        <div style={{ display: "flex", gap: "0.5rem", marginTop: "1rem", flexWrap: "wrap" }}>
          <PlayerControls
            audioRef={audioRef}
            isPlaying={isPlaying}
            setIsPlaying={togglePlay}
            isShuffle={isShuffle}
            setIsShuffle={setIsShuffle}
            zapActive={zapActive}
            songs={songs}
            setCurrentIndex={setCurrentIndex}
            handleNext={handleNext}
            handlePrev={handlePrev}
          />
          <ZapControls zapActive={zapActive} setZapActive={handleZapToggle} mode={mode} setMode={setMode} />
        </div>

        <VolumeControl
          audioRef={audioRef}
          volume={volume}
          setVolume={setVolume}
          isMuted={isMuted}
          setIsMuted={setIsMuted}
        />
      </div>

      <div style={{ marginTop: "1rem" }}>
        <FileUploader setSongs={setSongs} />

        {songs.length > 0 && (
          <List
            songs={songs}
            currentIndex={currentIndex}
            onSelect={(index) => {
              setCurrentIndex(index);
              setIsPlaying(true);
            }}
          />
        )}
      </div>
    </div>
  );
};

export default PlayerContainer;