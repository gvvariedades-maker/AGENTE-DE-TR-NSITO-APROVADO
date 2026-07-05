"use client";

import { BookOpen } from "lucide-react";
import { Button } from "@/components/ui/button";

interface EstudoReversoTriggerProps {
  acertou: boolean;
  onOpen: () => void;
}

export function EstudoReversoTrigger({
  acertou,
  onOpen,
}: EstudoReversoTriggerProps) {
  return (
    <div className="border-t border-border px-4 py-3">
      <Button
        type="button"
        variant={acertou ? "outline" : "default"}
        className="w-full gap-2"
        onClick={onOpen}
      >
        <BookOpen className="size-4" aria-hidden />
        Estudo reverso visual
      </Button>
      <p className="mt-2 text-center text-xs text-muted-foreground">
        Micro-aula segmentada para fixar o microtópico
      </p>
    </div>
  );
}
