import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Sun, Moon, ArrowLeft } from "lucide-react";
import { useAppContext } from "../../context/AppContext";
import {
  BurgerBuilderTab,
  MemoryMatchTab,
  FoodMergeTab,
  CatchSnackTab,
  TicTacToeTab,
} from './GameComponents';
// ── EntertainmentHub.jsx එකෙන් game components copy කරන්න ──
// BurgerBuilderTab, MemoryMatchTab, FoodMergeTab, CatchSnackTab, TicTacToeTab
// + WIN_LINES, checkWinner, getWinLine, mediumAI, minimax, hardAI helpers

// (paste them here from EntertainmentHub.jsx)

const GAMES = [
  { id: "burger",    label: "🍔 Burger Builder" },
  { id: "memory",    label: "🧠 Food Match"     },
  { id: "merge",     label: "🍉 Food Merge"     },
  { id: "catch",     label: "🕹️ Catch Snack"   },
  { id: "tictactoe", label: "❌ Tic Tac Toe"    },
];

export default function GamesPage() {
  const navigate = useNavigate();
  const { theme, toggleTheme } = useAppContext();
  const D = theme === "dark";
  const [tab, setTab] = useState("burger");

  return (
    <div className={`min-h-screen flex flex-col font-sans transition-colors duration-300 ${D ? "bg-[#0d0d0d]" : "bg-gray-100"}`}>

      {/* Header */}
      <div className={`flex-shrink-0 flex items-center justify-between px-5 py-3 border-b ${D ? "bg-[#111] border-white/5" : "bg-white border-gray-200"}`}>
        <div className="flex items-center gap-3">
          <button onClick={() => navigate("/robot")}
            className={`w-9 h-9 rounded-xl flex items-center justify-center border transition-all active:scale-90 ${D ? "bg-white/5 border-white/10 text-gray-400 hover:text-white" : "bg-gray-100 border-gray-200 text-gray-500"}`}>
            <ArrowLeft size={16}/>
          </button>
          <div>
            <h1 className={`text-base font-bold ${D ? "text-white" : "text-gray-900"}`}>🎮 Games</h1>
            <p className={`text-xs ${D ? "text-gray-500" : "text-gray-400"}`}>Play while your food is prepared</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={() => navigate("/entertain/music")}
            className="px-3 py-1.5 rounded-xl text-xs font-bold bg-purple-500/15 border border-purple-500/30 text-purple-400 hover:bg-purple-500/25 transition-all">
            🎵 Music
          </button>
          <button onClick={toggleTheme}
            className={`w-9 h-9 rounded-xl flex items-center justify-center transition-all active:scale-90 ${D ? "bg-white/5 text-yellow-300" : "bg-gray-100 text-gray-600"}`}>
            {D ? <Sun size={15}/> : <Moon size={15}/>}
          </button>
        </div>
      </div>

      {/* Game tabs */}
      <div className={`flex-shrink-0 flex gap-2 px-5 py-3 overflow-x-auto border-b ${D ? "border-white/5" : "border-gray-200"}`}>
        {GAMES.map(g => (
          <button key={g.id} onClick={() => setTab(g.id)}
            className={`flex-shrink-0 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              tab === g.id
                ? "bg-indigo-500 text-white"
                : D ? "bg-white/5 text-gray-400 hover:bg-white/10 border border-white/10" : "bg-white text-gray-500 border border-gray-200"
            }`}>
            {g.label}
          </button>
        ))}
      </div>

      {/* Game panel */}
      <div className="flex-1 overflow-y-auto px-5 py-4">
        <div className={`rounded-3xl border p-5 min-h-[400px] ${D ? "bg-[#1a1a1a] border-white/5" : "bg-white border-gray-100"}`}>
          {tab === "burger"    && <BurgerBuilderTab dark={D}/>}
          {tab === "memory"    && <MemoryMatchTab   dark={D}/>}
          {tab === "merge"     && <FoodMergeTab     dark={D}/>}
          {tab === "catch"     && <CatchSnackTab     dark={D}/>}
          {tab === "tictactoe" && <TicTacToeTab     dark={D}/>}
        </div>
      </div>

    </div>
  );
}