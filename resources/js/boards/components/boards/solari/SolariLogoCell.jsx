import React, { useEffect, useRef, useState } from "react";

const FLIP_DELAY = 40; // ms de caída top
const ROTATION_SPEED = 180; // ms total por cada giro

export default function SolariLogoCell({
  mode,
  targetAirlineId,
  airlineCharset = [],
  onBuildDone,
  onClearDone
}) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [nextIndex, setNextIndex] = useState(0);
  const [isBlack, setIsBlack] = useState(true);
  const [flipTop, setFlipTop] = useState(false);
  const [flipBottom, setFlipBottom] = useState(false);

  const runningRef = useRef(false);
  const timerRef = useRef(null);

  const clearTimers = () => {
    if (timerRef.current) clearTimeout(timerRef.current);
  };

  // Helper para resolver la URL del logo sea absoluta o relativa
  const getLogoUrl = (logoData) => {
    if (!logoData) return null;
    const path = logoData.logo_path || logoData.logo;
    if (!path) return null;

    if (path.startsWith("http://") || path.startsWith("https://")) {
      return path;
    }

    const baseUrl = window.APP_URL || window.location.origin || "";
    const cleanPath = path.startsWith("/") ? path : `/${path}`;
    return `${baseUrl}${cleanPath}`;
  };

  // 1. RESET AL ENTRAR EN ESTADO BLACK
  useEffect(() => {
    if (mode === "BLACK") {
      clearTimers();
      runningRef.current = false;
      setIsBlack(true);
      setCurrentIndex(0);
      setNextIndex(0);
      setFlipTop(false);
      setFlipBottom(false);
    }
  }, [mode]);

  // Motor de Rotación con Física Completa
  const runRotation = (targetIdx, callback) => {
    if (runningRef.current) return;
    
    let current = currentIndex;

    // Si ya estamos en el objetivo o el abecedario está vacío
    if (current === targetIdx || targetIdx < 0) {
      runningRef.current = false;
      if (targetIdx === 0) setIsBlack(true);
      callback && callback();
      return;
    }

    runningRef.current = true;
    setIsBlack(false);

    const step = () => {
      if (!runningRef.current) return;

      const next = current < targetIdx ? current + 1 : current - 1;

      // Configuramos el logo que viene
      setNextIndex(next);

      // Fase 1: Cae la mitad superior del logo actual
      setFlipTop(true);
      setFlipBottom(false);

      timerRef.current = setTimeout(() => {
        if (!runningRef.current) return;

        // Fase 2: Pasa el centro y se despliega la mitad inferior del nuevo logo
        setFlipTop(false);
        setFlipBottom(true);
        setCurrentIndex(next);

        // Al finalizar el ciclo de 1 flap
        timerRef.current = setTimeout(() => {
          if (!runningRef.current) return;

          setFlipBottom(false);
          current = next;

          if (current === targetIdx) {
            runningRef.current = false;
            if (current === 0) setIsBlack(true);
            callback && callback();
            return;
          }

          // Siguiente paso
          step();
        }, ROTATION_SPEED - FLIP_DELAY);

      }, FLIP_DELAY);
    };

    step();
  };

  // 2. FASE BUILD
  useEffect(() => {
    if (mode !== "BUILD") return;

    if (!airlineCharset || airlineCharset.length === 0) {
      onBuildDone && onBuildDone();
      return;
    }

    const targetIdx = airlineCharset.findIndex(
      (a) => String(a.id) === String(targetAirlineId)
    );

    if (targetIdx === -1) {
      onBuildDone && onBuildDone();
      return;
    }

    runRotation(targetIdx, onBuildDone);

    return () => clearTimers();
  }, [mode, targetAirlineId, airlineCharset]);

  // 3. FASE CLEAR
  useEffect(() => {
    if (mode !== "CLEAR") return;

    if (!airlineCharset || airlineCharset.length === 0) {
      onClearDone && onClearDone();
      return;
    }

    runRotation(0, onClearDone);

    return () => clearTimers();
  }, [mode, airlineCharset]);

  // URLs de las imágenes
  const currentLogoUrl = getLogoUrl(airlineCharset[currentIndex]);
  const nextLogoUrl = getLogoUrl(airlineCharset[nextIndex]);

  return (
    <div
      className={`solari-cell-logo solari-logo-flap ${isBlack ? "black" : ""} ${
        flipTop ? "flip-top" : ""
      } ${flipBottom ? "flip-bottom" : ""}`}
    >
      {/* 1. Fondo Superior Estático (Siguiente Logo) */}
      <div className="solari-flap top">
        {nextLogoUrl && !isBlack && (
          <img
            src={nextLogoUrl}
            alt="logo-next"
            className="solari-logo-split"
            onError={(e) => { e.target.style.display = "none"; }}
          />
        )}
      </div>

      {/* 2. Fondo Inferior Estático (Logo Actual) */}
      <div className="solari-flap bottom">
        {currentLogoUrl && !isBlack && (
          <img
            src={currentLogoUrl}
            alt="logo-current"
            className="solari-logo-split"
            onError={(e) => { e.target.style.display = "none"; }}
          />
        )}
      </div>

      {/* 3. Solapa Cayendo Superior (Gira de 0deg a -90deg) */}
      {flipTop && (
        <div className="solari-flap top flip-moving">
          {currentLogoUrl && !isBlack && (
            <img
              src={currentLogoUrl}
              alt="logo-moving-top"
              className="solari-logo-split"
              onError={(e) => { e.target.style.display = "none"; }}
            />
          )}
        </div>
      )}

      {/* 4. Solapa Desplegándose Inferior (Gira de 90deg a 0deg) */}
      {flipBottom && (
        <div className="solari-flap bottom flip-moving">
          {nextLogoUrl && !isBlack && (
            <img
              src={nextLogoUrl}
              alt="logo-moving-bottom"
              className="solari-logo-split"
              onError={(e) => { e.target.style.display = "none"; }}
            />
          )}
        </div>
      )}
    </div>
  );
}