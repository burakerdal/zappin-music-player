import React from 'react'

interface ProgressBarProps {
    actualProgress: number;
    totalLength: number;

}

const ProgressBar: React.FC<ProgressBarProps> = ({actualProgress, totalLength}) => {

const formatTime = (seconds: number) => {
  const m = Math.floor(seconds / 60);
  const s = Math.floor(seconds % 60);
  return `${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
};

  return (
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
  )
}

export default ProgressBar
