import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom"; 
import { Sun, Moon } from "lucide-react";
import { useAppContext } from "../../context/AppContext";

// ─── Curated Jukebox Songs (EMBED-SAFE VERSIONS) ──────────────────────────────
// ─── Curated Jukebox Songs (EMBED-SAFE VERSIONS) ──────────────────────────────
// ─── Curated Jukebox Songs (EMBED-SAFE VERSIONS) ──────────────────────────────
const SONGS = [
  // 🎉 Celebrations & Birthdays
  { id: "_z-1fTlSDF0", title: "Happy Birthday To You", artist: "Traditional", tag: "🎉 Celebration" },
  { id: "cBR-wrvpsqs", title: "Happy Birthday (Piano Lounge)", artist: "Lesfm", tag: "🎉 Celebration" }, 
  { id: "3GwjfUFyY6M", title: "Celebration", artist: "Kool & The Gang", tag: "🎉 Celebration" },
  { id: "c-3vPxKdj6o", title: "Just The Way You Are", artist: "Boyce Avenue Cover", tag: "🎉 Celebration" },
  { id: "vG-21rHqDX0", title: "A Thousand Years", artist: "Boyce Avenue Cover", tag: "🎉 Celebration" },
  { id: "nSDgHBxUbVQ", title: "Photograph", artist: "Boyce Avenue Cover", tag: "🎉 Celebration" },

  // 🇱🇰 Sinhala Calm Hits (Independent Acoustic Covers)
  { id: "hPguWUeBybA", title: "Dawasak Ewi", artist: "Shane Glaze Cover", tag: "🇱🇰 Sinhala" },
  { id: "-12I_GsBHiM", title: "Sanasennam Ma", artist: "Mathaka Cover", tag: "🇱🇰 Sinhala" },
  { id: "7MZnWW6aQLs", title: "Sansarini Mage", artist: "Mathaka Cover", tag: "🇱🇰 Sinhala" },

  // 🇮🇳 Tamil Calm Hits (Indie Covers & Lofi Mixes)
  { id: "aqVkzK09HOQ", title: "Munbe Vaa", artist: "Ashwathi Rajendran Cover", tag: "🇮🇳 Tamil" },
  { id: "G90eRkPEjVo", title: "Vaseegara", artist: "Jonita Gandhi Cover", tag: "🇮🇳 Tamil" },
  { id: "11rbWfSMev0", title: "Tamil Lofi Chill Mix", artist: "eternaL Compilation", tag: "🇮🇳 Tamil" },

  // 🎵 Chill & Pop Hits (The ones you confirmed are working!)
  { id: "2Vv-BfVoq4g", title: "Perfect", artist: "Ed Sheeran", tag: "🎵 Pop Hit" },
  { id: "RgKAFK5djSk", title: "See You Again", artist: "Wiz Khalifa", tag: "🎵 Pop Hit" },
  { id: "kJQP7kiw5Fk", title: "Despacito", artist: "Luis Fonsi", tag: "🎵 Pop Hit" },
];

// ─── Word list ─────────────────────────────────────────────────────
const WORDS = [
  { word: "BURGER",   hint: "Popular sandwich with a beef patty" },
  { word: "SUSHI",    hint: "Japanese dish with rice and fish" },
  { word: "PASTA",    hint: "Italian staple food" },
  { word: "RISOTTO",  hint: "Creamy Italian rice dish" },
  { word: "TIRAMISU", hint: "Italian coffee dessert" },
  { word: "SALMON",   hint: "Popular pink-fleshed fish" },
  { word: "LOBSTER",  hint: "Luxury seafood" },
  { word: "TRUFFLE",  hint: "Rare expensive fungus used in cooking" },
  { word: "AVOCADO",  hint: "Creamy green fruit used in salads" },
  { word: "SMOOTHIE", hint: "Blended fruit drink" },
];

// ─── Helpers ───────────────────────────────────────────────────────
function scramble(w) {
  let a = w.split("");
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a.join("");
}

const formatTime = (seconds) => {
  if (!seconds || isNaN(seconds)) return "0:00";
  const m = Math.floor(seconds / 60);
  const s = Math.floor(seconds % 60);
  return `${m}:${s < 10 ? "0" : ""}${s}`;
};

// ─── 1. Music Tab ──────────────────────────────────────────────────
function MusicTab({ dark }) {
  const playerRef = useRef(null);
  const holderRef = useRef(null);
  const timerRef = useRef(null);
  
  const [playing, setPlaying] = useState(false);
  const [volume, setVolume] = useState(50);
  const [selected, setSelected] = useState(null);
  const [ready, setReady] = useState(false);
  
  // New States for Progress Bar
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);

  useEffect(() => {
    if (window.YT && window.YT.Player) { setReady(true); return; }
    if (!document.getElementById("yt-script")) {
      const s = document.createElement("script");
      s.id = "yt-script";
      s.src = "https://www.youtube.com/iframe_api";
      document.head.appendChild(s);
    }
    window.onYouTubeIframeAPIReady = () => setReady(true);
  }, []);

  useEffect(() => {
    if (!ready || !holderRef.current) return;
    playerRef.current = new window.YT.Player(holderRef.current, {
      height: "0", width: "0",
      playerVars: { autoplay: 0, controls: 0 },
      events: { 
        onReady: (e) => e.target.setVolume(volume),
        onStateChange: (e) => {
          // 1 = PLAYING, 2 = PAUSED, 0 = ENDED
          if (e.data === 1) {
            setPlaying(true);
            setDuration(e.target.getDuration());
            timerRef.current = setInterval(() => {
              setCurrentTime(e.target.getCurrentTime());
            }, 1000);
          } else {
            setPlaying(false);
            clearInterval(timerRef.current);
            if (e.data === 0) setCurrentTime(0); // Reset time when song ends
          }
        },
        // 🚀 THE NEW ERROR CATCHER IS HERE 🚀
        onError: (e) => {
          console.error("YouTube Player Error Code:", e.data);
          if (e.data === 101 || e.data === 150) {
            alert("Oops! YouTube blocked this specific song from playing in external apps. Try finding a 'Lyric Video' ID instead!");
          } else if (e.data === 100) {
            alert("Oops! This video was not found (it might be deleted or private).");
          } else {
            alert("An unknown YouTube error occurred. Error Code: " + e.data);
          }
          setPlaying(false); // Make sure the play button resets to the pause icon
        }
      },
    });

    return () => clearInterval(timerRef.current); // Cleanup on unmount
  }, [ready]);

  const toggleSong = (index) => {
    if (!playerRef.current) return;

    if (selected === index) {
      if (playing) {
        playerRef.current.pauseVideo();
      } else {
        playerRef.current.playVideo();
      }
    } else {
      setSelected(index);
      playerRef.current.loadVideoById(SONGS[index].id);
      setCurrentTime(0);
    }
  };

  const changeVol = (v) => {
    setVolume(v);
    playerRef.current?.setVolume(v);
  };

  const handleSeek = (e) => {
    const time = Number(e.target.value);
    setCurrentTime(time);
    if (playerRef.current) {
      playerRef.current.seekTo(time, true);
    }
  };

  return (
    <div className="space-y-4 flex flex-col h-full">
      <p className={`text-sm font-medium ${dark ? "text-gray-300" : "text-gray-700"}`}>Select a curated track</p>
      
      <div className="flex-1 space-y-2 max-h-[250px] overflow-y-auto pr-2 custom-scrollbar">
        {SONGS.map((song, i) => {
          const isThisPlaying = selected === i && playing;
          const isSelected = selected === i;

          return (
            <button
              key={i}
              onClick={() => toggleSong(i)}
              className={`w-full flex items-center justify-between p-3 rounded-xl border transition-all ${
                isSelected 
                  ? dark ? "border-indigo-500 bg-indigo-500/20" : "border-indigo-400 bg-indigo-50"
                  : dark ? "border-white/10 bg-white/5 hover:border-white/20" : "border-gray-200 bg-gray-50 hover:border-gray-300"
              }`}
            >
              <div className="text-left">
                <div className={`text-sm font-bold ${isSelected ? (dark ? "text-indigo-400" : "text-indigo-700") : (dark ? "text-gray-200" : "text-gray-800")}`}>
                  {song.title}
                </div>
                <div className={`text-xs mt-0.5 flex items-center gap-2 ${dark ? "text-gray-400" : "text-gray-500"}`}>
                  <span>{song.artist}</span>
                  <span className={`px-1.5 py-0.5 rounded-md text-[10px] font-medium ${
                    song.tag.includes("Celebration") ? (dark ? "bg-orange-500/20 text-orange-400" : "bg-orange-100 text-orange-700")
                    : song.tag.includes("Sinhala") ? (dark ? "bg-emerald-500/20 text-emerald-400" : "bg-emerald-100 text-emerald-700")
                    : song.tag.includes("Tamil") ? (dark ? "bg-blue-500/20 text-blue-400" : "bg-blue-100 text-blue-700")
                    : (dark ? "bg-white/10 text-gray-300" : "bg-gray-200 text-gray-600")
                  }`}>
                    {song.tag}
                  </span>
                </div>
              </div>
              
              <div className={`w-8 h-8 flex-shrink-0 rounded-full flex items-center justify-center border transition-colors ${
                isThisPlaying 
                  ? dark ? "bg-red-500/20 border-red-500/50 text-red-400" : "bg-red-50 border-red-300 text-red-600" 
                  : dark ? "bg-transparent border-white/20 text-gray-400" : "bg-white border-gray-300 text-gray-600"
              }`}>
                {isThisPlaying ? "⏸" : "▶"}
              </div>
            </button>
          );
        })}
      </div>

      <div className={`pt-4 border-t mt-4 flex flex-col gap-3 ${dark ? "border-white/10" : "border-gray-100"}`}>
        <div className="flex items-center justify-between">
          <p className={`text-xs font-semibold truncate ${dark ? "text-gray-300" : "text-gray-800"}`}>
            {selected !== null ? `${playing ? '🎶 Playing:' : '⏸ Paused:'} ${SONGS[selected].title}` : "No song selected"}
          </p>
        </div>

        {/* --- Timeline / Seek Bar --- */}
        <div className={selected === null ? "opacity-30 pointer-events-none" : ""}>
          <div className="flex justify-between text-[10px] mb-1 font-medium" style={{ color: dark ? '#9ca3af' : '#6b7280' }}>
            <span>{formatTime(currentTime)}</span>
            <span>{formatTime(duration)}</span>
          </div>
          <input
            type="range" min="0" max={duration || 100} value={currentTime}
            onChange={handleSeek}
            className="w-full h-1.5 rounded-lg appearance-none cursor-pointer accent-indigo-500"
            style={{ background: dark ? '#374151' : '#e5e7eb' }}
          />
        </div>

        {/* --- Volume Bar --- */}
        <div className="flex items-center gap-3 mt-1">
          <span className={`text-[10px] font-medium w-12 ${dark ? "text-gray-400" : "text-gray-500"}`}>Vol: {volume}%</span>
          <input
            type="range" min="0" max="100" value={volume} step="1"
            onChange={(e) => changeVol(Number(e.target.value))}
            className="flex-1 h-1.5 rounded-lg appearance-none cursor-pointer accent-indigo-500"
            style={{ background: dark ? '#374151' : '#e5e7eb' }}
          />
        </div>
      </div>
      <div ref={holderRef} style={{ display: "none" }} />
    </div>
  );
}

// ─── 2. Burger Builder Tab ─────────────────────────────────────────
function BurgerBuilderTab({ dark }) {
  const INGREDIENTS = [
    { id: "top", emoji: "🥯", name: "Top Bun" },
    { id: "patty", emoji: "🥩", name: "Patty" },
    { id: "cheese", emoji: "🧀", name: "Cheese" },
    { id: "lettuce", emoji: "🥬", name: "Lettuce" },
    { id: "tomato", emoji: "🍅", name: "Tomato" },
    { id: "bottom", emoji: "🍞", name: "Bottom Bun" },
  ];

  const [targetBurger, setTargetBurger] = useState([]);
  const [currentBuild, setCurrentBuild] = useState([]);
  const [score, setScore] = useState(0);
  const [status, setStatus] = useState("Build the burger to match the order!");

  const generateOrder = () => {
    const fillingsCount = Math.floor(Math.random() * 3) + 2; 
    const availableFillings = INGREDIENTS.filter(i => i.id !== "top" && i.id !== "bottom");
    const randomFillings = Array.from({ length: fillingsCount }, () => 
      availableFillings[Math.floor(Math.random() * availableFillings.length)]
    );
    setTargetBurger([INGREDIENTS[0], ...randomFillings, INGREDIENTS[5]].reverse());
    setCurrentBuild([]);
    setStatus("Build the burger to match the order!");
  };

  useEffect(() => { generateOrder(); }, []);

  const addIngredient = (item) => {
    const newBuild = [...currentBuild, item];
    setCurrentBuild(newBuild);

    const isCorrectSoFar = newBuild.every((ing, idx) => ing.id === targetBurger[idx].id);

    if (!isCorrectSoFar) {
      setStatus("Oops! Wrong ingredient. Try again.");
      setTimeout(() => setCurrentBuild([]), 800);
      return;
    }

    if (newBuild.length === targetBurger.length) {
      setScore(s => s + 1);
      setStatus("Perfect! 👨‍🍳 Here comes the next order...");
      setTimeout(generateOrder, 1200);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center px-2">
        <p className={`text-sm font-medium ${status.includes("Oops") ? "text-red-500" : status.includes("Perfect") ? "text-green-500" : (dark ? "text-gray-300" : "text-gray-600")}`}>
          {status}
        </p>
        <span className={`text-sm ${dark ? "text-gray-400" : "text-gray-500"}`}>Orders: <strong className={dark ? "text-white" : ""}>{score}</strong></span>
      </div>

      <div className={`grid grid-cols-2 gap-6 p-4 rounded-2xl border ${dark ? "bg-white/5 border-white/10" : "bg-gray-50 border-gray-100"}`}>
        <div className={`flex flex-col items-center justify-end h-48 border-r ${dark ? "border-white/10" : "border-gray-200"}`}>
          <p className="text-[10px] uppercase tracking-widest text-gray-400 mb-2 font-bold">Chef's Order</p>
          <div className="flex flex-col-reverse items-center gap-1">
            {targetBurger.map((ing, i) => <span key={i} className="text-3xl filter drop-shadow-sm">{ing.emoji}</span>)}
          </div>
        </div>
        <div className="flex flex-col items-center justify-end h-48">
          <p className="text-[10px] uppercase tracking-widest text-orange-400 mb-2 font-bold">Your Board</p>
          <div className="flex flex-col-reverse items-center gap-1 h-full justify-start">
            {currentBuild.map((ing, i) => <span key={i} className="text-3xl filter drop-shadow-md">{ing.emoji}</span>)}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-2">
        {INGREDIENTS.map((ing) => (
          <button
            key={ing.id} onClick={() => addIngredient(ing)}
            className={`flex flex-col items-center p-2 rounded-xl border transition-colors shadow-sm active:scale-95 ${
              dark ? "bg-white/5 border-white/10 hover:bg-white/10 hover:border-orange-500/50" : "bg-white border-gray-200 hover:bg-orange-50 hover:border-orange-200"
            }`}
          >
            <span className="text-2xl mb-1">{ing.emoji}</span>
            <span className={`text-[10px] font-medium ${dark ? "text-gray-400" : "text-gray-600"}`}>{ing.name}</span>
          </button>
        ))}
      </div>
    </div>
  );
}

// ─── 3. Food Memory Match Tab ──────────────────────────────────────
function MemoryMatchTab({ dark }) {
  const EMOJIS = ["🍔", "🍕", "🌮", "🍣", "🍩", "🍦", "☕", "🍇"];
  const [cards, setCards] = useState([]);
  const [flipped, setFlipped] = useState([]);
  const [solved, setSolved] = useState([]);
  const [moves, setMoves] = useState(0);

  const initializeGame = () => {
    const shuffled = [...EMOJIS, ...EMOJIS]
      .sort(() => Math.random() - 0.5)
      .map((emoji, id) => ({ id, emoji }));
    setCards(shuffled);
    setFlipped([]);
    setSolved([]);
    setMoves(0);
  };

  useEffect(() => { initializeGame(); }, []);

  const handleCardClick = (index) => {
    if (flipped.length === 2 || flipped.includes(index) || solved.includes(index)) return;
    
    const newFlipped = [...flipped, index];
    setFlipped(newFlipped);

    if (newFlipped.length === 2) {
      setMoves((m) => m + 1);
      const [first, second] = newFlipped;
      if (cards[first].emoji === cards[second].emoji) {
        setSolved([...solved, first, second]);
        setFlipped([]);
      } else {
        setTimeout(() => setFlipped([]), 800);
      }
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center px-2">
        <p className={`text-sm ${dark ? "text-gray-300" : "text-gray-600"}`}>
          {solved.length === cards.length ? "🎉 You found them all!" : "Find the matching pairs"}
        </p>
        <div className="flex gap-3 text-sm">
          <span className={dark ? "text-gray-400" : "text-gray-500"}>Moves: <strong className={dark ? "text-white" : ""}>{moves}</strong></span>
          <button onClick={initializeGame} className={`${dark ? "text-indigo-400 hover:text-indigo-300" : "text-indigo-600 hover:text-indigo-700"} font-medium`}>Restart</button>
        </div>
      </div>
      
      <div className="grid grid-cols-4 gap-2 max-w-[280px] mx-auto">
        {cards.map((card, i) => {
          const isRevealed = flipped.includes(i) || solved.includes(i);
          return (
            <button
              key={card.id} onClick={() => handleCardClick(i)}
              className={`aspect-square text-3xl flex items-center justify-center rounded-xl transition-all duration-300 transform border ${
                isRevealed 
                  ? (dark ? "bg-indigo-500/20 border-indigo-500/40 scale-100 shadow-inner" : "bg-indigo-50 border-indigo-200 scale-100 shadow-inner") 
                  : (dark ? "bg-white/5 border-white/10 hover:bg-white/10 scale-95 shadow-sm" : "bg-gray-100 border-gray-200 hover:bg-gray-200 scale-95 shadow-sm")
              }`}
            >
              <span className={`transition-opacity duration-200 ${isRevealed ? "opacity-100" : "opacity-0"}`}>
                {card.emoji}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}

// ─── 4. Food Merge (2048) Tab ──────────────────────────────────────
function FoodMergeTab({ dark }) {
  const FOOD_MAP = {
    2: { e: "🍇", bg: "#eee4da" }, 4: { e: "🍓", bg: "#ede0c8" }, 8: { e: "🍒", bg: "#f2b179" },
    16: { e: "🍎", bg: "#f59563" }, 32: { e: "🍉", bg: "#f67c5f" }, 64: { e: "🍍", bg: "#f65e3b" },
    128: { e: "🌮", bg: "#edcf72" }, 256: { e: "🌭", bg: "#edcc61" }, 512: { e: "🍕", bg: "#edc850" },
    1024: { e: "🍔", bg: "#edc53f" }, 2048: { e: "🎂", bg: "#edc22e" }
  };

  const newGrid = () => { const g = Array.from({length:4},()=>Array(4).fill(0)); addTile(g); addTile(g); return g; };
  const addTile = (g) => {
    const e = []; g.forEach((r,i)=>r.forEach((v,j)=>{ if(!v) e.push([i,j]); }));
    if (!e.length) return;
    const [r,c] = e[Math.floor(Math.random()*e.length)];
    g[r][c] = Math.random() < 0.9 ? 2 : 4;
  };
  const [grid, setGrid] = useState(newGrid);
  const [score, setScore] = useState(0);

  const slide = (row, addScore) => {
    let r = row.filter(x => x);
    for (let i = 0; i < r.length - 1; i++) {
      if (r[i] === r[i+1]) { r[i] *= 2; addScore(r[i]); r.splice(i+1,1); }
    }
    while (r.length < 4) r.push(0);
    return r;
  };

  const move = (dir) => {
    let g = grid.map(r => [...r]), moved = false, added = 0;
    const addS = (v) => { added += v; };
    if (dir === "left") g = g.map(r => { const n = slide(r, addS); if (JSON.stringify(n) !== JSON.stringify(r)) moved=true; return n; });
    else if (dir === "right") g = g.map(r => { const n = slide([...r].reverse(), addS).reverse(); if (JSON.stringify(n) !== JSON.stringify(r)) moved=true; return n; });
    else if (dir === "up") {
      let t = g[0].map((_,c)=>g.map(r=>r[c])).map(r=>{ const n=slide(r,addS); if(JSON.stringify(n)!==JSON.stringify(r)) moved=true; return n;});
      g = t[0].map((_,c)=>t.map(r=>r[c]));
    } else if (dir === "down") {
      let t = g[0].map((_,c)=>g.map(r=>r[c])).map(r=>{ const n=slide([...r].reverse(),addS).reverse(); if(JSON.stringify(n)!==JSON.stringify(r)) moved=true; return n;});
      g = t[0].map((_,c)=>t.map(r=>r[c]));
    }
    if (moved) { addTile(g); setGrid(g); setScore(s => s + added); }
  };

  useEffect(() => {
    const h = (e) => {
      const m={ArrowLeft:"left",ArrowRight:"right",ArrowUp:"up",ArrowDown:"down"};
      if (m[e.key]) { e.preventDefault(); move(m[e.key]); }
    };
    window.addEventListener("keydown", h);
    return () => window.removeEventListener("keydown", h);
  }, [grid]);

  const btnClasses = `w-10 h-10 rounded-lg border transition-colors flex items-center justify-center ${
    dark ? "bg-white/10 border-white/20 hover:bg-white/20 text-white" : "bg-gray-50 border-gray-200 hover:bg-indigo-50 text-gray-900"
  }`;

  return (
    <div className="space-y-3">
      <div className="flex justify-between items-center">
        <p className={`text-sm ${dark ? "text-gray-400" : "text-gray-500"}`}>Merge same foods to upgrade!</p>
        <div className="flex items-center gap-2">
          <span className={`text-sm ${dark ? "text-gray-400" : "text-gray-500"}`}>Score: <strong className={dark ? "text-white" : ""}>{score}</strong></span>
          <button onClick={() => { setGrid(newGrid()); setScore(0); }} className={`text-xs px-2 py-1 rounded-lg border ${dark ? "border-white/20 hover:bg-white/10 text-gray-300" : "border-gray-200 hover:bg-gray-50 text-gray-700"}`}>New</button>
        </div>
      </div>
      <div className={`grid grid-cols-4 gap-1.5 p-2 rounded-xl max-w-[240px] mx-auto ${dark ? "bg-[#8a7f76]" : "bg-[#bbada0]"}`}>
        {grid.flat().map((v, i) => (
          <div key={i} className={`aspect-square rounded-lg flex items-center justify-center text-3xl font-medium transition-all ${!v && dark ? "opacity-50" : ""}`}
            style={{ background: v ? (FOOD_MAP[v]?.bg || "#3c3a32") : "#cdc1b4" }}>
            {v ? FOOD_MAP[v].e : ""}
          </div>
        ))}
      </div>
      <div className="flex flex-col items-center gap-1 mt-2">
        <button onClick={() => move("up")} className={btnClasses}>▲</button>
        <div className="flex gap-1">
          <button onClick={() => move("left")} className={btnClasses}>◀</button>
          <button onClick={() => move("down")} className={btnClasses}>▼</button>
          <button onClick={() => move("right")} className={btnClasses}>▶</button>
        </div>
      </div>
    </div>
  );
}

// ─── 5. Word Scramble Tab ──────────────────────────────────────────
function WordScrambleTab({ dark }) {
  const [cur, setCur] = useState(null);
  const [scrambled, setScrambled] = useState("");
  const [input, setInput] = useState("");
  const [status, setStatus] = useState({ msg: "Unscramble the food word!", ok: null });

  const next = () => {
    const w = WORDS[Math.floor(Math.random() * WORDS.length)];
    let s = scramble(w.word);
    while (s === w.word) s = scramble(w.word);
    setCur(w); setScrambled(s); setInput(""); setStatus({ msg: "Unscramble the food word!", ok: null });
  };

  useEffect(() => { next(); }, []);

  const check = (val) => {
    setInput(val);
    if (val.toUpperCase().trim() === cur?.word) {
      setStatus({ msg: "Correct! Well done! 🎉", ok: true });
      setTimeout(next, 1200);
    }
  };

  const reveal = () => {
    setScrambled(cur?.word || "");
    setStatus({ msg: `The answer was: ${cur?.word}`, ok: false });
    setTimeout(next, 2000);
  };

  return (
    <div className="space-y-4 pt-4">
      <p className={`text-sm text-center font-medium ${status.ok === true ? "text-green-500" : status.ok === false ? "text-red-500" : (dark ? "text-gray-400" : "text-gray-500")}`}>
        {status.msg}
      </p>
      <p className={`text-3xl font-bold tracking-[12px] text-center ${dark ? "text-white" : "text-gray-800"}`}>{scrambled}</p>
      <p className={`text-xs text-center ${dark ? "text-gray-400" : "text-gray-400"}`}>{cur?.hint}</p>
      <input
        type="text" value={input}
        onChange={(e) => check(e.target.value)}
        placeholder="Type your answer..."
        className={`w-full border rounded-lg px-4 py-3 text-sm focus:outline-none focus:ring-2 ${
          dark ? "bg-[#0d0d0d] border-white/20 text-white focus:ring-indigo-500" : "bg-white border-gray-200 text-gray-900 focus:ring-indigo-300"
        }`}
      />
      <div className="flex gap-2 justify-center">
        <button onClick={next} className={`text-sm px-4 py-2 rounded-lg border font-medium ${
          dark ? "border-white/20 hover:bg-white/10 text-gray-300" : "border-gray-200 hover:bg-gray-50 text-gray-700"
        }`}>New Word</button>
        <button onClick={reveal} className={`text-sm px-4 py-2 rounded-lg border font-medium ${
          dark ? "border-white/20 hover:bg-white/10 text-gray-300" : "border-gray-200 hover:bg-gray-50 text-gray-700"
        }`}>Reveal Answer</button>
      </div>
    </div>
  );
}

// ─── Main Hub ──────────────────────────────────────────────────────
const TABS = [
  { id: "music",  label: "🎵 Music" },
  { id: "burger", label: "🍔 Burger Builder" }, 
  { id: "memory", label: "🧠 Food Match" },     
  { id: "merge",  label: "🍉 Food Merge" },     
  { id: "word",   label: "🔤 Word Scramble" },  
];

export default function EntertainmentHub() {
  const [tab, setTab] = useState("music");
  const navigate = useNavigate();
  
  // Bring in the global theme context from AURA
  const { theme, toggleTheme } = useAppContext();
  const isDark = theme === 'dark';

  return (
    <div className={`min-h-screen p-4 font-sans transition-colors duration-300 ${isDark ? 'bg-[#0d0d0d]' : 'bg-gray-100'}`}>
      <div className="max-w-lg mx-auto mt-4">
        {/* Header */}
        <div className="mb-6 flex justify-between items-start">
          <div>
            <h1 className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>🎉 AURA Hub</h1>
            <p className={`text-sm mt-1 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>Have fun while your food is prepared!</p>
          </div>
          
          {/* Action Buttons (Toggle Theme + Back to Menu) */}
          <div className="flex items-center gap-2">
            <button 
              onClick={toggleTheme} 
              className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all active:scale-90 ${
                isDark ? 'bg-white/5 hover:bg-white/15 text-yellow-300' : 'bg-white shadow-sm border border-gray-200 hover:bg-gray-50 text-gray-600'
              }`}
            >
              {isDark ? <Sun size={18}/> : <Moon size={18}/>}
            </button>
            <button 
              onClick={() => navigate('/robot')}
              className={`px-4 py-2 rounded-xl text-sm font-bold transition-all shadow-sm flex items-center gap-2 ${
                isDark ? 'bg-white/5 border border-white/10 text-gray-300 hover:bg-white/10 hover:text-white' : 'bg-white border border-gray-200 text-gray-700 hover:bg-gray-100'
              }`}
            >
              ← Menu
            </button>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 flex-wrap mb-6">
          {TABS.map((t) => (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              className={`px-3.5 py-2 rounded-xl text-sm font-semibold border transition-all active:scale-95 ${
                tab === t.id
                  ? "bg-indigo-600 text-white border-indigo-600 shadow-md"
                  : isDark 
                    ? "bg-white/5 text-gray-400 border-white/10 hover:border-white/20 hover:text-white" 
                    : "bg-white text-gray-600 border-gray-200 hover:border-gray-300"
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>

        {/* Content Box */}
        <div className={`rounded-3xl border p-6 shadow-sm min-h-[460px] transition-colors duration-300 ${
          isDark ? 'bg-[#1a1a1a] border-white/5' : 'bg-white border-gray-100'
        }`}>
          {/* Using hidden classes to prevent components from unmounting */}
          <div className={tab === "music" ? "block h-full" : "hidden"}><MusicTab dark={isDark} /></div>
          <div className={tab === "burger" ? "block" : "hidden"}><BurgerBuilderTab dark={isDark} /></div> 
          <div className={tab === "memory" ? "block" : "hidden"}><MemoryMatchTab dark={isDark} /></div>   
          <div className={tab === "merge" ? "block" : "hidden"}><FoodMergeTab dark={isDark} /></div>     
          <div className={tab === "word" ? "block" : "hidden"}><WordScrambleTab dark={isDark} /></div>
        </div>
      </div>
    </div>
  );
}