// File: src/lib/DotMatrixRenderer.js
// A small class that manages one canvas element and draws a full-row bitmap (7x9 glyphs per letter)
// It exposes drawFlight(flight, instant=false, opts={}) where it will either paint instantly or animate a vertical sweep

import drawCharMatrix from "./drawCharMatrix"; // function that returns bitmap and drawing helpers

export default class DotMatrixRenderer {
  constructor(canvasEl, direction = "departures") {
    this.direction = direction;
    this.canvas = canvasEl;
    this.dpr = window.devicePixelRatio || 1;
    this.DOT_PX = 3;
    this.DOT_GAP = 1;
    this.DOT_ROWS = 9;
    this._lastBitmap = null;
    this._colorOn = '#E6E6E6';
    this._colorOff = '#2b2b2b';
    this._colorDest = '#E6C341';
    this._init();
  }

  _init() {
    this.ctx = this.canvas.getContext('2d');
    // size will be set by draw call; for now set minimal
    this.totalCols = drawCharMatrix.computeTotalCols();
    this.pixelWidth = this.DOT_PX + this.DOT_GAP;
    this.totalWidthPx = this.totalCols * this.pixelWidth - this.DOT_GAP;
    this.totalHeightPx = this.DOT_ROWS * this.pixelWidth - this.DOT_GAP;
    this.canvas.style.width = `${this.totalWidthPx}px`;
    this.canvas.style.height = `${this.totalHeightPx}px`;
    this.canvas.width = Math.max(1, Math.floor(this.totalWidthPx * this.dpr));
    this.canvas.height = Math.max(1, Math.floor(this.totalHeightPx * this.dpr));
    this.ctx.setTransform(this.dpr, 0, 0, this.dpr, 0, 0);
  }

  clear() {
    this.ctx.fillStyle = '#000';
    this.ctx.fillRect(0, 0, this.totalWidthPx, this.totalHeightPx);
    this._lastBitmap = Array.from({ length: this.DOT_ROWS }, () => new Array(this.totalCols).fill(false));
  }

  destroy() {
    // nothing heavy
    this._lastBitmap = null;
  }

  drawFlight(flight, instant = true, opts = {}) {

    // const bmp = drawCharMatrix.buildRowBitmap(flight);
    const bmp = drawCharMatrix.buildRowBitmap(flight, this.direction);

    // decide colors per column: drawCharMatrix returns a second array with column categories (e.g. destination region)
    if (instant) {
      this._paintBitmap(bmp.bitmap, bmp.colMask);
      this._lastBitmap = bmp.bitmap;
      return;
    }
    // animate vertical sweep old->new over opts.duration milliseconds
    const duration = opts.duration || 800;
    this._animateVerticalSwap(this._lastBitmap || bmp.bitmap, bmp.bitmap, duration, bmp.colMask);
    this._lastBitmap = bmp.bitmap;
  }

  _paintBitmap(bitmap, colMask) {
    const ctx = this.ctx;
    ctx.fillStyle = '#000';
    ctx.fillRect(0, 0, this.totalWidthPx, this.totalHeightPx);
    for (let r = 0; r < this.DOT_ROWS; r++) {
      for (let c = 0; c < this.totalCols; c++) {
        const on = !!bitmap[r][c];
        const x = c * this.pixelWidth;
        const y = r * this.pixelWidth;
        ctx.beginPath();
        if (on) {
          // destination columns flagged in colMask as 'dest' will be drawn yellow
          const isDest = Array.isArray(colMask) && colMask[c] === 'dest';
          ctx.fillStyle = isDest ? this._colorDest : this._colorOn;
        } else {
          ctx.fillStyle = this._colorOff;
        }
        ctx.arc(x + this.DOT_PX / 2, y + this.DOT_PX / 2, Math.max(0.5, this.DOT_PX / 2 - 0.4), 0, Math.PI * 2);
        ctx.fill();
      }
    }
  }

  _animateVerticalSwap(oldBmp, newBmp, duration, colMask) {
    const ctx = this.ctx;
    const totalPx = this.totalHeightPx;
    const start = performance.now();
    const self = this;
    function frame(now) {
      const t = Math.min(1, (now - start) / duration);
      const oldShift = Math.min(totalPx, t * totalPx);
      const newShift = oldShift - totalPx;
      // clear
      ctx.fillStyle = '#000';
      ctx.fillRect(0, 0, self.totalWidthPx, totalPx);

      // draw old shifted down
      for (let r = 0; r < self.DOT_ROWS; r++) {
        for (let c = 0; c < self.totalCols; c++) {
          if (!oldBmp[r][c]) continue;
          const x = c * self.pixelWidth;
          const y = r * self.pixelWidth + oldShift;
          if (y >= totalPx) continue;
          ctx.beginPath(); ctx.fillStyle = self._colorOn; ctx.arc(x + self.DOT_PX/2, y + self.DOT_PX/2, Math.max(0.5, self.DOT_PX/2 - 0.4), 0, Math.PI*2); ctx.fill();
        }
      }

      // draw new shifted down by newShift
      for (let r = 0; r < self.DOT_ROWS; r++) {
        for (let c = 0; c < self.totalCols; c++) {
          if (!newBmp[r][c]) continue;
          const x = c * self.pixelWidth;
          const y = r * self.pixelWidth + newShift;
          if (y + self.pixelWidth <= 0) continue;
          if (y >= totalPx) continue;
          ctx.beginPath();
          const isDest = Array.isArray(colMask) && colMask[c] === 'dest';
          ctx.fillStyle = isDest ? self._colorDest : self._colorOn;
          ctx.arc(x + self.DOT_PX/2, y + self.DOT_PX/2, Math.max(0.5, self.DOT_PX/2 - 0.4), 0, Math.PI*2);
          ctx.fill();
        }
      }

      if (t < 1) requestAnimationFrame(frame);
      else self._paintBitmap(newBmp, colMask);
    }
    requestAnimationFrame(frame);
  }
}