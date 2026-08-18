import font7x9 from "../fonts/font7x9";


const DOT_ROWS = 9;
const DOT_COLS_PER_LETTER = 7;
const LETTER_GAP_COLS = 1;
const FIELD_GAP_COLS = 10;
// const FIELDS = [ { key: 'time', cells:5 }, { key:'destination', cells:12 }, { key:'flight', cells:6 }, { key:'gate', cells:3 }, { key:'status', cells:9 } ];
const FIELDS = [ { key: 'time', cells:5 }, { key:'destination', cells:12 }, { key:'flight', cells:6 }, { key:'status', cells:9 } ];

function glyphFor(ch) {
  if (!ch) return font7x9[' '] || font7x9[' '];
  const k = String(ch).toUpperCase();
  return font7x9[k] || font7x9[' '];
}

export function computeTotalCols() {
  let cols = 0;
  FIELDS.forEach((f, fi) => {
    cols += f.cells * DOT_COLS_PER_LETTER + Math.max(0, f.cells - 1) * LETTER_GAP_COLS;
    if (fi < FIELDS.length - 1) cols += FIELD_GAP_COLS;
  });
  return cols;
}

function padOrTruncate(s = '', len) {
  const t = (s || '').toString().toUpperCase();
  return (t + ' '.repeat(len)).slice(0, len);
}

function rasterGlyph(ch) {
  const pat = glyphFor(ch);
  const out = [];
  for (let r = 0; r < DOT_ROWS; r++) {
    const row = pat[r] || '0000000';
    const arr = [];
    for (let c = 0; c < DOT_COLS_PER_LETTER; c++) arr.push(row[c] === '1');
    out.push(arr);
  }
  return out;
}

export default {
  computeTotalCols,
  buildRowBitmap(flight = null, direction = "departures") {
    // build field strings
    const pieces = FIELDS.map(f => {
      let text = ' '.repeat(f.cells);
      if (flight) {
        switch (f.key) {

          case 'time':
          text = formatTimeCell(flight, f.cells, direction);
          break;


          case 'destination':
            if (direction === "arrivals") {
              text = (flight.departure_airport?.city || flight.origin || '').toString();
            } else {
              text = (flight.arrival_airport?.city || flight.destination || '').toString();
            }
            break;

          case 'flight':
            text = (flight.flight_number || '').toString(); break;
          case 'gate':
            text = (flight.gate || '').toString(); break;
          case 'status':
            text = (flight.status || '').toString(); break;
        }
      }
      return padOrTruncate(text, f.cells);
    });

    const totalCols = computeTotalCols();
    const bmp = Array.from({ length: DOT_ROWS }, () => new Array(totalCols).fill(false));
    const colMask = new Array(totalCols).fill(null); // mark 'dest' columns
    let col = 0;
    pieces.forEach((piece, pi) => {
      const cells = FIELDS[pi].cells;
      for (let ci = 0; ci < cells; ci++) {
        const ch = piece[ci] || ' ';
        const glyph = rasterGlyph(ch);
        for (let r = 0; r < DOT_ROWS; r++) {
          for (let c = 0; c < DOT_COLS_PER_LETTER; c++) {
            bmp[r][col + c] = glyph[r][c];
            if (FIELDS[pi].key === 'destination') colMask[col + c] = 'dest';
          }
        }
        col += DOT_COLS_PER_LETTER;
        if (ci < cells - 1) col += LETTER_GAP_COLS;
      }
      if (pi < pieces.length - 1) {
        // field gap area remains null in colMask
        col += FIELD_GAP_COLS;
      }
    });

    return { bitmap: bmp, colMask };
  }
};


function formatTimeCell(flight, len, direction) {
  if (!flight) return ' '.repeat(len);

  const raw =
    direction === "arrivals"
      ? (flight.arrival_time || flight.time || "")
      : (flight.departure_time || flight.time || "");

  const m = raw.match(/(\d{2}:\d{2})/);
  const hhmm = (m && m[1]) || raw.slice(11, 16) || raw;

  return padOrTruncate(hhmm, len);
}
