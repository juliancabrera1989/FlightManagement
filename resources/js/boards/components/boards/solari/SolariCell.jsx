import { useEffect, useRef, useState } from "react";

const DEFAULT_CHARSET = [
  "1","2","3","4","5","6","7","8","9","0",
  "A","B","C","D","E","F","G",
  "H","I","J","K","L","M","N",
  "O","P","Q","R","S","T","U",
  "V","W","X","Y","Z",
  ".", "-", "/"
];

const NUMERIC_CHARSET = ["1","2","3","4","5","6","7","8","9","0", " "];

const FLIP_DELAY = 40; // ms entre top y bottom (visual, no lógico)

export default function SolariCell({
  mode,
  targetChar,
  animable,
  onBuildDone,
  onClearDone,
  isNumeric = false // <-- Nueva propiedad (por soal es false)
}) {
 // Elegimos el rodillo mecánico correcto según la celda
  const CHARSET = isNumeric ? NUMERIC_CHARSET : DEFAULT_CHARSET;

  const [displayChar, setDisplayChar] = useState(null);
  const [isBlack, setIsBlack] = useState(true);
  const [flipTop, setFlipTop] = useState(false);
  const [flipBottom, setFlipBottom] = useState(false);

  const runningRef = useRef(false);

  // === RESET visual al entrar en BLACK ===
  useEffect(() => {
    if (mode === "BLACK") {
      runningRef.current = false;
      setIsBlack(true);
      setDisplayChar(null);
      setFlipTop(false);
      setFlipBottom(false);
    }
  }, [mode]);



  // === BUILD ===

useEffect(() => {
  if (mode !== "BUILD") return;

  // ⛔️ celdas pasivas NO participan
if (!animable) {
  onBuildDone && onBuildDone();
  return;
}

  if (runningRef.current) return;
  runningRef.current = true;

  setIsBlack(false);

  const targetIndex = CHARSET.indexOf(targetChar);
  if (targetIndex === -1) {
    runningRef.current = false;
    onBuildDone && onBuildDone();
    return;
  }

  let current = 0;

const step = () => {
  if (!runningRef.current) return;

  setFlipTop(true);
  setFlipBottom(false);
  setDisplayChar(CHARSET[current]);

  setTimeout(() => {
    setFlipTop(false);
    setFlipBottom(true);
  }, FLIP_DELAY);

  if (current === targetIndex) {
    runningRef.current = false;
    onBuildDone && onBuildDone();
    return;
  }

  current += 1;
  setTimeout(step, 120);
};


  step();
}, [mode, targetChar, animable]);

useEffect(() => {
  if (mode !== "CLEAR") return;

  if (!animable) {
    onClearDone && onClearDone();
    return;
  }

  runningRef.current = true;

  const startIndex = CHARSET.indexOf(targetChar);
  let current = startIndex === -1 ? 0 : startIndex;

  const step = () => {
    if (!runningRef.current) return;

    if (current >= CHARSET.length) {
      runningRef.current = false;
      setIsBlack(true);
      setDisplayChar(null);
      onClearDone && onClearDone();
      return;
    }

    setFlipTop(true);
    setFlipBottom(false);
    setDisplayChar(CHARSET[current]);

    setTimeout(() => {
      setFlipTop(false);
      setFlipBottom(true);
    }, FLIP_DELAY);

    current += 1;
    setTimeout(step, 120);
  };

  step();
}, [mode, animable, targetChar]);

  return (
    <div className={`solari-cell ${isBlack ? "black" : ""} ${flipTop ? "flip-top" : ""} ${flipBottom ? "flip-bottom" : ""}`}>
      <div className="solari-flap top">
        <span>{displayChar}</span>
      </div>
      <div className="solari-flap bottom">
        <span>{displayChar}</span>
      </div>
    </div>
  );
}



