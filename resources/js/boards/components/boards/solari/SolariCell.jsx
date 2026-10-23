import { useEffect, useState, useRef } from "react";

const DEFAULT_CHARSET = [
  " ", 
  "A","B","C","D","E","F","G",
  "H","I","J","K","L","M","N",
  "O","P","Q","R","S","T","U",
  "V","W","X","Y","Z",
  "1","2","3","4","5","6","7","8","9","0",
  ".", "-", "/"
];

const NUMERIC_CHARSET = [" ", "1","2","3","4","5","6","7","8","9","0"];

const STEP_DELAY = 100; // Velocidad fluida y segura por paso
const FLIP_DELAY = 50;  // Mitad exacta para el cambio de solapa

export default function SolariCell({
  mode,
  targetChar,
  animable = true,
  isNumeric = false
}) {
  const CHARSET = isNumeric ? NUMERIC_CHARSET : DEFAULT_CHARSET;

  const [displayChar, setDisplayChar] = useState(" ");
  const [isBlack, setIsBlack] = useState(true);
  const [flipTop, setFlipTop] = useState(false);
  const [flipBottom, setFlipBottom] = useState(false);

  const runningRef = useRef(false);

  // RESET absoluto al entrar en BLACK
  useEffect(() => {
    if (mode === "BLACK") {
      runningRef.current = false;
      setIsBlack(true);
      setDisplayChar(" ");
      setFlipTop(false);
      setFlipBottom(false);
    }
  }, [mode]);

  // BUILD: Recorre estrictamente desde el espacio hasta la letra objetivo de forma independiente
  useEffect(() => {
    if (mode !== "BUILD") return;

    const normalizedTarget = (targetChar || " ").toUpperCase();
    const targetIdx = CHARSET.indexOf(normalizedTarget);
    const finalTargetIndex = targetIdx !== -1 ? targetIdx : 0;

    if (!animable) {
      setDisplayChar(CHARSET[finalTargetIndex]);
      setIsBlack(false);
      return;
    }

    runningRef.current = true;
    setIsBlack(false);

    let currentIdx = 0; // Arrancamos siempre desde el inicio (espacio en índice 0) para un giro mecánico realista
    setDisplayChar(CHARSET[currentIdx]);

    let timeoutStep = null;
    let timeoutFlip = null;

    const step = () => {
      if (!runningRef.current) return;

      // Si ya llegamos al índice objetivo, nos plantamos en reposo absoluto
      if (currentIdx === finalTargetIndex) {
        runningRef.current = false;
        setFlipTop(false);
        setFlipBottom(false);
        return;
      }

      currentIdx = (currentIdx + 1) % CHARSET.length;
      setDisplayChar(CHARSET[currentIdx]);

      // Animación de la solapa
      setFlipTop(true);
      setFlipBottom(false);

      timeoutFlip = setTimeout(() => {
        if (!runningRef.current) return;
        setFlipTop(false);
        setFlipBottom(true);

        // Si este paso exacto es el target, nos detenemos aquí con seguridad
        if (currentIdx === finalTargetIndex) {
          timeoutStep = setTimeout(() => {
            if (!runningRef.current) return;
            runningRef.current = false;
            setFlipTop(false);
            setFlipBottom(false);
          }, FLIP_DELAY);
        } else {
          timeoutStep = setTimeout(step, STEP_DELAY - FLIP_DELAY);
        }
      }, FLIP_DELAY);
    };

    // Arrancar el primer paso
    timeoutStep = setTimeout(step, STEP_DELAY);

    return () => {
      runningRef.current = false;
      if (timeoutStep) clearTimeout(timeoutStep);
      if (timeoutFlip) clearTimeout(timeoutFlip);
    };
  }, [mode, targetChar, animable]);

  // CLEAR
  useEffect(() => {
    if (mode !== "CLEAR") return;

    if (!animable) {
      setIsBlack(true);
      setDisplayChar(" ");
      return;
    }

    runningRef.current = true;
    let currentIdx = CHARSET.indexOf(displayChar);
    if (currentIdx === -1) currentIdx = 0;

    let timeoutStep = null;
    let timeoutFlip = null;

    const runClear = () => {
      if (!runningRef.current) return;

      currentIdx = (currentIdx + 1) % CHARSET.length;
      setDisplayChar(CHARSET[currentIdx]);

      setFlipTop(true);
      setFlipBottom(false);

      timeoutFlip = setTimeout(() => {
        if (!runningRef.current) return;
        setFlipTop(false);
        setFlipBottom(true);

        if (currentIdx === 0) {
          runningRef.current = false;
          setIsBlack(true);
          setDisplayChar(" ");
          setFlipTop(false);
          setFlipBottom(false);
        } else {
          timeoutStep = setTimeout(runClear, STEP_DELAY - FLIP_DELAY);
        }
      }, FLIP_DELAY);
    };

    timeoutStep = setTimeout(runClear, STEP_DELAY);

    return () => {
      runningRef.current = false;
      if (timeoutStep) clearTimeout(timeoutStep);
      if (timeoutFlip) clearTimeout(timeoutFlip);
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