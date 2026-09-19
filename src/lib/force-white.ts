/**
 * Android Force Dark / Samsung Auto Dark inverts solid `background-color`.
 * It usually leaves `background-image` (gradients + image resources) alone.
 * Apply both, plus color-scheme, on every full-bleed surface.
 */
export const FORCE_WHITE_IMAGE =
  "linear-gradient(#ffffff,#ffffff), url(\"data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAIAAACQd1PeAAAADElEQVR4nGP4//8/AAX+Av4N70a4AAAAAElFTkSuQmCC\"), url(\"/bg-white.png\")";

export const forceWhiteStyle = {
  backgroundColor: "#ffffff",
  backgroundImage: FORCE_WHITE_IMAGE,
  color: "#111111",
  colorScheme: "only light",
} as const;
