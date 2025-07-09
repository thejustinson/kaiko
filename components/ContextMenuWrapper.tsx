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

  useEffect(() => {
    const handleContextMenu = (e: MouseEvent) => {
      e.preventDefault()
      setCoords({ x: e.clientX, y: e.clientY })
      setVisible(true)
    }

    const handleClick = () => setVisible(false)

    window.addEventListener('contextmenu', handleContextMenu)
    window.addEventListener('click', handleClick)

    return () => {
      window.removeEventListener('contextmenu', handleContextMenu)
      window.removeEventListener('click', handleClick)
    }
  }, [])

  return (
    <div className="relative">
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