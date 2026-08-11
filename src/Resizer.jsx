import React from 'react';

export default function Resizer({ direction = 'horizontal', onResize }) {
  const [active, setActive] = React.useState(false);
  const [hover, setHover] = React.useState(false);

  function onMouseDown(e) {
    e.preventDefault();
    setActive(true);
    let last = direction === 'horizontal' ? e.clientX : e.clientY;
    const prevCursor = document.body.style.cursor;
    const prevSelect = document.body.style.userSelect;
    document.body.style.cursor = direction === 'horizontal' ? 'col-resize' : 'row-resize';
    document.body.style.userSelect = 'none';
    function onMove(ev) {
      const pos = direction === 'horizontal' ? ev.clientX : ev.clientY;
      const delta = pos - last;
      last = pos;
      if (delta !== 0) onResize(delta);
    }
    function onUp() {
      setActive(false);
      document.body.style.cursor = prevCursor;
      document.body.style.userSelect = prevSelect;
      window.removeEventListener('mousemove', onMove);
      window.removeEventListener('mouseup', onUp);
    }
    window.addEventListener('mousemove', onMove);
    window.addEventListener('mouseup', onUp);
  }

  const isH = direction === 'horizontal';
  const barStyle = isH
    ? { position: 'absolute', left: '50%', top: 0, bottom: 0, width: 2, transform: 'translateX(-50%)' }
    : { position: 'absolute', top: '50%', left: 0, right: 0, height: 2, transform: 'translateY(-50%)' };

  const color = active ? 'var(--accent-primary)' : hover ? 'var(--border-strong)' : 'transparent';

  return (
    <div
      onMouseDown={onMouseDown}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      style={{
        position: 'relative',
        flexShrink: 0,
        width: isH ? 6 : '100%',
        height: isH ? '100%' : 6,
        cursor: isH ? 'col-resize' : 'row-resize',
        zIndex: 10,
      }}
    >
      <div style={{ ...barStyle, background: color }} />
    </div>
  );
}
