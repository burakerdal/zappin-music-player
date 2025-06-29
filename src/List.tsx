import React from "react";

interface Song {
  title: string;
  url: string;
  // İstersen diğer alanlar da eklenebilir (örneğin cover, duration)
}

interface ListProps {
  songs: Song[] | [];
  currentIndex: number;
  onSelect: (index: number) => void;
}

const List: React.FC<ListProps> = ({ songs, currentIndex, onSelect }) => {
  return (
    <div className="custom-scroll" style={{ maxHeight: "350px" }}>
        <ul style={{ listStyle: "none", padding: 0}}>
        {songs.map((song, index) => (
            <li
            key={index}
            onClick={() => onSelect(index)}
            style={{
                padding: "8px 12px",
                cursor: "pointer",
                marginBottom: "4px",
                boxShadow: index === currentIndex ? "0 0 5px rgba(0, 255, 0, 0.5)" : "none",
                backgroundColor: "black"
            }}
            >
            <div style={{display:"flex", gap:"0.5rem", width:"300px"}}>
                <img
                    src="/icons/musical-note-128.png"
                    alt="Music Note"
                    style={{
                    width: "20px",
                    height: "20px",
                    objectFit: "contain",
                    backgroundColor: "brown", 
                    padding:"1rem",
                    }}
                    
                />
                <div style={{}}>
                    <div style={{fontSize:"18px", fontWeight:"bold"}}>{song.songName}</div>
                </div>
            </div>
            </li>
        ))}
        </ul>
    </div>
  );
};

export default List;