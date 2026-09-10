import React, { useEffect, useRef, useState } from "react";

const FLIP_DELAY = 40; 
const ROTATION_SPEED = 180; 

export default function SolariLogoCell({
  mode,
  targetAirlineId,
  airlineCharset = [], 
  onBuildDone,
  onClearDone
}) {
  const [currentAirlineIndex, setCurrentAirlineIndex] = useState(0); 
  const [isBlack, setIsBlack] = useState(true);
  const [flipTop, setFlipTop] = useState(false);
  const [flipBottom, setFlipBottom] = useState(false);
  const runningRef = useRef(false);
  const timerRef = useRef(null);

  const bottomAirlineIndexRef = useRef(0);

  const clearTimers = () => {
    if (timerRef.current) clearTimeout(timerRef.current);
  };

  // RESET visual al entrar en BLACK
  useEffect(() => {
    if (mode === "BLACK") {
      clearTimers();
      runningRef.current = false;
      setIsBlack(true);
      setCurrentAirlineIndex(0); 
      bottomAirlineIndexRef.current = 0;
      setFlipTop(false);
      setFlipBottom(false);
    }
  }, [mode]);

  // Motor de Rotación
  const runRotation = (targetIndex, callback) => {
    if (runningRef.current) return;
    runningRef.current = true;
    setIsBlack(false);

    let current = currentAirlineIndex;

    // Si el índice objetivo es igual al actual o inválido
    if (targetIndex === current || targetIndex < 0) {
      runningRef.current = false;
      if (targetIndex === 0) setIsBlack(true);
      callback && callback();
      return;
    }

    const step = () => {
      if (!runningRef.current) return;

      const next = current < targetIndex ? current + 1 : current - 1;

      setCurrentAirlineIndex(next);
      setFlipTop(true);
      setFlipBottom(false);

      timerRef.current = setTimeout(() => {
        if (!runningRef.current) return;

        setFlipTop(false);
        setFlipBottom(true);
        
        bottomAirlineIndexRef.current = next;
        current = next;

        if (current === targetIndex) {
          runningRef.current = false;
          if (current === 0) setIsBlack(true); 
          callback && callback();
          return;
        }

        timerRef.current = setTimeout(step, ROTATION_SPEED - FLIP_DELAY);

      }, FLIP_DELAY);
    };

    step();
  };

  // BUILD
  useEffect(() => {
    if (mode !== "BUILD") return;

    if (!airlineCharset || airlineCharset.length === 0) {
      onBuildDone && onBuildDone();
      return;
    }

    const targetIndex = airlineCharset.findIndex(a => String(a.id) === String(targetAirlineId));
    if (targetIndex === -1) {
      onBuildDone && onBuildDone(); 
      return;
    }
    runRotation(targetIndex, onBuildDone);

    return () => clearTimers();
  }, [mode, targetAirlineId, airlineCharset]);

  // CLEAR
  useEffect(() => {
    if (mode !== "CLEAR") return;

    if (!airlineCharset || airlineCharset.length === 0) {
      onClearDone && onClearDone();
      return;
    }

    runRotation(0, onClearDone);

    return () => clearTimers();
  }, [mode, airlineCharset]);

  const baseUrl = window.APP_URL || ""; 

  const topLogoData = airlineCharset[currentAirlineIndex];
  const topLogoSrc = topLogoData?.logo_path ? `${baseUrl}${topLogoData.logo_path}` : null;

  const bottomLogoData = airlineCharset[bottomAirlineIndexRef.current];
  const bottomLogoSrc = bottomLogoData?.logo_path ? `${baseUrl}${bottomLogoData.logo_path}` : null;

  return (
    <div className={`solari-cell-logo solari-logo-flap ${isBlack ? "black" : ""} ${flipTop ? "flip-top" : ""} ${flipBottom ? "flip-bottom" : ""}`}>
      <div className="solari-flap top">
        {topLogoSrc && (
          <img 
            src={topLogoSrc} 
            alt={topLogoData?.name || "logo"} 
            className="solari-logo-split"
          />
        )}
      </div>

      <div className="solari-flap bottom">
        {bottomLogoSrc && (
          <img 
            src={bottomLogoSrc} 
            alt={bottomLogoData?.name || "logo"} 
            className="solari-logo-split"
          />
        )}
      </div>
    </div>
  );
}