import { cn } from "@/lib/utils";

type ImageSlotProps = {
  className?: string;
  label?: string;
};

/** Blank product/hero image slot. Do not invent photography. */
export function ImageSlot({ className, label = "Image placeholder" }: ImageSlotProps) {
  return (
    <div
      role="img"
      aria-label={label}
      className={cn("block size-full bg-[#e6e6e6]", className)}
    />
  );
}
