import React, { useEffect, useRef, useState } from "react";

const FLIP_DELAY = 40; // ms entre top y bottom (visual)
const ROTATION_SPEED = 180; // ms por cada flap

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

  // 🎯 REFERENCIA CLAVE ORIGINAL: Guarda el índice que se muestra de fondo abajo
  const bottomAirlineIndexRef = useRef(0);

  const clearTimers = () => {
    if (timerRef.current) clearTimeout(timerRef.current);
  };

  // === RESET visual al entrar en BLACK ===
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

  // === Motor de Rotación Mecánica de Logos (ORIGINAL TUYO) ===
  const runRotation = (targetIndex, callback) => {
    if (runningRef.current) return;

    // Si ya estamos en la posición o el destino no existe, avisamos fin de fase
    if (currentAirlineIndex === targetIndex || targetIndex < 0) {
      runningRef.current = false;
      if (targetIndex === 0) setIsBlack(true);
      callback && callback();
      return;
    }

    runningRef.current = true;
    setIsBlack(false);

    let current = currentAirlineIndex;

    const step = () => {
      if (!runningRef.current) return;

      // 1. Calculamos cuál será el próximo logo antes de girar
      const next = current < targetIndex ? current + 1 : current - 1;

      // 2. La solapa superior cambia AL NUEVO LOGO y empieza a caer
      setCurrentAirlineIndex(next);
      setFlipTop(true);
      setFlipBottom(false);

      // 3. Cuando la solapa superior impacta en el centro (FLIP_DELAY)...
      timerRef.current = setTimeout(() => {
        if (!runningRef.current) return;

        setFlipTop(false);
        setFlipBottom(true);
        
        // 🎯 SINCRO PERFECTA: Recién acá la solapa inferior adopta el nuevo logo
        bottomAirlineIndexRef.current = next;
        current = next;

        // Si ya igualamos el objetivo, frenamos
        if (current === targetIndex) {
          runningRef.current = false;
          if (current === 0) setIsBlack(true); 
          callback && callback();
          return;
        }

        // 4. Esperamos a que termine el ciclo completo para el siguiente flap
        timerRef.current = setTimeout(step, ROTATION_SPEED - FLIP_DELAY);

      }, FLIP_DELAY);
    };

    step();
  };

  // === Lógica de BUILD (Con control de fases estricto) ===
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

  // === Lógica de CLEAR (Con control de fases estricto) ===
  useEffect(() => {
    if (mode !== "CLEAR") return;

    if (!airlineCharset || airlineCharset.length === 0) {
      onClearDone && onClearDone();
      return;
    }

    runRotation(0, onClearDone);

    return () => clearTimers();
  }, [mode, airlineCharset]);

  // Resuelve las URLs de las imágenes (ORIGINAL TUYO)
  const baseUrl = window.APP_URL || ""; 

  const topLogoData = airlineCharset[currentAirlineIndex];
  const topLogoSrc = topLogoData?.logo_path ? `${baseUrl}${topLogoData.logo_path}` : null;

  const bottomLogoData = airlineCharset[bottomAirlineIndexRef.current];
  const bottomLogoSrc = bottomLogoData?.logo_path ? `${baseUrl}${bottomLogoData.logo_path}` : null;

  return (
    <div className={`solari-cell-logo solari-logo-flap ${isBlack ? "black" : ""} ${flipTop ? "flip-top" : ""} ${flipBottom ? "flip-bottom" : ""}`}>
      
      {/* Mitad Superior: Muestra el logo hacia el cual estamos transicionando */}
      <div className="solari-flap top">
        {topLogoSrc && (
          <img 
            src={topLogoSrc} 
            alt={topLogoData?.name || "logo"} 
            className="solari-logo-split"
          />
        )}
      </div>

      {/* Mitad Inferior: Muestra el logo estático anterior hasta el impacto exacto */}
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