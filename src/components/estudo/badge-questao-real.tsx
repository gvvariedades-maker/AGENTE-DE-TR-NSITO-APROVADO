import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { isQuestaoRealIdecan } from "@/lib/questoes-reais";

interface BadgeQuestaoRealProps {
  tags?: string[] | null;
  className?: string;
  variant?: "default" | "compact";
}

export function BadgeQuestaoReal({
  tags,
  className,
  variant = "default",
}: BadgeQuestaoRealProps) {
  if (!isQuestaoRealIdecan(tags)) return null;

  return (
    <Badge
      variant="outline"
      className={cn(
        "border-amber-500/40 bg-amber-500/10 text-amber-900 dark:text-amber-100",
        variant === "compact" && "text-[10px] px-1.5 py-0",
        className,
      )}
    >
      Real IDECAN
    </Badge>
  );
}
