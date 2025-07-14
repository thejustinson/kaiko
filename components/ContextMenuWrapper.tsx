'use client'

import { useEffect, useState, useRef } from 'react'

export default function ContextMenuWrapper({
  children,
}: {
  children: React.ReactNode
}) {
  const [visible, setVisible] = useState(false)
  const [coords, setCoords] = useState({ x: 0, y: 0 })
  const menuRef = useRef<HTMLDivElement>(null)

  const handleContextMenu = (e: React.MouseEvent) => {
    e.preventDefault()
    // Clamp menu position to stay within viewport
    const menuWidth = 160; // px, adjust if needed
    const menuHeight = 80; // px, adjust if needed
    const x = Math.min(e.clientX, window.innerWidth - menuWidth)
    const y = Math.min(e.clientY, window.innerHeight - menuHeight)
    setCoords({ x, y })
    setVisible(true)
  }

  const handleClick = () => setVisible(false)

  useEffect(() => {
    if (visible) {
      window.addEventListener('click', handleClick)
      return () => window.removeEventListener('click', handleClick)
    }
  }, [visible])

  return (
    <div className="relative" onContextMenu={handleContextMenu}>
      {children}
      {visible && (
        <div
          ref={menuRef}
          className="fixed z-50 bg-white text-black rounded-md shadow-md p-2 w-40"
          style={{ top: coords.y, left: coords.x }}
        >
          <div className="cursor-pointer hover:bg-gray-200 px-2 py-1">Option A</div>
          <div className="cursor-pointer hover:bg-gray-200 px-2 py-1">Option B</div>
        </div>
      )}
    </div>
  )
}