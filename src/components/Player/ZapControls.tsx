import React from 'react'
import type { Mode } from '../../types/player'

type SetState<T> = React.Dispatch<React.SetStateAction<T>>;

interface ZapControlsProps {
    zapActive: boolean;
    setZapActive: SetState<boolean>;
    mode: Mode;
    setMode:  SetState<Mode>

}

const ZapControls: React.FC<ZapControlsProps> = ({zapActive, setZapActive, mode, setMode}) => {

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

    return (
        <div style={{
            display: "flex",
            gap: "0.5rem",
            flexWrap: "wrap",
          }}>
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
    )
}

export default ZapControls
