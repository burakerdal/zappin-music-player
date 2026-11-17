// src/App.tsx
import React from "react";
import PlayerContainer from "./components/Player/PlayerContainer";
import Header from "./components/Header/Header";

function App() {
  return (
    <div style={{ padding: "2rem" }}>
      <Header />
      <PlayerContainer />
    </div>
  );
}

export default App;
