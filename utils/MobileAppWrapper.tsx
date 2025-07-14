"use client";
import { useEffect } from "react";

interface MobileAppWrapperProps {
  children: React.ReactNode;
  allowScrolling?: boolean; // Optional: allow scrolling in specific areas
}

export default function MobileAppWrapper({ 
  children, 
  allowScrolling = false 
}: MobileAppWrapperProps) {
  useEffect(() => {
    // Disable context menu (right-click/long press)
    const handleContextMenu = (e: MouseEvent) => {
      e.preventDefault();
    };

    // Disable pinch-to-zoom (two finger zoom)
    const handleTouchStart = (e: TouchEvent) => {
      if (e.touches.length > 1) {
        e.preventDefault();
      }
    };

    // Disable pull-to-refresh and general touch scrolling
    const handleTouchMove = (e: TouchEvent) => {
      if (!allowScrolling) {
        e.preventDefault();
      }
    };

    // Disable double-tap zoom
    let lastTouchEnd = 0;
    const handleTouchEnd = (e: TouchEvent) => {
      const now = Date.now();
      if (now - lastTouchEnd <= 300) {
        e.preventDefault();
      }
      lastTouchEnd = now;
    };

    // Disable iOS Safari gesture events
    const handleGestureStart = (e: Event) => {
      e.preventDefault();
    };

    const handleGestureChange = (e: Event) => {
      e.preventDefault();
    };

    const handleGestureEnd = (e: Event) => {
      e.preventDefault();
    };

    // Disable mouse wheel zoom (Ctrl + scroll)
    const handleWheel = (e: WheelEvent) => {
      if (e.ctrlKey) {
        e.preventDefault();
      }
    };

    // Disable keyboard zoom shortcuts
    const handleKeyDown = (e: KeyboardEvent) => {
      // Disable Ctrl/Cmd + Plus/Minus/0 (zoom shortcuts)
      if (
        (e.ctrlKey || e.metaKey) &&
        (e.key === '+' || e.key === '-' || e.key === '0' || e.key === '=')
      ) {
        e.preventDefault();
      }
      
      // Disable F11 (fullscreen) if desired
      if (e.key === 'F11') {
        e.preventDefault();
      }
    };

    // Add event listeners
    document.addEventListener("contextmenu", handleContextMenu);
    document.addEventListener("touchstart", handleTouchStart, { passive: false });
    document.addEventListener("touchmove", handleTouchMove, { passive: false });
    document.addEventListener("touchend", handleTouchEnd, { passive: false });
    document.addEventListener("gesturestart", handleGestureStart);
    document.addEventListener("gesturechange", handleGestureChange);
    document.addEventListener("gestureend", handleGestureEnd);
    document.addEventListener("wheel", handleWheel, { passive: false });
    document.addEventListener("keydown", handleKeyDown);

    // Apply CSS to prevent various mobile behaviors
    const styleElement = document.createElement("style");
    styleElement.textContent = `
      * {
        -webkit-touch-callout: none;
        -webkit-user-select: none;
        -khtml-user-select: none;
        -moz-user-select: none;
        -ms-user-select: none;
        user-select: none;
      }
      
      body {
        touch-action: ${allowScrolling ? 'pan-y' : 'none'};
        overscroll-behavior: none;
        -webkit-overflow-scrolling: touch;
        overflow: ${allowScrolling ? 'auto' : 'hidden'};
        position: ${allowScrolling ? 'relative' : 'fixed'};
        width: 100%;
        height: 100%;
        margin: 0;
        padding: 0;
      }
      
      html {
        touch-action: ${allowScrolling ? 'pan-y' : 'none'};
        overscroll-behavior: none;
        overflow: ${allowScrolling ? 'auto' : 'hidden'};
      }
      
      /* Disable text selection highlighting */
      *::selection {
        background: transparent;
      }
      
      *::-moz-selection {
        background: transparent;
      }
      
      /* Disable tap highlight on mobile */
      * {
        -webkit-tap-highlight-color: transparent;
        -webkit-focus-ring-color: transparent;
        outline: none;
      }
      
      /* Disable drag and drop */
      * {
        -webkit-user-drag: none;
        -khtml-user-drag: none;
        -moz-user-drag: none;
        -o-user-drag: none;
        user-drag: none;
      }
      
      /* Disable image dragging */
      img {
        pointer-events: none;
        -webkit-user-drag: none;
        -khtml-user-drag: none;
        -moz-user-drag: none;
        -o-user-drag: none;
        user-drag: none;
      }
      
      /* Allow interaction with buttons and inputs */
      button, input, textarea, select, a {
        -webkit-user-select: auto;
        -moz-user-select: auto;
        -ms-user-select: auto;
        user-select: auto;
        touch-action: manipulation;
        pointer-events: auto;
      }
      
      /* Specific styles for scrollable areas if needed */
      .scrollable {
        touch-action: pan-y;
        overflow-y: auto;
        -webkit-overflow-scrolling: touch;
      }
    `;
    
    document.head.appendChild(styleElement);

    // Cleanup function
    return () => {
      document.removeEventListener("contextmenu", handleContextMenu);
      document.removeEventListener("touchstart", handleTouchStart);
      document.removeEventListener("touchmove", handleTouchMove);
      document.removeEventListener("touchend", handleTouchEnd);
      document.removeEventListener("gesturestart", handleGestureStart);
      document.removeEventListener("gesturechange", handleGestureChange);
      document.removeEventListener("gestureend", handleGestureEnd);
      document.removeEventListener("wheel", handleWheel);
      document.removeEventListener("keydown", handleKeyDown);
      
      // Remove injected styles
      if (styleElement.parentNode) {
        styleElement.parentNode.removeChild(styleElement);
      }
    };
  }, [allowScrolling]);

  return <>{children}</>;
}