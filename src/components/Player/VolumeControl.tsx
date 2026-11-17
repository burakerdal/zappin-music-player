import React, { type RefObject } from 'react'

type SetState<T> = React.Dispatch<React.SetStateAction<T>>;

interface VolumeControlProps {
    audioRef: RefObject<HTMLAudioElement | null>;
    volume: number;
    setVolume: SetState<number>;
    isMuted: boolean;
    setIsMuted: SetState<boolean>;
}

const VolumeControl: React.FC<VolumeControlProps> = ({ audioRef, volume, setVolume, isMuted, setIsMuted }) => {

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


    return (
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
    )
}

export default VolumeControl
