
import React from 'react'
import type { Song } from '../../types/player';

type SetState<T> = React.Dispatch<React.SetStateAction<T>>;

interface FileUploaderProps {
  setSongs: SetState<Song[] | []> ;
}

const FileUploader: React.FC<FileUploaderProps> = ({ setSongs }) => {

    const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = e.target.files;
        if (files && files.length > 0) {
            const newSongs: Song[] = Array.from(files)
                .filter((file) => file.type === "audio/mpeg") // İsteğe bağlı: Sadece MP3'leri filtrele
                .map((file) => ({
                    songName: file.name,
                    artist: "Yüklenen Şarkı",
                    url: URL.createObjectURL(file),
                }));

            if (newSongs.length > 0) {
                setSongs((prev) => [...prev, ...newSongs]); // veya [...prev, ...newSongs] duruma göre
            }
        }
    };

    return (
        <div>
            <input
                id="upload-input"
                type="file"
                accept=".mp3"
                multiple
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

        </div>


    )
}

export default FileUploader


