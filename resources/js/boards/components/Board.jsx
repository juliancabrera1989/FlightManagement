import DotMatrixBoard from "./boards/dotMatrix/DotMatrixBoard";
import SolariBoard from "./boards/solari/SolariBoard";
import ModernLcdBoard from "./boards/modern/ModernLcdBoard";

export default function Board({ type, flights = [], airlines = [], direction }) {
  switch (type) {
    case "matrix":
      return (
        <DotMatrixBoard
          flights={flights}
          direction={direction}
        />
      );

    case "solari":
      return (
        <div className="board">
          <SolariBoard 
          flights={flights}
          airlines={airlines}
          direction={direction} />
        </div>
      );


      case "modern":
      return (
        <div className="board">
          <ModernLcdBoard 
          flights={flights}
          direction={direction} />
        </div>
      );
  


    


    default:
      return null;
  }
}
