import  { useEffect, useRef } from "react";
import DotMatrixRenderer from "./utils/DotMatrixRenderer";
import "./dotmatrix-canvas.css";

/**
 * DotMatrixBoard
 * ----------------
 * - Muestra un bloque inicial de N vuelos (0..N-1)
 * - Luego reemplaza en cascada:
 *     fila 0 <- vuelo N
 *     fila 1 <- vuelo N+1
 *     ...
 *     fila N-1 <- vuelo 2N-1
 * - Nunca reutiliza vuelos ya mostrados
 * - NO usa hooks personalizados
 */

export default function DotMatrixBoard({
  flights = [],
  direction = "departures",
  visibleCount = 10,
  holdMs = 3000,
  perRowMs = 2000
}) {
  const canvasesRef = useRef([]);          // <canvas> DOM nodes
  const renderersRef = useRef([]);         // DotMatrixRenderer instances
  const visibleRef = useRef([]);           // vuelos actualmente visibles
  const cursorRef = useRef(0);             // próximo vuelo a insertar
  const timersRef = useRef([]);
  const cycleTimerRef = useRef(null);
  const mountedRef = useRef(true);

  const title = direction?.toLowerCase().startsWith("dep")
    ? "DEPARTURES"
    : "ARRIVALS";




useEffect(() => {
  // destruir renderers viejos
  renderersRef.current.forEach(r => {
    if (r?.destroy) r.destroy();
  });

  renderersRef.current = [];
}, [direction]);








  /* -------------------- INIT RENDERERS -------------------- */
  function initRenderer(i, el) {
    if (!el) return;
    // if (renderersRef.current[i]) return;
    const r = new DotMatrixRenderer(el , direction);
    r.clear();
    renderersRef.current[i] = r;
  }

  
  /* -------------------- DRAW INITIAL -------------------- */
  useEffect(() => {
    mountedRef.current = true;

    // limpiar timers
    stopAll();

    // preparar visibles iniciales
    visibleRef.current = flights.slice(0, visibleCount);
    cursorRef.current = visibleCount;

    // dibujar inmediatamente
    for (let i = 0; i < visibleCount; i++) {
      const r = renderersRef.current[i];
      if (r) r.drawFlight(visibleRef.current[i] || null, true);
    }

    if (flights.length > visibleCount) {
      cycleTimerRef.current = setTimeout(runCascade, holdMs);
    }

    return () => {
      mountedRef.current = false;
      stopAll();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [flights, visibleCount]);

  /* -------------------- CASCADE LOGIC -------------------- */
  function runCascade() {
    if (!mountedRef.current) return;

    for (let row = 0; row < visibleCount; row++) {
      const t = setTimeout(() => {
        if (!mountedRef.current) return;

        if (cursorRef.current >= flights.length) {
          stopAll();
          return;
        }

        const nextFlight = flights[cursorRef.current];
        cursorRef.current += 1;
        visibleRef.current[row] = nextFlight;

        const r = renderersRef.current[row];
        if (r) r.drawFlight(nextFlight, false, { duration: perRowMs });
      }, row * perRowMs);

      timersRef.current.push(t);
    }

    // programar siguiente bloque
    cycleTimerRef.current = setTimeout(
      runCascade,
      visibleCount * perRowMs + holdMs
    );
  }

  /* -------------------- CLEANUP -------------------- */
  function stopAll() {
    timersRef.current.forEach(clearTimeout);
    timersRef.current = [];
    if (cycleTimerRef.current) {
      clearTimeout(cycleTimerRef.current);
      cycleTimerRef.current = null;
    }
  }

  /* -------------------- RENDER -------------------- */
  // return (
  //   <div className="dm-canvas-wrapper" style={{ background: "#000", padding: 12 }}>
  //     <div className="dm-header">{title}</div>

  //     <div className="dm-rows">
  //       {Array.from({ length: visibleCount }).map((_, i) => (
  //         <canvas
  //           key={i}
  //           ref={(el) => {
  //             canvasesRef.current[i] = el;
  //             if (el) initRenderer(i, el);
  //           }}
  //           style={{ display: "block", marginBottom: 8 }}
  //         />
  //       ))}
  //     </div>
  //   </div>
  // );







  // return (
  //   <div className="dm-board-container">
  //     {/* MUEBLE SUPERIOR / CARTEL PRINCIPAL */}
  //     <div className="dm-header-housing">
  //       <h1 className="dm-main-title">{title}</h1>
  //     </div>

  //     {/* MARQUESINA DE COLUMNAS (SKELETON) */ }
  //     <div className="dm-marquee-labels">
  //       <div className="dm-label label-time">TIME</div>
  //       <div className="dm-label label-destination">
  //         {direction?.toLowerCase().startsWith("dep") ? "DESTINATION" : "ORIGIN"}
  //       </div>
  //       <div className="dm-label label-flight">FLIGHT</div>
  //       <div className="dm-label label-remark">REMARK</div>
  //     </div>

  //     {/* CUERPO CENTRAL DEL TABLERO */}
  //     <div className="dm-board-body">
  //       <div className="dm-rows-container">
  //         {Array.from({ length: visibleCount }).map((_, i) => (
  //           <div key={i} className="dm-canvas-row-wrapper">
  //             <canvas
  //               ref={(el) => {
  //                 canvasesRef.current[i] = el;
  //                 if (el) initRenderer(i, el);
  //               }}
  //               className="dm-flight-canvas"
  //             />
  //           </div>
  //         ))}
  //       </div>
  //     </div>
  //   </div>
  // );


/* -------------------- RENDER -------------------- */
  return (
    <div className="dm-board-container">
      {/* MUEBLE SUPERIOR INTERIOR */}
      <div className="dm-header-housing">
        <h1 className="dm-main-title">{title}</h1>
      </div>

      {/* MARQUESINA GUÍA SKELETON */}
      <div className="dm-marquee-labels">
        <div className="dm-label label-time">TIME</div>
        <div className="dm-label label-destination">
          {direction?.toLowerCase().startsWith("dep") ? "DESTINATION" : "ORIGIN"}
        </div>
        <div className="dm-label label-flight">FLIGHT</div>
        <div className="dm-label label-remark">REMARK</div>
      </div>

      {/* CUERPO CENTRAL CON LAS CELDAS CANVAS */}
      <div className="dm-board-body">
        <div className="dm-rows-container">
          {Array.from({ length: visibleCount }).map((_, i) => (
            <div key={i} className="dm-canvas-row-wrapper">
              <canvas
                ref={(el) => {
                  canvasesRef.current[i] = el;
                  if (el) initRenderer(i, el);
                }}
                className="dm-flight-canvas"
              />
            </div>
          ))}
        </div>
      </div>
    </div>
  );

}


