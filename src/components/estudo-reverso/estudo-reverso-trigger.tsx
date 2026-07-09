"use client";

import { BookOpen } from "lucide-react";
import { Button } from "@/components/ui/button";

interface EstudoReversoTriggerProps {
  onOpen: () => void;
  className?: string;
  variant?: "default" | "outline";
  size?: "default" | "sm" | "lg";
  label?: string;
}

export function EstudoReversoTrigger({
  onOpen,
  className,
  variant = "outline",
  size = "default",
  label = "Estudo reverso",
}: EstudoReversoTriggerProps) {
  return (
    <Button
      type="button"
      variant={variant}
      size={size}
      className={className}
      onClick={onOpen}
    >
      <BookOpen className="size-4" aria-hidden />
      {label}
    </Button>
  );
}
