/**
 * Android Force Dark inverts solid `background-color` (and often CSS gradients).
 * Real raster files + <img> nodes are much harder for OEM auto-dark to invert.
 */
export const WHITE_BITMAP_SRC = "/bg-white.jpg";
/** 8×8 black at 40% alpha — Force Dark leaves PNG alpha alone; JPEG plates do not. */
export const DIM_BLACK_PNG_SRC = "/dim-black.png";
export const PANEL_BITMAP_SRC = "/bg-fafafa.jpg";
export const INK_111_SRC = "/ink-111.jpg";

/** PANTONE 667 C family — MAIN / SUB. JPEG+PNG plates skip OEM Force Dark invert. */
export const BRAND_MAIN = "#574667";
export const BRAND_SUB = "#6F5C82";
export const BRAND_MAIN_JPG = "/purple-574667.jpg";
export const BRAND_MAIN_PNG = "/purple-574667.png";
export const BRAND_SUB_JPG = "/purple-6F5C82.jpg";
export const BRAND_SUB_PNG = "/purple-6F5C82.png";

export const PURPLE_574667_SRC = BRAND_MAIN_JPG;
export const PURPLE_574667_PNG_SRC = BRAND_MAIN_PNG;
export const PURPLE_6F5C82_SRC = BRAND_SUB_JPG;
export const PURPLE_6F5C82_PNG_SRC = BRAND_SUB_PNG;

export const FORCE_WHITE_IMAGE =
  `url("${WHITE_BITMAP_SRC}"), url("/bg-white.png"), linear-gradient(#ffffff,#ffffff)`;

export const FORCE_INK_IMAGE = `url("${INK_111_SRC}")`;
export const FORCE_PURPLE_IMAGE = `url("${BRAND_MAIN_JPG}")`;
export const FORCE_PURPLE_LIGHT_IMAGE = `url("${BRAND_SUB_JPG}")`;
export const FORCE_WHITE_CLIP_IMAGE = `url("${WHITE_BITMAP_SRC}")`;

export const forceWhiteStyle = {
  backgroundColor: "#ffffff",
  backgroundImage: FORCE_WHITE_IMAGE,
  backgroundSize: "100% 100%",
  backgroundRepeat: "no-repeat",
  color: "#111111",
  colorScheme: "only light",
} as const;

/** CSS #111 is inverted by OEM Force Dark; a dark JPEG fill is not. */
export const forceInkStyle = {
  color: "#111111",
  WebkitTextFillColor: "transparent",
  backgroundColor: "transparent",
  backgroundImage: FORCE_INK_IMAGE,
  backgroundRepeat: "repeat",
  backgroundSize: "8px 8px",
  WebkitBackgroundClip: "text",
  backgroundClip: "text",
} as const;

export const forcePurpleStyle = {
  backgroundColor: `var(--brand-main, ${BRAND_MAIN})`,
  backgroundImage: `var(--brand-main-image, ${FORCE_PURPLE_IMAGE})`,
  backgroundSize: "100% 100%",
  backgroundRepeat: "no-repeat",
  color: "#ffffff",
  colorScheme: "only light",
} as const;

export const forcePurpleLightStyle = {
  backgroundColor: `var(--brand-sub, ${BRAND_SUB})`,
  backgroundImage: `var(--brand-sub-image, ${FORCE_PURPLE_LIGHT_IMAGE})`,
  backgroundSize: "100% 100%",
  backgroundRepeat: "no-repeat",
  color: "#ffffff",
  colorScheme: "only light",
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
