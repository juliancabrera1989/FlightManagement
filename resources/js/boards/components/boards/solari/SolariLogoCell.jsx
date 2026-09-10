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

  // 🎯 Referencias síncronas para evitar saltos o duplicaciones en los setTimeout
  const currentIndexRef = useRef(0);
  const bottomAirlineIndexRef = useRef(0);

  // === RESET visual al entrar en BLACK ===
  useEffect(() => {
    if (mode === "BLACK") {
      if (timerRef.current) clearTimeout(timerRef.current);
      runningRef.current = false;
      setIsBlack(true);
      setCurrentAirlineIndex(0); 
      currentIndexRef.current = 0;
      bottomAirlineIndexRef.current = 0;
      setFlipTop(false);
      setFlipBottom(false);
    }
  }, [mode]);

  // === Motor de Rotación Mecánica de Logos ===
  const runRotation = (targetIndex, callback) => {
    // 1. Si no hay abecedario o el índice destino es inválido, avisamos y salimos sin trancar la fase
    if (!airlineCharset || airlineCharset.length === 0 || targetIndex < 0 || targetIndex >= airlineCharset.length) {
      runningRef.current = false;
      callback && callback();
      return;
    }

    // 2. Si ya estamos exactamente en el logo objetivo, frenamos de inmediato
    if (currentIndexRef.current === targetIndex) {
      runningRef.current = false;
      if (targetIndex === 0) setIsBlack(true);
      else setIsBlack(false);
      callback && callback();
      return;
    }

    // Si ya hay una animación corriendo para esta misma celda, no duplicamos loops
    if (runningRef.current) return;

    runningRef.current = true;
    setIsBlack(false);

    const step = () => {
      if (!runningRef.current) return;

      const current = currentIndexRef.current;

      // Condición de parada exacta: si alcanzamos el objetivo, notificamos la fase
      if (current === targetIndex) {
        runningRef.current = false;
        if (current === 0) setIsBlack(true);
        callback && callback();
        return;
      }

      // Avanzamos o retrocedemos 1 posición
      const next = current < targetIndex ? current + 1 : current - 1;

      // Actualizamos estado de la solapa superior (siguiente logo)
      currentIndexRef.current = next;
      setCurrentAirlineIndex(next);
      setFlipTop(true);
      setFlipBottom(false);

      // Impacto en el centro (caída de solapa)
      timerRef.current = setTimeout(() => {
        if (!runningRef.current) return;

        setFlipTop(false);
        setFlipBottom(true);
        
        // Sincronización exacta de la solapa inferior
        bottomAirlineIndexRef.current = next;

        // Si en este paso llegamos al destino final
        if (next === targetIndex) {
          runningRef.current = false;
          if (next === 0) setIsBlack(true);

          // Esperamos a que concluya el movimiento visual antes de dar por terminada la fase
          timerRef.current = setTimeout(() => {
            setFlipBottom(false);
            callback && callback();
          }, ROTATION_SPEED - FLIP_DELAY);
          return;
        }

        // Siguiente flap
        timerRef.current = setTimeout(step, ROTATION_SPEED - FLIP_DELAY);

      }, FLIP_DELAY);
    };

    step();
  };

  // === Lógica de BUILD ===
  useEffect(() => {
    if (mode !== "BUILD") return;

    if (!airlineCharset || airlineCharset.length === 0) {
      onBuildDone && onBuildDone();
      return;
    }

    // Comparación estricta pero independiente del tipo (String vs Number)
    const targetIndex = airlineCharset.findIndex(
      (a) => String(a.id) === String(targetAirlineId)
    );

    if (targetIndex === -1) {
      onBuildDone && onBuildDone();
      return;
    }

    runRotation(targetIndex, onBuildDone);
  }, [mode, targetAirlineId, airlineCharset]);

  // === Lógica de CLEAR ===
  useEffect(() => {
    if (mode !== "CLEAR") return;

    if (!airlineCharset || airlineCharset.length === 0) {
      onClearDone && onClearDone();
      return;
    }

    runRotation(0, onClearDone);
  }, [mode, airlineCharset]);

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
        {topLogoSrc && !isBlack && (
          <img 
            src={topLogoSrc} 
            alt={topLogoData?.name || "logo"} 
            className="solari-logo-split"
          />
        )}
      </div>

      {/* Mitad Inferior: Muestra el logo estático anterior hasta el impacto exacto */}
      <div className="solari-flap bottom">
        {bottomLogoSrc && !isBlack && (
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