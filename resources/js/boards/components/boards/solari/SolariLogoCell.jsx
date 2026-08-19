import React, { useEffect, useRef, useState } from "react";

const FLIP_DELAY = 40; // ms entre top y bottom (visual)
const ROTATION_SPEED = 180; // ms por cada flap

export default function SolariLogoCell({
  mode,
  targetAirlineId,
  airlineCharset = [], // 🎯 Recibimos el abecedario dinámico aquí 
  onBuildDone,
  onClearDone
}) {
  const [currentAirlineIndex, setCurrentAirlineIndex] = useState(0); 
  const [isBlack, setIsBlack] = useState(true);
  const [flipTop, setFlipTop] = useState(false);
  const [flipBottom, setFlipBottom] = useState(false);
  const runningRef = useRef(false);

  // 🎯 REFERENCIA CLAVE: Guarda el índice que se muestra de fondo abajo
  const bottomAirlineIndexRef = useRef(0);

  // === RESET visual al entrar en BLACK ===
  useEffect(() => {
    if (mode === "BLACK") {
      runningRef.current = false;
      setIsBlack(true);
      setCurrentAirlineIndex(0); 
      bottomAirlineIndexRef.current = 0;
      setFlipTop(false);
      setFlipBottom(false);
    }
  }, [mode]);

  // === Motor de Rotación Mecánica de Logos ===
  const runRotation = (targetIndex, callback) => {
    if (runningRef.current) return;
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
      setTimeout(() => {
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
        setTimeout(step, ROTATION_SPEED - FLIP_DELAY);

      }, FLIP_DELAY);
    };

    step();
  };

  // === Lógica de BUILD ===
  useEffect(() => {
    if (mode !== "BUILD") return;
    // const targetIndex = AIRLINE_CHARSET.findIndex(a => a.id === targetAirlineId);
    const targetIndex = airlineCharset.findIndex(a => a.id === targetAirlineId);
    if (targetIndex === -1) {
       onBuildDone && onBuildDone(); 
       return;
    }
    runRotation(targetIndex, onBuildDone);
  }, [mode, targetAirlineId]);

  // === Lógica de CLEAR ===
  useEffect(() => {
    if (mode !== "CLEAR") return;
    runRotation(0, onClearDone);
  }, [mode]);

  // Resuelve las URLs de las imágenes
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
            alt={topLogoData.name} 
            className="solari-logo-split"
          />
        )}
      </div>

      {/* Mitad Inferior: Muestra el logo estático anterior hasta el impacto exacto */}
      <div className="solari-flap bottom">
        {bottomLogoSrc && (
          <img 
            src={bottomLogoSrc} 
            alt={bottomLogoData.name} 
            className="solari-logo-split"
          />
        )}
      </div>

    </div>
  );
}
