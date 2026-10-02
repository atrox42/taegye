export const SITE_NAME = "TAEGYE";
export const SITE_NAME_KR = "태계";
export const SITE_HANDLE = "taegye";

export const SITE_DESCRIPTION =
  "TAEGYE — modular moss terrarium. A quiet landscape, assembled by hand.";

/** Naver Smart Store — update when the live store URL is confirmed. */
export const STORE_URL = "https://smartstore.naver.com/taegye";

export const INSTAGRAM_URL = "https://www.instagram.com/taegye_/";

export const CONTACT_EMAIL = "hello@taegye.kr";

export const NAV_ITEMS = [
  { label: "Home", href: "/" },
  { label: "Product", href: "/new" },
  { label: "About", href: "/about" },
  { label: "Store", href: STORE_URL, external: true },
] as const;

/** Logo display box — keep within the 135×48 px brand lockup. */
export const LOGO_DISPLAY = { width: 135, height: 48 } as const;
/** Footer lockup — 20% smaller than the default. */
export const FOOTER_LOGO_DISPLAY = { width: 108, height: 38 } as const;

/** Transparent black PNG — drawn onto canvas so OEM Force Dark cannot grey it. */
export const LOGO_SRC = "/logo-taegye.png";

/** Home loops — intrinsic 230×130; CSS displays 138×78 on mobile. */
export const HERO_CLIP = { width: 230, height: 130 } as const;
export const HERO_CLIP_MOBILE = { width: 138, height: 78 } as const;

export const HERO_CLIPS = [
  { id: "a", src: "/hero-loop-a.mp4", poster: "/hero-poster-a.jpg" },
  { id: "b", src: "/hero-loop-b.mp4", poster: "/hero-poster-b.jpg" },
  { id: "c", src: "/hero-loop-c.mp4", poster: "/hero-poster-c.jpg" },
] as const;

/** Home opening promo — set `enabled: false` to hide without deleting copy. */
/** Home “New In” — first item is the mobile feature; desktop shows both. */
export const HOME_NEW_IN = [
  {
    id: "silver",
    caption: "Modular Stand, Silver — moss on steel.",
  },
  {
    id: "purple",
    caption: "Modular Stand, Purple — moss on steel.",
  },
] as const;

export const HOME_PROMO = {
  enabled: true,
  eyebrow: "GRAND OPENING",
  title: "5% OFF",
  line: "스마트스토어 첫 구매 5% 할인",
  cta: "쿠폰 받기",
  href: STORE_URL,
  hideTodayLabel: "오늘 하루 보지 않기",
  closeLabel: "닫기",
} as const;

export const COPYRIGHT = {
  year: 2026,
  owner: "TAEGYE LAB",
} as const;

export type FooterLinkItem = {
  label: string;
  href: string;
  external?: boolean;
};

export const FOOTER_INSTAGRAM: FooterLinkItem = {
  label: "Instagram",
  href: INSTAGRAM_URL,
  external: true,
};

/** Desktop footer — one horizontal row. No Account, no Store, no Legals. */
export const FOOTER_LINKS: FooterLinkItem[] = [
  { label: "About", href: "/about" },
  { label: "Contact", href: "/contact" },
  { label: "Faq", href: "/faq" },
  FOOTER_INSTAGRAM,
];

/** Korean e-commerce legal line — placeholders until business details are confirmed. */
export const LEGAL = {
  company: "TAEGYE",
  companyKr: "태계",
  ceo: "—",
  businessNumber: "000-00-00000",
  mailOrderNumber: "2026-서울-0000",
  address: "Seoul, Republic of Korea",
  email: CONTACT_EMAIL,
  phone: "—",
} as const;

export function legalLine() {
  return [
    `상호: ${LEGAL.company} (${LEGAL.companyKr})`,
    `대표: ${LEGAL.ceo}`,
    `사업자등록번호: ${LEGAL.businessNumber}`,
    `통신판매업신고: ${LEGAL.mailOrderNumber}`,
    `주소: ${LEGAL.address}`,
    `이메일: ${LEGAL.email}`,
    `전화: ${LEGAL.phone}`,
  ].join("  ·  ");
}

/** About page — each paragraph is three display lines (EN 3+3, KR 3+3). */
export const ABOUT = {
  en: [
    [
      "TAEGYE is an object brand working with terrariums.",
      "We consider each piece as a whole, from the combination of plants and materials to the vessel that holds them.",
      "We care as much about how these elements come together and sit within a space as we do about the beauty of an individual plant.",
    ],
    [
      "A terrarium continues to change after it is made.",
      "As plants grow, new shapes emerge and the arrangement takes on a different character.",
      "TAEGYE embraces these changes, creating objects that invite you to look closely and enjoy them over time.",
    ],
  ],
  kr: [
    [
      "태계는 테라리움을 만드는 오브제 브랜드입니다.",
      "식물과 재료의 조합부터 이를 담는 그릇까지, 전체의 형태를 함께 생각합니다.",
      "식물 하나의 아름다움만큼 여러 요소가 모였을 때의 모습과 공간에 놓였을 때의 어울림을 중요하게 봅니다.",
    ],
    [
      "테라리움은 완성된 이후에도 조금씩 달라집니다.",
      "식물이 자라면서 처음에는 보이지 않던 모양이 생기고, 재료 사이의 관계도 바뀝니다.",
      "태계는 이러한 변화를 담아, 두고 바라보는 즐거움이 있는 오브제를 만듭니다.",
    ],
  ],
} as const;

export const NEW_CATEGORIES = [
  { id: "all", label: "All" },
  { id: "wall-kit", label: "Wall-kit" },
  { id: "one-port", label: "Dot-port" },
  { id: "cascade", label: "Cascade" },
  { id: "drain-tower", label: "Drain Tower" },
] as const;

export type NewCategoryId = (typeof NEW_CATEGORIES)[number]["id"];
export type NewProductCategoryId = Exclude<NewCategoryId, "all">;

export const DEFAULT_NEW_CATEGORY: NewCategoryId = "all";

export type NewProduct = {
  id: string;
  category: NewProductCategoryId;
  name: string;
  nameKr: string;
  finish: string;
  price?: string;
  emptySrc: string;
  mossSrc?: string;
  /** Brightened raster for max-width: 767px. Desktop keeps `emptySrc`. */
  emptySrcMobile?: string;
  mossSrcMobile?: string;
  emptyAlt: string;
  mossAlt?: string;
  /** Catalog card only — no `/new/[id]` page and no click-through. */
  listedOnly?: boolean;
};

/** Matches the site mobile / desktop split used by nav, PDP gallery, and float logo. */
export const PRODUCT_MOBILE_MEDIA = "(max-width: 767px)";

export const STAND_PRICE_SILVER = "KRW 103,000";
export const STAND_PRICE_COLOR = "KRW 86,000";
export const ONE_PORT_PRICE = "KRW 38,000";
export const DRAIN_TOWER_PRICE_100 = "KRW 8,000";
export const DRAIN_TOWER_PRICE_160 = "KRW 15,000";
export const DRAIN_TOWER_PRICE_230 = "KRW 23,000";
export const CASCADE_PRICE_PURPLE = "KRW 207,000";
export const CASCADE_PRICE_SILVER = "KRW 223,000";

export const STAND_FEATURES = [
  "A modular vessel for a moss object",
  "Open L-frame",
] as const;

export const STAND_FEATURES_TAIL = ["Sits on a wall", "Looks different over time"] as const;

export const STAND_STAR_NOTE = "* Keep in indirect light. Water sparingly.";

export const STAND_ORIGIN = "Made In Korea";

export const STAND_ACCORDION = [
  {
    label: "Size",
    body: "Dimensions to be confirmed. Wall-kit modular stand.",
  },
  {
    label: "Care",
    body: "Keep in indirect light. Water sparingly. Let the moss set its own pace.",
  },
  {
    label: "Shipping & Returns",
    body: "Shipping and returns are listed at checkout on the Store.",
  },
] as const;

export const STAND_NOTE = {
  en: [
    "A modular vessel for a moss object.",
    "Keep in indirect light. Water sparingly.",
  ],
  kr: [
    "이끼를 담는 모듈러 스탠드.",
    "직사광선을 피하고, 물은 적게 주세요.",
  ],
} as const;

export const ONE_PORT_NOTE = {
  en: [
    "A glass vessel for a living plant.",
    "Keep in indirect light. Water sparingly.",
  ],
  kr: [
    "식물을 담는 원 포트.",
    "직사광선을 피하고, 물은 적게 주세요.",
  ],
} as const;

export function productColorLabel(product: NewProduct) {
  const parts = product.name.split(", ");
  return parts[1] ?? product.finish.replace(/ finish$/i, "");
}

export function productFamilyLabel(product: NewProduct) {
  return product.name.split(", ")[0] ?? product.name;
}

export function productNote(product: NewProduct) {
  if (product.category === "one-port") return ONE_PORT_NOTE;
  if (product.category === "wall-kit") return STAND_NOTE;
  return null;
}

/**
 * Decorative /new grid tile — not a product.
 * Slot is 1-indexed and chosen client-side among 2–6.
 * Image is picked from the moss + wood set after mount.
 */
export const GRID_TEXTURE_SRCS = [
  "/products/grid-textures/moss-1.webp",
  "/products/grid-textures/moss-2.webp",
  "/products/grid-textures/moss-3.webp",
  "/products/grid-textures/moss-4.webp",
  "/products/grid-textures/moss-5.webp",
  "/products/grid-textures/wood-1.webp",
  "/products/grid-textures/wood-3.webp",
] as const;
export const GRID_TEXTURE_SLOT_MIN = 2;
export const GRID_TEXTURE_SLOT_MAX = 6;

/** /new catalog — Modular Stand, Dot Port, Cascade, then Drain Tower. */
export const NEW_PRODUCTS: NewProduct[] = [
  {
    id: "silver",
    category: "wall-kit",
    name: "Modular Stand, Silver",
    nameKr: "모듈러 스탠드, 실버",
    finish: "Silver finish",
    price: STAND_PRICE_SILVER,
    emptySrc: "/products/stand-silver.webp",
    mossSrc: "/products/stand-silver-moss.webp",
    emptySrcMobile: "/products/stand-silver-mobile.webp",
    mossSrcMobile: "/products/stand-silver-moss-mobile.webp",
    emptyAlt: "TAEGYE modular stand in frosted silver",
    mossAlt: "TAEGYE modular stand in frosted silver with moss",
  },
  {
    id: "purple",
    category: "wall-kit",
    name: "Modular Stand, Purple",
    nameKr: "모듈러 스탠드, 퍼플",
    finish: "Purple finish",
    price: STAND_PRICE_COLOR,
    emptySrc: "/products/stand-purple.webp",
    mossSrc: "/products/stand-purple-moss.webp",
    emptyAlt: "TAEGYE modular stand in purple",
    mossAlt: "TAEGYE modular stand in purple with moss",
  },
  {
    id: "black",
    category: "wall-kit",
    name: "Modular Stand, Black",
    nameKr: "모듈러 스탠드, 블랙",
    finish: "Black finish",
    price: STAND_PRICE_COLOR,
    emptySrc: "/products/stand-black.webp",
    mossSrc: "/products/stand-black-moss.webp",
    emptyAlt: "TAEGYE modular stand in black",
    mossAlt: "TAEGYE modular stand in black with moss",
  },
  {
    id: "green",
    category: "wall-kit",
    name: "Modular Stand, Green",
    nameKr: "모듈러 스탠드, 그린",
    finish: "Green finish",
    price: STAND_PRICE_COLOR,
    emptySrc: "/products/stand-green.webp",
    mossSrc: "/products/stand-green-moss.webp",
    emptyAlt: "TAEGYE modular stand in green",
    mossAlt: "TAEGYE modular stand in green with moss",
  },
  {
    id: "white",
    category: "wall-kit",
    name: "Modular Stand, White",
    nameKr: "모듈러 스탠드, 화이트",
    finish: "White finish",
    price: STAND_PRICE_COLOR,
    emptySrc: "/products/stand-white.webp",
    mossSrc: "/products/stand-white-moss.webp",
    emptySrcMobile: "/products/stand-white-mobile.webp",
    mossSrcMobile: "/products/stand-white-moss-mobile.webp",
    emptyAlt: "TAEGYE modular stand in white",
    mossAlt: "TAEGYE modular stand in white with moss",
  },
  {
    id: "one-port-purple",
    category: "one-port",
    name: "Dot Port, Purple",
    nameKr: "닷 포트, 퍼플",
    finish: "Purple finish",
    price: ONE_PORT_PRICE,
    emptySrc: "/products/one-port-purple.png",
    mossSrc: "/products/one-port-purple-plant.png",
    emptyAlt: "TAEGYE dot port in purple",
    mossAlt: "TAEGYE dot port in purple with plant",
  },
  {
    id: "one-port-black",
    category: "one-port",
    name: "Dot Port, Black",
    nameKr: "닷 포트, 블랙",
    finish: "Black finish",
    price: ONE_PORT_PRICE,
    emptySrc: "/products/one-port-black.png",
    mossSrc: "/products/one-port-black-plant.png",
    emptyAlt: "TAEGYE dot port in black",
    mossAlt: "TAEGYE dot port in black with plant",
  },
  {
    id: "one-port-white",
    category: "one-port",
    name: "Dot Port, White",
    nameKr: "닷 포트, 화이트",
    finish: "White finish",
    price: ONE_PORT_PRICE,
    emptySrc: "/products/one-port-white.png",
    mossSrc: "/products/one-port-white-plant.png",
    emptySrcMobile: "/products/one-port-white-mobile.png",
    mossSrcMobile: "/products/one-port-white-plant-mobile.png",
    emptyAlt: "TAEGYE dot port in white",
    mossAlt: "TAEGYE dot port in white with plant",
  },
  {
    id: "cascade-silver",
    category: "cascade",
    name: "Cascade, Silver",
    nameKr: "캐스케이드, 실버",
    finish: "Silver finish",
    price: CASCADE_PRICE_SILVER,
    emptySrc: "/products/cascade-silver.png",
    emptyAlt: "TAEGYE Cascade, Silver",
  },
  {
    id: "cascade-purple",
    category: "cascade",
    name: "Cascade, Purple",
    nameKr: "캐스케이드, 퍼플",
    finish: "Purple finish",
    price: CASCADE_PRICE_PURPLE,
    emptySrc: "/products/cascade-purple.png",
    emptyAlt: "TAEGYE Cascade, Purple",
  },
  {
    id: "cascade-black",
    category: "cascade",
    name: "Cascade, Black",
    nameKr: "캐스케이드, 블랙",
    finish: "Black finish",
    price: CASCADE_PRICE_PURPLE,
    emptySrc: "/products/cascade-black.png",
    emptyAlt: "TAEGYE Cascade, Black",
  },
  {
    id: "drain-tower-100",
    category: "drain-tower",
    name: "Drain Tower 100",
    nameKr: "드레인 타워 100",
    finish: "Black",
    price: DRAIN_TOWER_PRICE_100,
    emptySrc: "/products/drain-tower-100.png",
    emptyAlt: "TAEGYE Drain Tower 100",
  },
  {
    id: "drain-tower-160",
    category: "drain-tower",
    name: "Drain Tower 160",
    nameKr: "드레인 타워 160",
    finish: "Black",
    price: DRAIN_TOWER_PRICE_160,
    emptySrc: "/products/drain-tower-160.png",
    emptyAlt: "TAEGYE Drain Tower 160",
  },
  {
    id: "drain-tower-230",
    category: "drain-tower",
    name: "Drain Tower 230",
    nameKr: "드레인 타워 230",
    finish: "Black",
    price: DRAIN_TOWER_PRICE_230,
    emptySrc: "/products/drain-tower-230.png",
    emptyAlt: "TAEGYE Drain Tower 230",
  },
];

export function getNewProduct(id: string) {
  return NEW_PRODUCTS.find((product) => product.id === id);
}

export function productsInFamily(product: NewProduct) {
  const family = productFamilyLabel(product);
  return NEW_PRODUCTS.filter((item) => productFamilyLabel(item) === family);
}

export const FAQ_ITEMS = [
  {
    q: { en: "Where can I purchase TAEGYE?", kr: "태계는 어디에서 구매할 수 있나요?" },
    a: {
      en: "All pieces are available on our Store.",
      kr: "모든 제품은 네이버 스마트스토어에서 구매할 수 있습니다.",
    },
  },
  {
    q: { en: "How should a terrarium be kept?", kr: "테라리움은 어떻게 관리하나요?" },
    a: {
      en: "Keep it in indirect light. Water sparingly. Let the moss set its own pace.",
      kr: "직사광선을 피한 자리에 두고, 물은 적게 주세요. 이끼의 속도를 따릅니다.",
    },
  },
  {
    q: { en: "Do you ship?", kr: "배송이 가능한가요?" },
    a: {
      en: "Shipping details are listed at checkout on the Store.",
      kr: "배송 안내는 스마트스토어 결제 페이지에서 확인할 수 있습니다.",
    },
  },
] as const;
