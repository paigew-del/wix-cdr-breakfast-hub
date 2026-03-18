import React, { useState, useRef, useCallback } from 'react';

export default function DraggablePhoto({ photoUrl, position, onPositionChange, initials }) {
  const [dragging, setDragging] = useState(false);
  const dragStart = useRef(null);

  const handleMouseDown = useCallback((e) => {
    if (!photoUrl) return;
    e.preventDefault();
    setDragging(true);
    dragStart.current = {
      mouseX: e.clientX,
      mouseY: e.clientY,
      posX: position.x,
      posY: position.y,
    };
  }, [photoUrl, position]);

  const handleMouseMove = useCallback((e) => {
    if (!dragging || !dragStart.current) return;
    const dx = e.clientX - dragStart.current.mouseX;
    const dy = e.clientY - dragStart.current.mouseY;
    onPositionChange({
      x: dragStart.current.posX + dx,
      y: dragStart.current.posY + dy,
    });
  }, [dragging, onPositionChange]);

  const handleMouseUp = useCallback(() => {
    setDragging(false);
    dragStart.current = null;
  }, []);

  const handleTouchStart = useCallback((e) => {
    if (!photoUrl) return;
    const touch = e.touches[0];
    setDragging(true);
    dragStart.current = {
      mouseX: touch.clientX,
      mouseY: touch.clientY,
      posX: position.x,
      posY: position.y,
    };
  }, [photoUrl, position]);

  const handleTouchMove = useCallback((e) => {
    if (!dragging || !dragStart.current) return;
    e.preventDefault();
    const touch = e.touches[0];
    const dx = touch.clientX - dragStart.current.mouseX;
    const dy = touch.clientY - dragStart.current.mouseY;
    onPositionChange({
      x: dragStart.current.posX + dx,
      y: dragStart.current.posY + dy,
    });
  }, [dragging, onPositionChange]);

  const handleTouchEnd = useCallback(() => {
    setDragging(false);
    dragStart.current = null;
  }, []);

  return (
    <div
      className="h-24 w-24 rounded-full overflow-hidden border-2 border-blue-200 bg-blue-100 flex items-center justify-center select-none"
      style={{ cursor: photoUrl ? (dragging ? 'grabbing' : 'grab') : 'default' }}
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseUp}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
    >
      {photoUrl ? (
        <img
          src={photoUrl}
          alt="Profile"
          draggable={false}
          style={{
            width: '100%',
            height: '100%',
            objectFit: 'cover',
            objectPosition: `calc(50% + ${position.x}px) calc(50% + ${position.y}px)`,
            pointerEvents: 'none',
          }}
        />
      ) : (
        <span className="text-2xl font-bold text-blue-700">{initials}</span>
      )}
    </div>
  );
}