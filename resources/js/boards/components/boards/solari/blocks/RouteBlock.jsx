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
