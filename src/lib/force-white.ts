/**
 * Android Force Dark inverts solid `background-color` (and often CSS gradients).
 * Real raster files + <img> nodes are much harder for OEM auto-dark to invert.
 */
export const WHITE_BITMAP_SRC = "/bg-white.jpg";
export const PANEL_BITMAP_SRC = "/bg-fafafa.jpg";
export const INK_111_SRC = "/ink-111.jpg";
/** TAEGYE product-base mid purple — JPEG/PNG fills skip OEM Force Dark invert. */
export const PURPLE_574667_SRC = "/purple-574667.jpg";
export const PURPLE_574667_PNG_SRC = "/purple-574667.png";

export const FORCE_WHITE_IMAGE =
  `url("${WHITE_BITMAP_SRC}"), url("/bg-white.png"), linear-gradient(#ffffff,#ffffff)`;

export const FORCE_INK_IMAGE = `url("${INK_111_SRC}")`;
export const FORCE_PURPLE_IMAGE = `url("${PURPLE_574667_SRC}")`;
export const FORCE_WHITE_CLIP_IMAGE = `url("${WHITE_BITMAP_SRC}")`;

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

export const forcePurpleStyle = {
  backgroundColor: "#574667",
  backgroundImage: FORCE_PURPLE_IMAGE,
  backgroundSize: "100% 100%",
  backgroundRepeat: "no-repeat",
  color: "#ffffff",
  colorScheme: "light dark",
} as const;

/** CSS #fff inverts under Force Dark; a white JPEG clip-text fill does not. */
export const forceWhiteClipStyle = {
  color: "#ffffff",
  WebkitTextFillColor: "transparent",
  backgroundImage: FORCE_WHITE_CLIP_IMAGE,
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
