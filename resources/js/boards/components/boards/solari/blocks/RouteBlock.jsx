// import SolarisChar from "../SolarisChar";

// export default function TimeBlock({ time }) {
//   const hours = time?.slice(0, 2) || "  ";
//   const minutes = time?.slice(2, 4) || "  ";

//   return (
//     <div className="time-block">

//       <div className="time-hours">
//         {hours.split("").map((char, i) => (
//           <SolarisChar key={i} char={char} />
//         ))}
//       </div>

//       <div className="time-separator">:</div>

//       <div className="time-minutes">
//         {minutes.split("").map((char, i) => (
//           <SolarisChar key={i} char={char} />
//         ))}
//       </div>

//     </div>
//   );
// }


import SolariCell from "../SolariCell";

export default function RouteBlock({
  flight,
  direction,
  mode,
  onBuildDone,
  onClearDone
}) {

  const city =
    direction === "departures"
      ? flight.arrival_airport?.city
      : flight.departure_airport?.city;

  const value = (city || "").toUpperCase().padEnd(12, " ");

  return (
  <div className="solari-block solari-destination">
    {value.split("").map((char, i) => (
      <SolariCell
        key={i}
        mode={mode}
        targetChar={char}
        animable={char !== " "}
        onBuildDone={onBuildDone}
        onClearDone={onClearDone}
      />
    ))}
  </div>
);
}
