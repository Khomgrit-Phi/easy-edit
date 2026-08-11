import React from 'react';

export default function Resizer({ direction = 'horizontal', onResize }) {
  const [active, setActive] = React.useState(false);
  const [hover, setHover] = React.useState(false);

  function startDrag(getPos) {
    setActive(true);
    let last = getPos();
    function move(pos) {
      const delta = pos - last;
      last = pos;
      if (delta !== 0) onResize(delta);
    }
    return { move, last: () => last };
  }

  function onMouseDown(e) {
    e.preventDefault();
    const prevCursor = document.body.style.cursor;
    const prevSelect = document.body.style.userSelect;
    document.body.style.cursor = direction === 'horizontal' ? 'col-resize' : 'row-resize';
    document.body.style.userSelect = 'none';
    const drag = startDrag(() => (direction === 'horizontal' ? e.clientX : e.clientY));
    function onMove(ev) {
      drag.move(direction === 'horizontal' ? ev.clientX : ev.clientY);
    }
    function onUp() {
      setActive(false);
      document.body.style.cursor = prevCursor;
      document.body.style.userSelect = prevSelect;
      window.removeEventListener('mousemove', onMove);
      window.removeEventListener('mouseup', onUp);
    }
    setActive(true);
    window.addEventListener('mousemove', onMove);
    window.addEventListener('mouseup', onUp);
  }

  function onTouchStart(e) {
    const t = e.touches[0];
    if (!t) return;
    const drag = startDrag(() => (direction === 'horizontal' ? t.clientX : t.clientY));
    function onMove(ev) {
      const touch = ev.touches[0];
      if (!touch) return;
      ev.preventDefault();
      drag.move(direction === 'horizontal' ? touch.clientX : touch.clientY);
    }
    function onEnd() {
      setActive(false);
      window.removeEventListener('touchmove', onMove);
      window.removeEventListener('touchend', onEnd);
      window.removeEventListener('touchcancel', onEnd);
    }
    setActive(true);
    window.addEventListener('touchmove', onMove, { passive: false });
    window.addEventListener('touchend', onEnd);
    window.addEventListener('touchcancel', onEnd);
  }

  const isH = direction === 'horizontal';
  const barStyle = isH
    ? { position: 'absolute', left: '50%', top: 0, bottom: 0, width: 2, transform: 'translateX(-50%)' }
    : { position: 'absolute', top: '50%', left: 0, right: 0, height: 2, transform: 'translateY(-50%)' };

  const color = active ? 'var(--accent-primary)' : hover ? 'var(--border-strong)' : 'transparent';

  return (
    <div
      onMouseDown={onMouseDown}
      onTouchStart={onTouchStart}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      style={{
        position: 'relative',
        flexShrink: 0,
        width: isH ? 6 : '100%',
        height: isH ? '100%' : 6,
        cursor: isH ? 'col-resize' : 'row-resize',
        touchAction: 'none',
        zIndex: 10,
      }}
    >
      <div style={{ ...barStyle, background: color }} />
    </div>
  );
}
