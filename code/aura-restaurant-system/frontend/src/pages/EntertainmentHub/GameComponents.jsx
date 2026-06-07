import { useState, useEffect } from "react";

// ─── Burger Builder ───────────────────────────────────────────────────────────
export function BurgerBuilderTab({ dark }) {
  const INGREDIENTS = [
    { id: "top",     emoji: "🥯", name: "Top Bun"    },
    { id: "patty",   emoji: "🥩", name: "Patty"      },
    { id: "cheese",  emoji: "🧀", name: "Cheese"     },
    { id: "lettuce", emoji: "🥬", name: "Lettuce"    },
    { id: "tomato",  emoji: "🍅", name: "Tomato"     },
    { id: "bottom",  emoji: "🍞", name: "Bottom Bun" },
  ];
  const [targetBurger, setTargetBurger] = useState([]);
  const [currentBuild, setCurrentBuild] = useState([]);
  const [score,        setScore]        = useState(0);
  const [status,       setStatus]       = useState("Build the burger to match the order!");

  const generateOrder = () => {
    const count    = Math.floor(Math.random() * 3) + 2;
    const fillings = INGREDIENTS.filter(i => i.id !== "top" && i.id !== "bottom");
    const random   = Array.from({ length: count }, () => fillings[Math.floor(Math.random() * fillings.length)]);
    setTargetBurger([INGREDIENTS[0], ...random, INGREDIENTS[5]].reverse());
    setCurrentBuild([]);
    setStatus("Build the burger to match the order!");
  };

  useEffect(() => { generateOrder(); }, []);

  const addIngredient = (item) => {
    const newBuild = [...currentBuild, item];
    setCurrentBuild(newBuild);
    const ok = newBuild.every((ing, idx) => ing.id === targetBurger[idx].id);
    if (!ok) {
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
        <p className={`text-sm font-medium ${status.includes("Oops") ? "text-red-500" : status.includes("Perfect") ? "text-green-500" : dark ? "text-gray-300" : "text-gray-600"}`}>{status}</p>
        <span className={`text-sm ${dark ? "text-gray-400" : "text-gray-500"}`}>Orders: <strong className={dark ? "text-white" : ""}>{score}</strong></span>
      </div>
      <div className={`grid grid-cols-2 gap-6 p-4 rounded-2xl border ${dark ? "bg-white/5 border-white/10" : "bg-gray-50 border-gray-100"}`}>
        <div className={`flex flex-col items-center justify-end h-48 border-r ${dark ? "border-white/10" : "border-gray-200"}`}>
          <p className="text-[10px] uppercase tracking-widest text-gray-400 mb-2 font-bold">Chef's Order</p>
          <div className="flex flex-col-reverse items-center gap-1">
            {targetBurger.map((ing, i) => <span key={i} className="text-3xl">{ing.emoji}</span>)}
          </div>
        </div>
        <div className="flex flex-col items-center justify-end h-48">
          <p className="text-[10px] uppercase tracking-widest text-orange-400 mb-2 font-bold">Your Board</p>
          <div className="flex flex-col-reverse items-center gap-1 h-full justify-start">
            {currentBuild.map((ing, i) => <span key={i} className="text-3xl">{ing.emoji}</span>)}
          </div>
        </div>
      </div>
      <div className="grid grid-cols-3 gap-2">
        {INGREDIENTS.map((ing) => (
          <button key={ing.id} onClick={() => addIngredient(ing)}
            className={`flex flex-col items-center p-2 rounded-xl border transition-colors active:scale-95 ${dark ? "bg-white/5 border-white/10 hover:bg-white/10" : "bg-white border-gray-200 hover:bg-orange-50"}`}>
            <span className="text-2xl mb-1">{ing.emoji}</span>
            <span className={`text-[10px] font-medium ${dark ? "text-gray-400" : "text-gray-600"}`}>{ing.name}</span>
          </button>
        ))}
      </div>
    </div>
  );
}

// ─── Memory Match ─────────────────────────────────────────────────────────────
export function MemoryMatchTab({ dark }) {
  const EMOJIS = ["🍔","🍕","🌮","🍣","🍩","🍦","☕","🍇"];
  const [cards,   setCards]   = useState([]);
  const [flipped, setFlipped] = useState([]);
  const [solved,  setSolved]  = useState([]);
  const [moves,   setMoves]   = useState(0);

  const init = () => {
    const shuffled = [...EMOJIS, ...EMOJIS].sort(() => Math.random() - 0.5).map((emoji, id) => ({ id, emoji }));
    setCards(shuffled); setFlipped([]); setSolved([]); setMoves(0);
  };
  useEffect(() => { init(); }, []);

  const handleClick = (i) => {
    if (flipped.length === 2 || flipped.includes(i) || solved.includes(i)) return;
    const next = [...flipped, i];
    setFlipped(next);
    if (next.length === 2) {
      setMoves(m => m + 1);
      if (cards[next[0]].emoji === cards[next[1]].emoji) { setSolved(s => [...s, ...next]); setFlipped([]); }
      else setTimeout(() => setFlipped([]), 800);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center px-2">
        <p className={`text-sm ${dark ? "text-gray-300" : "text-gray-600"}`}>{solved.length === cards.length ? "🎉 You found them all!" : "Find the matching pairs"}</p>
        <div className="flex gap-3 text-sm">
          <span className={dark ? "text-gray-400" : "text-gray-500"}>Moves: <strong>{moves}</strong></span>
          <button onClick={init} className={`font-medium ${dark ? "text-indigo-400" : "text-indigo-600"}`}>Restart</button>
        </div>
      </div>
      <div className="grid grid-cols-4 gap-2 max-w-[280px] mx-auto">
        {cards.map((card, i) => {
          const shown = flipped.includes(i) || solved.includes(i);
          return (
            <button key={card.id} onClick={() => handleClick(i)}
              className={`aspect-square text-3xl flex items-center justify-center rounded-xl border transition-all duration-300 ${shown ? (dark ? "bg-indigo-500/20 border-indigo-500/40" : "bg-indigo-50 border-indigo-200") : (dark ? "bg-white/5 border-white/10 hover:bg-white/10 scale-95" : "bg-gray-100 border-gray-200 hover:bg-gray-200 scale-95")}`}>
              <span className={`transition-opacity duration-200 ${shown ? "opacity-100" : "opacity-0"}`}>{card.emoji}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}

// ─── Food Merge (2048) ────────────────────────────────────────────────────────
export function FoodMergeTab({ dark }) {
  const FOOD_MAP = {
    2:{"e":"🍇","bg":"#eee4da"},4:{"e":"🍓","bg":"#ede0c8"},8:{"e":"🍒","bg":"#f2b179"},
    16:{"e":"🍎","bg":"#f59563"},32:{"e":"🍉","bg":"#f67c5f"},64:{"e":"🍍","bg":"#f65e3b"},
    128:{"e":"🌮","bg":"#edcf72"},256:{"e":"🌭","bg":"#edcc61"},512:{"e":"🍕","bg":"#edc850"},
    1024:{"e":"🍔","bg":"#edc53f"},2048:{"e":"🎂","bg":"#edc22e"},
  };
  const newGrid = () => { const g = Array.from({length:4},()=>Array(4).fill(0)); addTile(g); addTile(g); return g; };
  const addTile = (g) => { const e=[]; g.forEach((r,i)=>r.forEach((v,j)=>{ if(!v)e.push([i,j]); })); if(!e.length)return; const[r,c]=e[Math.floor(Math.random()*e.length)]; g[r][c]=Math.random()<0.9?2:4; };
  const [grid,setGrid]=useState(newGrid); const [score,setScore]=useState(0);
  const slide=(row,add)=>{let r=row.filter(x=>x);for(let i=0;i<r.length-1;i++){if(r[i]===r[i+1]){r[i]*=2;add(r[i]);r.splice(i+1,1);}}while(r.length<4)r.push(0);return r;};
  const move=(dir)=>{let g=grid.map(r=>[...r]),moved=false,added=0;const addS=(v)=>{added+=v;};
    if(dir==="left")g=g.map(r=>{const n=slide(r,addS);if(JSON.stringify(n)!==JSON.stringify(r))moved=true;return n;});
    else if(dir==="right")g=g.map(r=>{const n=slide([...r].reverse(),addS).reverse();if(JSON.stringify(n)!==JSON.stringify(r))moved=true;return n;});
    else if(dir==="up"){let t=g[0].map((_,c)=>g.map(r=>r[c])).map(r=>{const n=slide(r,addS);if(JSON.stringify(n)!==JSON.stringify(r))moved=true;return n;});g=t[0].map((_,c)=>t.map(r=>r[c]));}
    else if(dir==="down"){let t=g[0].map((_,c)=>g.map(r=>r[c])).map(r=>{const n=slide([...r].reverse(),addS).reverse();if(JSON.stringify(n)!==JSON.stringify(r))moved=true;return n;});g=t[0].map((_,c)=>t.map(r=>r[c]));}
    if(moved){addTile(g);setGrid(g);setScore(s=>s+added);}};
  useEffect(()=>{const h=(e)=>{const m={ArrowLeft:"left",ArrowRight:"right",ArrowUp:"up",ArrowDown:"down"};if(m[e.key]){e.preventDefault();move(m[e.key]);}};window.addEventListener("keydown",h);return()=>window.removeEventListener("keydown",h);},[grid]);
  const btn=`w-10 h-10 rounded-lg border flex items-center justify-center ${dark?"bg-white/10 border-white/20 hover:bg-white/20 text-white":"bg-gray-50 border-gray-200 hover:bg-indigo-50 text-gray-900"}`;
  return (
    <div className="space-y-3">
      <div className="flex justify-between items-center">
        <p className={`text-sm ${dark?"text-gray-400":"text-gray-500"}`}>Merge same foods!</p>
        <div className="flex items-center gap-2">
          <span className={`text-sm ${dark?"text-gray-400":"text-gray-500"}`}>Score: <strong>{score}</strong></span>
          <button onClick={()=>{setGrid(newGrid());setScore(0);}} className={`text-xs px-2 py-1 rounded-lg border ${dark?"border-white/20 text-gray-300":"border-gray-200 text-gray-700"}`}>New</button>
        </div>
      </div>
      <div className={`grid grid-cols-4 gap-1.5 p-2 rounded-xl max-w-[240px] mx-auto ${dark?"bg-[#8a7f76]":"bg-[#bbada0]"}`}>
        {grid.flat().map((v,i)=>(
          <div key={i} className="aspect-square rounded-lg flex items-center justify-center text-3xl transition-all" style={{background:v?(FOOD_MAP[v]?.bg||"#3c3a32"):"#cdc1b4"}}>
            {v?FOOD_MAP[v].e:""}
          </div>
        ))}
      </div>
      <div className="flex flex-col items-center gap-1 mt-2">
        <button onClick={()=>move("up")} className={btn}>▲</button>
        <div className="flex gap-1">
          <button onClick={()=>move("left")} className={btn}>◀</button>
          <button onClick={()=>move("down")} className={btn}>▼</button>
          <button onClick={()=>move("right")} className={btn}>▶</button>
        </div>
      </div>
    </div>
  );
}

// ─── Catch Snack ──────────────────────────────────────────────────────────────
export function CatchSnackTab({ dark }) {
  const EMOJIS = ["🍔","🍕","🌮","🍣","🍩","🍦","🍇","🍓"];
  const [score,setScore]=useState(0); const [activeIdx,setActiveIdx]=useState(null);
  const [playing,setPlaying]=useState(false); const [timeLeft,setTimeLeft]=useState(0);
  const [currentEmoji,setCurrentEmoji]=useState("🍕"); const [isBomb,setIsBomb]=useState(false);
  const [feedback,setFeedback]=useState("");
  const start=()=>{setScore(0);setTimeLeft(30);setPlaying(true);setFeedback("");setActiveIdx(Math.floor(Math.random()*9));};
  useEffect(()=>{
    let timer,mole;
    if(playing&&timeLeft>0){
      timer=setTimeout(()=>setTimeLeft(l=>l-1),1000);
      const speed=Math.max(300,900-score*30);
      mole=setTimeout(()=>{setActiveIdx(Math.floor(Math.random()*9));const bomb=Math.random()<0.25;setIsBomb(bomb);setCurrentEmoji(bomb?"💣":EMOJIS[Math.floor(Math.random()*EMOJIS.length)]);setFeedback("");},speed);
    } else if(timeLeft===0){setPlaying(false);setActiveIdx(null);if(score>0)setFeedback("Time's up!");}
    return()=>{clearTimeout(timer);clearTimeout(mole);};
  },[playing,timeLeft,score]);
  const tap=(i)=>{if(i===activeIdx&&playing){if(isBomb){setScore(s=>Math.max(0,s-5));setFeedback("💥 -5 Points!");}else{setScore(s=>s+1);setFeedback("✅ +1");}setActiveIdx(null);}};
  return (
    <div className="space-y-4 pt-2">
      <div className="flex justify-between items-center px-2">
        <p className={`text-sm font-bold ${feedback.includes("💥")?"text-red-500":feedback.includes("✅")?"text-green-500":dark?"text-gray-300":"text-gray-600"}`}>{playing?(feedback||"Watch out for bombs! 💣"):feedback||"Catch the snacks!"}</p>
        <div className="flex gap-4 text-sm">
          <span className={dark?"text-gray-400":"text-gray-500"}>Time: <strong>{timeLeft}s</strong></span>
          <span className={dark?"text-gray-400":"text-gray-500"}>Score: <strong>{score}</strong></span>
        </div>
      </div>
      <div className={`grid grid-cols-3 gap-2 p-3 rounded-2xl max-w-[280px] mx-auto border ${dark?"bg-white/5 border-white/10":"bg-gray-50 border-gray-100"}`}>
        {[0,1,2,3,4,5,6,7,8].map(i=>(
          <button key={i} onClick={()=>tap(i)} disabled={!playing}
            className={`aspect-square rounded-xl border flex items-center justify-center ${dark?"bg-[#1a1a1a] border-white/10":"bg-white border-gray-200"}`}>
            <span className={`text-4xl transition-transform duration-100 ${activeIdx===i?"scale-100":"scale-0"}`}>{currentEmoji}</span>
          </button>
        ))}
      </div>
      <div className="text-center">
        <button onClick={start} className={`px-6 py-2.5 rounded-xl text-sm font-bold ${dark?"bg-indigo-500 hover:bg-indigo-400":"bg-indigo-600 hover:bg-indigo-700"} text-white`}>
          {score>0&&!playing?"Play Again":"Start Catching"}
        </button>
      </div>
    </div>
  );
}

// ─── Tic Tac Toe helpers ──────────────────────────────────────────────────────
const WIN_LINES = [[0,1,2],[3,4,5],[6,7,8],[0,3,6],[1,4,7],[2,5,8],[0,4,8],[2,4,6]];
function checkWinner(board){for(const[a,b,c]of WIN_LINES){if(board[a]&&board[a]===board[b]&&board[a]===board[c])return board[a];}if(board.every(c=>c!==null))return "draw";return null;}
function getWinLine(board){for(const line of WIN_LINES){const[a,b,c]=line;if(board[a]&&board[a]===board[b]&&board[a]===board[c])return line;}return null;}
function mediumAI(board){const e=board.map((v,i)=>v===null?i:-1).filter(i=>i!==-1);for(const i of e){const b=[...board];b[i]="O";if(checkWinner(b)==="O")return i;}for(const i of e){const b=[...board];b[i]="X";if(checkWinner(b)==="X")return i;}if(board[4]===null)return 4;const c=[0,2,6,8].filter(i=>board[i]===null);if(c.length)return c[Math.floor(Math.random()*c.length)];return e[Math.floor(Math.random()*e.length)];}
function minimax(board,isMax){const w=checkWinner(board);if(w==="O")return 10;if(w==="X")return -10;if(board.every(c=>c!==null))return 0;if(isMax){let b=-Infinity;board.forEach((c,i)=>{if(c===null){board[i]="O";b=Math.max(b,minimax(board,false));board[i]=null;}});return b;}else{let b=Infinity;board.forEach((c,i)=>{if(c===null){board[i]="X";b=Math.min(b,minimax(board,true));board[i]=null;}});return b;}}
function hardAI(board){let best=-Infinity,move=-1;board.forEach((c,i)=>{if(c===null){board[i]="O";const s=minimax(board,false);board[i]=null;if(s>best){best=s;move=i;}}});return move;}

// ─── Tic Tac Toe ──────────────────────────────────────────────────────────────
export function TicTacToeTab({ dark }) {
  const [screen,setScreen]=useState("menu"); const [mode,setMode]=useState(null);
  const [difficulty,setDifficulty]=useState("medium"); const [board,setBoard]=useState(Array(9).fill(null));
  const [isXTurn,setIsXTurn]=useState(true); const [winner,setWinner]=useState(null);
  const [winLine,setWinLine]=useState(null); const [scores,setScores]=useState({X:0,O:0,draw:0});
  const [aiThinking,setAiThinking]=useState(false);

  const startGame=(m,d)=>{setMode(m);setDifficulty(d||"medium");setBoard(Array(9).fill(null));setIsXTurn(true);setWinner(null);setWinLine(null);setAiThinking(false);setScreen("playing");};
  const resetRound=()=>{setBoard(Array(9).fill(null));setIsXTurn(true);setWinner(null);setWinLine(null);setAiThinking(false);};
  const backToMenu=()=>{setScreen("menu");setScores({X:0,O:0,draw:0});setBoard(Array(9).fill(null));setWinner(null);setWinLine(null);};

  const handleClick=(idx)=>{
    if(board[idx]||winner||aiThinking)return;
    if(mode==="cpu"&&!isXTurn)return;
    const b=[...board];b[idx]=isXTurn?"X":"O";setBoard(b);
    const w=checkWinner(b);
    if(w){setWinner(w);setWinLine(getWinLine(b));setScores(s=>({...s,[w]:(s[w]||0)+1}));return;}
    setIsXTurn(!isXTurn);
  };

  useEffect(()=>{
    if(mode!=="cpu"||isXTurn||winner)return;
    setAiThinking(true);
    const t=setTimeout(()=>{
      const b=[...board];
      const m=difficulty==="hard"?hardAI(b):mediumAI(b);
      if(m===-1||m===undefined){setAiThinking(false);return;}
      b[m]="O";setBoard(b);
      const w=checkWinner(b);
      if(w){setWinner(w);setWinLine(getWinLine(b));setScores(s=>({...s,[w]:(s[w]||0)+1}));}
      else setIsXTurn(true);
      setAiThinking(false);
    },420);
    return()=>clearTimeout(t);
  },[isXTurn,mode,winner]);

  const cellStyle=(idx)=>{
    const val=board[idx];const inLine=winLine?.includes(idx);
    const base="aspect-square rounded-2xl border-2 flex items-center justify-center text-4xl font-black transition-all duration-200 select-none";
    if(inLine)return `${base} ${dark?"border-emerald-400 bg-emerald-500/20 scale-105":"border-emerald-500 bg-emerald-50 scale-105"}`;
    if(val==="X")return `${base} ${dark?"border-indigo-500/50 bg-indigo-500/10 text-indigo-400":"border-indigo-300 bg-indigo-50 text-indigo-600"}`;
    if(val==="O")return `${base} ${dark?"border-orange-500/50 bg-orange-500/10 text-orange-400":"border-orange-300 bg-orange-50 text-orange-500"}`;
    const clickable=!board[idx]&&!winner&&!aiThinking&&(mode==="dual"||isXTurn);
    return `${base} cursor-pointer ${dark?`border-white/10 bg-white/5 ${clickable?"hover:bg-white/10 hover:border-indigo-500/40 active:scale-95":""}`:`border-gray-200 bg-gray-50 ${clickable?"hover:bg-indigo-50 hover:border-indigo-300 active:scale-95":""}`}`;
  };

  if(screen==="menu")return(
    <div className="flex flex-col items-center gap-6 py-4">
      <div className="text-center"><p className="text-5xl mb-3">❌⭕</p><h2 className={`text-xl font-black ${dark?"text-white":"text-gray-900"}`}>Tic Tac Toe</h2><p className={`text-sm mt-1 ${dark?"text-gray-400":"text-gray-500"}`}>Choose how you want to play</p></div>
      <div className="grid grid-cols-2 gap-3 w-full max-w-xs">
        <div className={`rounded-2xl border p-4 flex flex-col items-center gap-3 ${dark?"bg-white/5 border-white/10":"bg-gray-50 border-gray-200"}`}>
          <span className="text-3xl">🤖</span><p className={`text-sm font-bold text-center ${dark?"text-white":"text-gray-800"}`}>vs Computer</p>
          <div className="flex flex-col gap-1.5 w-full">
            <button onClick={()=>startGame("cpu","medium")} className="w-full py-1.5 rounded-xl text-xs font-bold bg-indigo-500 hover:bg-indigo-400 text-white active:scale-95">Medium</button>
            <button onClick={()=>startGame("cpu","hard")} className={`w-full py-1.5 rounded-xl text-xs font-bold border active:scale-95 ${dark?"border-red-500/50 text-red-400 hover:bg-red-500/10":"border-red-300 text-red-600 hover:bg-red-50"}`}>Hard 💀</button>
          </div>
        </div>
        <div className={`rounded-2xl border p-4 flex flex-col items-center gap-3 ${dark?"bg-white/5 border-white/10":"bg-gray-50 border-gray-200"}`}>
          <span className="text-3xl">👥</span><p className={`text-sm font-bold text-center ${dark?"text-white":"text-gray-800"}`}>2 Players</p>
          <p className={`text-[10px] text-center ${dark?"text-gray-500":"text-gray-400"}`}>Pass & Play at the table</p>
          <button onClick={()=>startGame("dual")} className="w-full py-1.5 rounded-xl text-xs font-bold bg-orange-500 hover:bg-orange-400 text-white active:scale-95 mt-auto">Play Together</button>
        </div>
      </div>
    </div>
  );

  const turnLabel=()=>{if(winner==="draw")return"It's a Draw! 🤝";if(winner)return`${winner==="X"?(mode==="cpu"?"You Win! 🎉":"Player X Wins! 🎉"):(mode==="cpu"?"Computer Wins 🤖":"Player O Wins! 🎉")}`;if(aiThinking)return"Computer is thinking... 🤔";if(mode==="dual")return`Player ${isXTurn?"X":"O"}'s Turn`;return isXTurn?"Your Turn (X)":"Computer's Turn (O)";};
  const turnColor=()=>{if(winner==="draw")return dark?"text-gray-300":"text-gray-600";if(winner==="X")return dark?"text-indigo-400":"text-indigo-600";if(winner==="O")return dark?"text-orange-400":"text-orange-500";if(aiThinking)return dark?"text-gray-400":"text-gray-500";return isXTurn?(dark?"text-indigo-400":"text-indigo-600"):(dark?"text-orange-400":"text-orange-500");};

  return(
    <div className="flex flex-col items-center gap-4">
      <div className="flex items-center justify-between w-full">
        <button onClick={backToMenu} className={`text-xs px-3 py-1.5 rounded-xl border font-semibold active:scale-95 ${dark?"border-white/10 text-gray-400 hover:bg-white/5":"border-gray-200 text-gray-500 hover:bg-gray-50"}`}>← Back</button>
        <span className={`text-xs font-semibold px-3 py-1 rounded-full ${dark?"bg-white/5 text-gray-400":"bg-gray-100 text-gray-500"}`}>{mode==="cpu"?`vs Computer · ${difficulty.charAt(0).toUpperCase()+difficulty.slice(1)}`:"2 Players · Pass & Play"}</span>
      </div>
      <div className={`flex items-center gap-2 w-full rounded-2xl p-3 border ${dark?"bg-white/5 border-white/10":"bg-gray-50 border-gray-200"}`}>
        <div className={`flex-1 text-center rounded-xl py-2 ${dark?"bg-indigo-500/10":"bg-indigo-50"}`}><p className={`text-[10px] font-bold uppercase tracking-wider ${dark?"text-indigo-400":"text-indigo-500"}`}>{mode==="cpu"?"You (X)":"Player X"}</p><p className={`text-2xl font-black ${dark?"text-indigo-400":"text-indigo-600"}`}>{scores.X}</p></div>
        <div className="flex flex-col items-center px-2"><p className={`text-[10px] font-bold uppercase tracking-wider ${dark?"text-gray-500":"text-gray-400"}`}>Draw</p><p className={`text-xl font-black ${dark?"text-gray-400":"text-gray-500"}`}>{scores.draw}</p></div>
        <div className={`flex-1 text-center rounded-xl py-2 ${dark?"bg-orange-500/10":"bg-orange-50"}`}><p className={`text-[10px] font-bold uppercase tracking-wider ${dark?"text-orange-400":"text-orange-500"}`}>{mode==="cpu"?"Computer (O)":"Player O"}</p><p className={`text-2xl font-black ${dark?"text-orange-400":"text-orange-500"}`}>{scores.O}</p></div>
      </div>
      <p className={`text-sm font-bold ${turnColor()}`}>{turnLabel()}</p>
      <div className="grid grid-cols-3 gap-2 w-full max-w-[260px]">
        {board.map((val,idx)=>(
          <button key={idx} onClick={()=>handleClick(idx)} className={cellStyle(idx)} disabled={!!board[idx]||!!winner||aiThinking||(mode==="cpu"&&!isXTurn)}>
            <span className={`transition-all duration-150 ${val?"scale-100 opacity-100":"scale-50 opacity-0"}`}>{val==="X"?"✕":val==="O"?"○":""}</span>
          </button>
        ))}
      </div>
      <div className="flex gap-2 mt-1">
        {winner&&<button onClick={resetRound} className="px-5 py-2 rounded-xl text-sm font-bold bg-indigo-500 hover:bg-indigo-400 text-white active:scale-95">Play Again</button>}
        <button onClick={resetRound} className={`px-5 py-2 rounded-xl text-sm font-semibold border active:scale-95 ${dark?"border-white/10 text-gray-400 hover:bg-white/5":"border-gray-200 text-gray-500 hover:bg-gray-50"}`}>Reset Round</button>
      </div>
    </div>
  );
}