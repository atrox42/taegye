/**
 * Android Force Dark inverts solid `background-color` (and often CSS gradients).
 * Real raster files + <img> nodes are much harder for OEM auto-dark to invert.
 */
export const WHITE_BITMAP_SRC = "/bg-white.jpg";

export const FORCE_WHITE_IMAGE =
  `url("${WHITE_BITMAP_SRC}"), url("/bg-white.png"), linear-gradient(#ffffff,#ffffff)`;

export const forceWhiteStyle = {
  backgroundColor: "#ffffff",
  backgroundImage: FORCE_WHITE_IMAGE,
  backgroundSize: "100% 100%",
  backgroundRepeat: "no-repeat",
  color: "#111111",
  WebkitTextFillColor: "#111111",
  colorScheme: "only light",
} as const;

export const forceInkStyle = {
  color: "#111111",
  WebkitTextFillColor: "#111111",
} as const;

export const forceMutedStyle = {
  color: "#999999",
  WebkitTextFillColor: "#999999",
} as const;
