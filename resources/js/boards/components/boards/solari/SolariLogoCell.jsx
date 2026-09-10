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
  const [currentAirlineIndex, setCurrentAirlineIndex] = useState(-1); 
  const [isBlack, setIsBlack] = useState(true);
  const [flipTop, setFlipTop] = useState(false);
  const [flipBottom, setFlipBottom] = useState(false);
  
  const runningRef = useRef(false);
  const timerRef = useRef(null);
  const bottomAirlineIndexRef = useRef(-1);

  const clearTimers = () => {
    if (timerRef.current) clearTimeout(timerRef.current);
  };

  // RESET visual al entrar en BLACK
  useEffect(() => {
    if (mode === "BLACK") {
      clearTimers();
      runningRef.current = false;
      setIsBlack(true);
      setCurrentAirlineIndex(-1); 
      bottomAirlineIndexRef.current = -1;
      setFlipTop(false);
      setFlipBottom(false);
    }
  }, [mode]);

  // Motor de Rotación
  const runRotation = (targetIndex, callback) => {
    clearTimers();
    runningRef.current = true;
    setIsBlack(false);

    // Si el índice inicial es -1 (apagado), empezamos a rotar desde 0
    let current = currentAirlineIndex < 0 ? 0 : currentAirlineIndex;
    setCurrentAirlineIndex(current);
    bottomAirlineIndexRef.current = current;

    // Si la aerolínea objetivo es justamente la primera o es inválida
    if (targetIndex === current || targetIndex < 0) {
      runningRef.current = false;
      if (targetIndex < 0) setIsBlack(true);
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

    if (!airlineCharset || airlineCharset.length === 0 || targetAirlineId == null) {
      onBuildDone && onBuildDone();
      return;
    }

    // Búsqueda flexible de ID (soporta string, number y subobjetos)
    const targetIndex = airlineCharset.findIndex(a => {
      if (!a) return false;
      const itemId = a.id ?? a.airline_id;
      return String(itemId) === String(targetAirlineId);
    });

    if (targetIndex === -1) {
      console.warn(`[SolariLogoCell] No se encontró la aerolínea con ID: ${targetAirlineId} en airlineCharset`);
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

    // Durante CLEAR, volvemos al estado negro aparente
    runningRef.current = false;
    setIsBlack(true);
    setCurrentAirlineIndex(-1);
    bottomAirlineIndexRef.current = -1;
    onClearDone && onClearDone();

    return () => clearTimers();
  }, [mode, airlineCharset]);

  // Construcción limpia de la URL de la imagen
  const getLogoUrl = (itemIndex) => {
    if (itemIndex < 0 || !airlineCharset[itemIndex]) return null;
    const logoData = airlineCharset[itemIndex];
    const path = logoData.logo_path || logoData.logo || logoData.url;
    if (!path) return null;

    if (path.startsWith("http://") || path.startsWith("https://")) {
      return path;
    }

    const cleanPath = path.startsWith("/") ? path : `/${path}`;
    return `${window.location.origin}${cleanPath}`;
  };

  const topLogoSrc = getLogoUrl(currentAirlineIndex);
  const bottomLogoSrc = getLogoUrl(bottomAirlineIndexRef.current);

  return (
    <div 
      className={`solari-cell-logo solari-logo-flap ${isBlack ? "black" : ""} ${flipTop ? "flip-top" : ""} ${flipBottom ? "flip-bottom" : ""}`}
      style={{ backgroundColor: "#000", overflow: "hidden" }}
    >
      <div className="solari-flap top">
        {topLogoSrc ? (
          <img 
            src={topLogoSrc} 
            alt="logo" 
            className="solari-logo-split"
            onError={(e) => {
              console.error(`Error cargando imagen: ${topLogoSrc}`);
            }}
          />
        ) : null}
      </div>

      <div className="solari-flap bottom">
        {bottomLogoSrc ? (
          <img 
            src={bottomLogoSrc} 
            alt="logo" 
            className="solari-logo-split"
            onError={(e) => {
              console.error(`Error cargando imagen: ${bottomLogoSrc}`);
            }}
          />
        ) : null}
      </div>
    </div>
  );
}