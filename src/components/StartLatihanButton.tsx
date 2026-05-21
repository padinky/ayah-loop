import type { ReactNode } from "react";
import { Shuffle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface StartLatihanButtonProps {
  children: ReactNode;
  disabled?: boolean;
  onClick: () => void;
  className?: string;
}

export function StartLatihanButton({
  children,
  disabled,
  onClick,
  className,
}: StartLatihanButtonProps) {
  return (
    <Button
      type="button"
      disabled={disabled}
      onClick={onClick}
      className={cn("w-full h-14 text-lg font-bold", className)}
    >
      <Shuffle className="h-5 w-5 mr-2" />
      {children}
    </Button>
  );
}
