// import SolarisChar from "../SolarisChar";

// export default function TimeBlock({ time }) {
//   const hours = time?.slice(0, 2) || "  ";
//   const minutes = time?.slice(2, 4) || "  ";

//   return (
//     <div className="time-block">

//       <div className="time-hours">
//         {hours.split("").map((c, i) => (
//           <SolarisChar key={i} char={c} />
//         ))}
//       </div>

//       <div className="time-colon">:</div>

//       <div className="time-minutes">
//         {minutes.split("").map((c, i) => (
//           <SolarisChar key={i} char={c} />
//         ))}
//       </div>

//     </div>
//   );
// }

import React from "react";
import SolariCell from "../SolariCell";

export default function TimeBlock({
  flight,
  direction,
  mode,
  onBuildDone,
  onClearDone
}) {

  const rawTime =
    direction === "departures"
      ? flight.departure_time
      : flight.arrival_time;

  let time = "";

  if (rawTime) {
    const date = new Date(rawTime);
    const h = String(date.getUTCHours()).padStart(2, "0");
    const m = String(date.getUTCMinutes()).padStart(2, "0");
    time = h + m;
  }

  const padded = time.padEnd(4, " ");

// return (
//   <div className="solari-block solari-time">
//     {padded.split("").map((char, i) => (
//       <SolarisCell
//         key={i}
//         mode={mode}
//         targetChar={char}
//         animable={char !== " "}
//         onBuildDone={onBuildDone}
//         onClearDone={onClearDone}
//       />
//     ))}
//   </div>
// );
return (
  /* Le agregamos la clase 'block-time' para que el CSS sepa cuánto pasillo dejar */
  <div className="solari-block block-time">
    {padded.split("").map((char, i) => (
      <React.Fragment key={i}>
        <SolariCell
          mode={mode}
          targetChar={char}
          animable={char !== " "}
          onBuildDone={onBuildDone}
          onClearDone={onClearDone}
          isNumeric={true} /* <-- Activado para la hora */
        />
        {/* Si ya renderizamos las primeras 2 celdas (la hora), clavamos el divisor del mueble */}
        {i === 1 && <div className="solari-time-divider">:</div>}
      </React.Fragment>
    ))}
  </div>
);
}
