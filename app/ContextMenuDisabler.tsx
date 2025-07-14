"use client";
import { useEffect } from "react";

export default function ContextMenuDisabler({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    const handler = (e: MouseEvent) => e.preventDefault();
    window.addEventListener("contextmenu", handler);
    return () => window.removeEventListener("contextmenu", handler);
  }, []);
  return <>{children}</>;
} 