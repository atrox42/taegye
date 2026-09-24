/**
 * Android Force Dark inverts solid `background-color` (and often CSS gradients).
 * Real raster files + <img> nodes are much harder for OEM auto-dark to invert.
 */
export const WHITE_BITMAP_SRC = "/bg-white.jpg";
export const INK_111_SRC = "/ink-111.jpg";

export const FORCE_WHITE_IMAGE =
  `url("${WHITE_BITMAP_SRC}"), url("/bg-white.png"), linear-gradient(#ffffff,#ffffff)`;

export const FORCE_INK_IMAGE = `url("${INK_111_SRC}")`;

export const forceWhiteStyle = {
  backgroundColor: "#ffffff",
  backgroundImage: FORCE_WHITE_IMAGE,
  backgroundSize: "100% 100%",
  backgroundRepeat: "no-repeat",
  color: "#111111",
  colorScheme: "light dark",
} as const;

/** CSS #111 is inverted by OEM Force Dark; a dark JPEG fill is not. */
export const forceInkStyle = {
  color: "#111111",
  WebkitTextFillColor: "transparent",
  backgroundImage: FORCE_INK_IMAGE,
  backgroundRepeat: "repeat",
  backgroundSize: "8px 8px",
  WebkitBackgroundClip: "text",
  backgroundClip: "text",
} as const;

export const forceMutedStyle = {
  color: "#999999",
  WebkitTextFillColor: "#999999",
  backgroundImage: "none",
  WebkitBackgroundClip: "border-box",
  backgroundClip: "border-box",
} as const;
