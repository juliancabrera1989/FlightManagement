import { useEffect, useRef, useState } from "react";

const DEFAULT_CHARSET = [
  " ", "A","B","C","D","E","F","G",
  "H","I","J","K","L","M","N",
  "O","P","Q","R","S","T","U",
  "V","W","X","Y","Z",
  "1","2","3","4","5","6","7","8","9","0",
  ".", "-", "/"
];

const NUMERIC_CHARSET = [" ", "1","2","3","4","5","6","7","8","9","0"];

const FLIP_DELAY = 30;
const STEP_DELAY = 60;

export default function SolariCell({
  mode,
  targetChar,
  animable = true,
  onBuildDone,
  onClearDone,
  isNumeric = false
}) {
  const CHARSET = isNumeric ? NUMERIC_CHARSET : DEFAULT_CHARSET;

  const [displayChar, setDisplayChar] = useState(" ");
  const [isBlack, setIsBlack] = useState(true);
  const [flipTop, setFlipTop] = useState(false);
  const [flipBottom, setFlipBottom] = useState(false);

  const runningRef = useRef(false);
  const timer1Ref = useRef(null);
  const timer2Ref = useRef(null);

  const clearTimers = () => {
    if (timer1Ref.current) clearTimeout(timer1Ref.current);
    if (timer2Ref.current) clearTimeout(timer2Ref.current);
  };

  // Reset absoluto cuando entramos a BLACK
  useEffect(() => {
    if (mode === "BLACK") {
      clearTimers();
      runningRef.current = false;
      setIsBlack(true);
      setDisplayChar(" ");
      setFlipTop(false);
      setFlipBottom(false);
    }
  }, [mode]);

  // BUILD
  useEffect(() => {
    if (mode !== "BUILD") return;

    if (!animable) {
      onBuildDone?.();
      return;
    }

    clearTimers();
    runningRef.current = true;
    setIsBlack(false);

    const normalizedChar = (targetChar || " ").toUpperCase();
    let targetIndex = CHARSET.indexOf(normalizedChar);
    if (targetIndex === -1) targetIndex = 0; // Si no existe, cae en espacio ' '

    let current = 0;

    const step = () => {
      if (!runningRef.current) return;

      setDisplayChar(CHARSET[current]);
      setFlipTop(true);
      setFlipBottom(false);

      timer1Ref.current = setTimeout(() => {
        if (!runningRef.current) return;
        setFlipTop(false);
        setFlipBottom(true);
      }, FLIP_DELAY);

      if (current === targetIndex) {
        runningRef.current = false;
        onBuildDone?.();
        return;
      }

      current += 1;
      timer2Ref.current = setTimeout(step, STEP_DELAY);
    };

    step();

    return () => {
      runningRef.current = false;
      clearTimers();
    };
  }, [mode, targetChar, animable]);

  // CLEAR
  useEffect(() => {
    if (mode !== "CLEAR") return;

    if (!animable) {
      onClearDone?.();
      return;
    }

    clearTimers();
    runningRef.current = true;

    const currentChar = displayChar || " ";
    let startIndex = CHARSET.indexOf(currentChar);
    if (startIndex === -1) startIndex = 0;

    let current = startIndex;

    const step = () => {
      if (!runningRef.current) return;

      if (current >= CHARSET.length || current === 0) {
        runningRef.current = false;
        setIsBlack(true);
        setDisplayChar(" ");
        onClearDone?.();
        return;
      }

      setDisplayChar(CHARSET[current]);
      setFlipTop(true);
      setFlipBottom(false);

      timer1Ref.current = setTimeout(() => {
        if (!runningRef.current) return;
        setFlipTop(false);
        setFlipBottom(true);
      }, FLIP_DELAY);

      current = (current + 1) % CHARSET.length;
      timer2Ref.current = setTimeout(step, STEP_DELAY);
    };

    step();

    return () => {
      runningRef.current = false;
      clearTimers();
    };
  }, [mode, animable]);

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