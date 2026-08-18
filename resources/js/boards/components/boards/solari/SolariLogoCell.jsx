{/*import React, { useEffect, useRef, useState } from "react";
// Importamos el array que definimos en el Paso 1
import { AIRLINE_CHARSET } from "./blocks/FlightBlock"; 

const FLIP_DELAY = 400; // ms entre top y bottom (visual)
const ROTATION_SPEED = 1800; // ms por cada flap (un poco más lento para logos)

export default function SolariLogoCell({
  mode,
  targetAirlineId, // Ahora el objetivo es una ID numérico, ej: 12
  onBuildDone,
  onClearDone
}) {
  const [currentAirlineIndex, setCurrentAirlineIndex] = useState(0); // Empezamos en index 0 (Empty)
  const [isBlack, setIsBlack] = useState(true);
  const [flipTop, setFlipTop] = useState(false);
  const [flipBottom, setFlipBottom] = useState(false);
  const runningRef = useRef(false);

  // === RESET visual al entrar en BLACK ===
  useEffect(() => {
    if (mode === "BLACK") {
      runningRef.current = false;
      setIsBlack(true);
      setCurrentAirlineIndex(0); // Volvemos a "Empty"
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

      // Iniciamos el giro visual
      setFlipTop(true);
      setFlipBottom(false);

      // Pequeño delay para el efecto visual de "caída"
      setTimeout(() => {
        setFlipTop(false);
        setFlipBottom(true);
      }, FLIP_DELAY);

      // Si llegamos al destino, reportamos listo
      if (current === targetIndex) {
        runningRef.current = false;
        if (current === 0) setIsBlack(true); // Si volvimos a 0, apagamos visualmente
        callback && callback();
        return;
      }

      // Avanzamos o retrocedemos en el array de logos
      current = current < targetIndex ? current + 1 : current - 1;
      setCurrentAirlineIndex(current); // Actualizamos el logo que se muestra

      // Siguiente paso de la rotación
      setTimeout(step, ROTATION_SPEED);
    };

    step();
  };

  // === Lógica de BUILD (De Empty a Target) ===
  useEffect(() => {
    if (mode !== "BUILD") return;
    // Buscamos el index en nuestro array para el targetId
    const targetIndex = AIRLINE_CHARSET.findIndex(a => a.id === targetAirlineId);
    if (targetIndex === -1) {
       onBuildDone && onBuildDone(); // Si no existe, listo
       return;
    }
    // Corremos la rotación hacia adelante
    runRotation(targetIndex, onBuildDone);
  }, [mode, targetAirlineId]);

  // === Lógica de CLEAR (De Target a Index 0 - Empty) ===
  useEffect(() => {
    if (mode !== "CLEAR") return;
    // Corremos la rotación de vuelta hacia el index 0
    runRotation(0, onClearDone);
  }, [mode]);

  // Obtenemos los datos del logo que se está mostrando actualmente en el giro
   const currentLogoData = AIRLINE_CHARSET[currentAirlineIndex];
//   const backendUrl = "http://127.0.0.1:8000/public";

// //   return (
// //     <div className={`solari-cell-logo solari-logo-flap ${isBlack ? "black" : ""} ${flipTop ? "flip-top" : ""} ${flipBottom ? "flip-bottom" : ""}`}>
      
// //       /~ FLAP SUPERIOR: Muestra el logo actual mientras cae ~/
// //       <div className="solari-flap top">
// //         {currentLogoData.logo_path && (
// //           <img src={`${backendUrl}${currentLogoData.logo_path}`} alt={currentLogoData.name} />
// //         )}
// //       </div>

// //       /~ FLAP INFERIOR: Muestra el logo actual sobre el que cae el superior ~/
// //       <div className="solari-flap bottom">
// //         {currentLogoData.logo_path && (
// //           <img src={`${backendUrl}${currentLogoData.logo_path}`} alt={currentLogoData.name} />
// //         )}
// //       </div>
// //     </div>
// //   );
// return (
//   <div className={`solari-cell-logo solari-logo-flap ${isBlack ? "black" : ""}`}>
//     {currentLogoData.logo_path && (
//       <img 
//         src={`${backendUrl}${currentLogoData.logo_path}`} 
//         alt={currentLogoData.name} 
//         className="solari-logo-clean"
//       />
//     )}
//   </div>
// );
const baseUrl = window.APP_URL || ""; 
  
  const logoSrc = currentLogoData.logo_path 
    ? `${baseUrl}${currentLogoData.logo_path}` 
    : null;

return (
    <div className={`solari-cell-logo solari-logo-flap ${isBlack ? "black" : ""} ${flipTop ? "flip-top" : ""} ${flipBottom ? "flip-bottom" : ""}`}>
      
      /~ Mitad Superior: Siempre se muestra si hay logo ~/
      <div className="solari-flap top">
        {logoSrc && (
          <img 
            src={logoSrc} 
            alt={currentLogoData.name} 
            className="solari-logo-split"
          />
        )}
      </div>

      /~ Mitad Inferior: ¡SOLO se muestra cuando el flip entra en la fase bottom! ~/
      <div className="solari-flap bottom">
        {logoSrc && flipBottom && (
          <img 
            src={logoSrc} 
            alt={currentLogoData.name} 
            className="solari-logo-split"
          />
        )}
      </div>

    </div>
  );
}*/}


import React, { useEffect, useRef, useState } from "react";
// import { AIRLINE_CHARSET } from "./blocks/FlightBlock"; 

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
  
  // const topLogoData = AIRLINE_CHARSET[currentAirlineIndex];
  // const topLogoSrc = topLogoData?.logo_path ? `${baseUrl}${topLogoData.logo_path}` : null;

  // const bottomLogoData = AIRLINE_CHARSET[bottomAirlineIndexRef.current];
  // const bottomLogoSrc = bottomLogoData?.logo_path ? `${baseUrl}${bottomLogoData.logo_path}` : null;
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
