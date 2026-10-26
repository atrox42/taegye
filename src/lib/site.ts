export const SITE_NAME = "TAEGYE";
export const SITE_NAME_KR = "태계";
export const SITE_HANDLE = "taegye";

/** Public origin for canonical URLs, JSON-LD, sitemap, and OG. Switch to https://taegye.kr later. */
export const SITE_URL = "https://taegye.vercel.app";

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

/** Finish code → parenthetical color. No space before `(`. */
export const FINISH_TONE = {
  HOLLOW: "Translucent",
  ODD: "Indigo Purple",
  VOID: "Black",
  BUG: "Bamboo Green",
  MIST: "White",
} as const;

export type FinishCode = keyof typeof FINISH_TONE;

export function finishLabel(code: FinishCode) {
  return `${code}(${FINISH_TONE[code]})`;
}

/** Home “New In” — first item is the mobile feature; desktop shows both. */
export const HOME_NEW_IN = [
  {
    id: "silver",
    caption: `Wall 212, ${finishLabel("HOLLOW")} — moss on steel.`,
  },
  {
    id: "purple",
    caption: `Wall 212, ${finishLabel("ODD")} — moss on steel.`,
  },
] as const;

/** Home opening promo — set `enabled: false` to hide without deleting copy. */
export const HOME_PROMO = {
  enabled: true,
  productName: `Wall 212, ${finishLabel("HOLLOW")}`,
  productKicker: "Now Available",
  productSrc: "/products/stand-silver-moss.webp",
  href: "/new/silver",
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

/** About page — EN then KR; two paragraphs each; one sentence per line. */
export const ABOUT = {
  en: [
    [
      "Structures where nature grows.",
      "TAEGYE is a design brand creating structures where plants and moss can take root and grow.",
      "We consider where roots settle, how water flows, and where moisture stays, designing the foundations of a small living world.",
      "Forms found in rock, geological layers, and eroded landscapes inform our structures for planting and growth.",
      "Through 3D design and digital fabrication, we create vertical walls and dimensional spaces where plants, moss, soil, and stone come together.",
    ],
    [
      "TAEGYE’s products continue to change as nature settles in.",
      "Plants grow and moss spreads, creating different landscapes within the same structure.",
      "We create the structures where that change begins.",
    ],
  ],
  kr: [
    [
      "자연이 자라는 구조.",
      "태계는 식물과 이끼가 뿌리내리고 자랄 수 있는 구조를 만드는 디자인 브랜드입니다.",
      "뿌리가 머무는 자리, 물이 흐르는 길, 습기가 유지되는 공간을 생각하며 작은 세계의 기반을 설계합니다.",
      "암석과 지층, 침식된 지형에서 발견한 형태를 식재와 성장을 위한 구조로 발전시킵니다.",
      "3D 디자인과 디지털 제작을 통해 수직의 벽과 입체적인 공간을 만들고, 그 안에 식물과 이끼, 흙과 돌이 자리 잡습니다.",
    ],
    [
      "태계의 제품은 자연이 자리 잡으면서 계속 변화합니다.",
      "식물이 자라고 이끼가 번지며, 같은 구조 안에서도 서로 다른 풍경이 만들어집니다.",
      "우리는 그 변화가 시작될 구조를 만듭니다.",
    ],
  ],
} as const;

export const NEW_CATEGORIES = [
  { id: "all", label: "All" },
  { id: "wall-kit", label: "Wall 212" },
  { id: "mini-port", label: "One Port" },
  { id: "one-port", label: "Starship" },
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
  /** Empty until measured. Do not invent values. */
  dimensions: string;
  /** Empty until planting notes exist. Do not invent values. */
  planting: string;
  /** Catalog card only — no `/new/[id]` page and no click-through. */
  listedOnly?: boolean;
};

/** Matches the site mobile / desktop split used by nav, PDP gallery, and float logo. */
export const PRODUCT_MOBILE_MEDIA = "(max-width: 767px)";

export const STAND_PRICE_SILVER = "KRW 106,000";
export const STAND_PRICE_COLOR = "KRW 86,000";
export const ONE_PORT_PRICE = "KRW 36,000";
export const DRAIN_TOWER_PRICE_20 = "KRW 3,000";
export const DRAIN_TOWER_PRICE_40 = "KRW 5,000";
export const DRAIN_TOWER_PRICE_80 = "KRW 9,000";
export const MINI_PORT_PRICE = "KRW 56,000";
export const CASCADE_PRICE_PURPLE = "KRW 197,000";
export const CASCADE_PRICE_SILVER = "KRW 236,000";

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
    body: "Dimensions to be confirmed. Wall 212 modular stand.",
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

/** Customer PDP copy — verbatim; do not edit wording, spelling, or punctuation. */
export const PRODUCT_COPY = {
  "wall-kit":
    "Wall은 바닥과 수직 벽면을 모두 식재 공간으로 활용할 수 있도록 설계된 DIY 테라리움 키트입니다. 3D 프린팅으로 제작된 월 구조물에 이끼와 식물을 식재하고, 바닥에는 배양토와 자연 소재를 배치하여 입체적인 자연환경을 구성할 수 있습니다. 사용자의 취향에 따라 식물과 돌, 유목 등의 소재를 자유롭게 조합할 수 있으며, 시간이 지남에 따라 식물이 구조물에 자리 잡고 성장하면서 자연스럽게 변화하는 테라리움을 완성할 수 있습니다.",
  "mini-port":
    "Oneport는 하나의 식물 포트와 유리 커버로 구성된 단일 식물 전용 온실입니다. 유리 커버를 통해 내부 습도를 유지하여 높은 습도를 필요로 하는 열대식물과 정글식물이 성장하기에 적합한 환경을 제공합니다. 하나의 식물을 독립적으로 관리할 수 있도록 설계되었으며, 식물의 형태와 성장 과정을 가까이에서 관찰할 수 있는 소형 온실입니다.",
  "one-port":
    "Starship은 어린 열대식물과 소형 정글식물을 독립적으로 재배할 수 있도록 설계된 미니 온실입니다. 하나의 식물 포트와 유리 커버로 구성되어 있으며, 작은 공간에서도 식물의 생육에 필요한 습도를 유지할 수 있도록 돕습니다. 발아 이후의 어린 식물부터 크기가 작은 열대식물까지 개별적으로 관리할 수 있으며, 식물의 성장 과정을 가까이에서 관찰할 수 있습니다. 컴팩트한 크기와 간결한 구조로 정글식물 재배를 처음 시작하는 사용자에게도 적합한 제품입니다.",
  cascade:
    "Cascade는 물이 흐르는 폭포를 구현할 수 있도록 설계된 DIY 여과 시스템 구조물입니다. 내부 여과 공간과 물의 순환 구조를 기반으로 실제 물이 흐르는 폭포를 연출할 수 있으며, 사용자가 구조물 외부에 돌과 배양토 등 다양한 자연 소재를 직접 부착하여 원하는 형태로 제작할 수 있습니다. 이끼와 습한 환경을 선호하는 식물을 함께 식재할 수 있어 팔루디리움 등 다양한 생태 환경에 활용할 수 있습니다. 여과 기능과 자유로운 조형 작업을 결합하여 사용자만의 폭포 환경을 구성할 수 있는 제품입니다.",
  "drain-tower":
    "Drain Tower & Drain은 내부에 고이는 물을 효율적으로 배출하고, 바닥의 수분을 관리할 수 있도록 설계된 배수 보조 구조물입니다. 식물에 공급된 물이나 분무로 인해 바닥에 축적되는 잔여 수분을 필요에 따라 제거할 수 있으며, 과도한 수분 축적으로 인한 뿌리 손상과 배양토의 과습을 예방하는 데 도움을 줍니다. 바닥 구조와 사육장 크기에 따라 선택하여 설치할 수 있으며, 식물의 생육 환경을 보다 안정적으로 관리할 수 있도록 돕는 제품입니다.",
} as const satisfies Record<NewProductCategoryId, string>;

export function productColorLabel(product: NewProduct) {
  const parts = product.name.split(", ");
  const finish = parts[1] ?? product.finish.replace(/ finish$/i, "");
  return finish.replace(/\([^)]*\)$/, "");
}

export function productFamilyLabel(product: NewProduct) {
  return product.name.split(", ")[0] ?? product.name;
}

export function productNote(product: NewProduct) {
  return PRODUCT_COPY[product.category];
}

export function productNoteLead(product: NewProduct) {
  const note = productNote(product);
  const match = note.match(/^.+?\./);
  return match ? match[0] : note;
}

export const PRODUCT_SPEC_PENDING = "준비 중";

/** Live PDP dimension line until measured numbers replace it. No heading, no subtitle. */
export const PRODUCT_DIMENSION_PLACEHOLDER = "W — × D — × H — mm";

export const PRODUCT_PLANTING_LABEL_LINES = [
  "Recommended Planting & Environment",
  "추천 식재 조건 및 환경",
] as const;

export const PRODUCT_SPEC_LABELS = {
  dimensions: "Dimensions / 치수",
  planting: `${PRODUCT_PLANTING_LABEL_LINES[0]} / ${PRODUCT_PLANTING_LABEL_LINES[1]}`,
} as const;

export function productSpecValue(product: NewProduct, key: "dimensions" | "planting") {
  return product[key].trim();
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

/** /new catalog — Wall 212, One Port 141, Starship 157, Cascade 600, then Drain Tower. */
export const NEW_PRODUCTS: NewProduct[] = [
  {
    id: "silver",
    category: "wall-kit",
    name: `Wall 212, ${finishLabel("HOLLOW")}`,
    nameKr: `월 212, ${finishLabel("HOLLOW")}`,
    finish: "HOLLOW finish",
    dimensions: "",
    planting: "",
    price: STAND_PRICE_SILVER,
    emptySrc: "/products/stand-silver.webp",
    mossSrc: "/products/stand-silver-moss.webp",
    emptySrcMobile: "/products/stand-silver-mobile.webp",
    mossSrcMobile: "/products/stand-silver-moss-mobile.webp",
    emptyAlt: `TAEGYE Wall 212, ${finishLabel("HOLLOW")}`,
    mossAlt: `TAEGYE Wall 212, ${finishLabel("HOLLOW")} with moss`,
  },
  {
    id: "purple",
    category: "wall-kit",
    name: `Wall 212, ${finishLabel("ODD")}`,
    nameKr: `월 212, ${finishLabel("ODD")}`,
    finish: "ODD finish",
    dimensions: "",
    planting: "",
    price: STAND_PRICE_COLOR,
    emptySrc: "/products/stand-purple.webp",
    mossSrc: "/products/stand-purple-moss.webp",
    emptyAlt: `TAEGYE Wall 212, ${finishLabel("ODD")}`,
    mossAlt: `TAEGYE Wall 212, ${finishLabel("ODD")} with moss`,
  },
  {
    id: "black",
    category: "wall-kit",
    name: `Wall 212, ${finishLabel("VOID")}`,
    nameKr: `월 212, ${finishLabel("VOID")}`,
    finish: "VOID finish",
    dimensions: "",
    planting: "",
    price: STAND_PRICE_COLOR,
    emptySrc: "/products/stand-black.webp",
    mossSrc: "/products/stand-black-moss.webp",
    emptyAlt: `TAEGYE Wall 212, ${finishLabel("VOID")}`,
    mossAlt: `TAEGYE Wall 212, ${finishLabel("VOID")} with moss`,
  },
  {
    id: "green",
    category: "wall-kit",
    name: `Wall 212, ${finishLabel("BUG")}`,
    nameKr: `월 212, ${finishLabel("BUG")}`,
    finish: "BUG finish",
    dimensions: "",
    planting: "",
    price: STAND_PRICE_COLOR,
    emptySrc: "/products/stand-green.webp",
    mossSrc: "/products/stand-green-moss.webp",
    emptyAlt: `TAEGYE Wall 212, ${finishLabel("BUG")}`,
    mossAlt: `TAEGYE Wall 212, ${finishLabel("BUG")} with moss`,
  },
  {
    id: "white",
    category: "wall-kit",
    name: `Wall 212, ${finishLabel("MIST")}`,
    nameKr: `월 212, ${finishLabel("MIST")}`,
    finish: "MIST finish",
    dimensions: "",
    planting: "",
    price: STAND_PRICE_COLOR,
    emptySrc: "/products/stand-white.webp",
    mossSrc: "/products/stand-white-moss.webp",
    emptySrcMobile: "/products/stand-white-mobile.webp",
    mossSrcMobile: "/products/stand-white-moss-mobile.webp",
    emptyAlt: `TAEGYE Wall 212, ${finishLabel("MIST")}`,
    mossAlt: `TAEGYE Wall 212, ${finishLabel("MIST")} with moss`,
  },
  {
    id: "mini-port-purple",
    category: "mini-port",
    name: `One Port 141, ${finishLabel("ODD")}`,
    nameKr: `원 포트 141, ${finishLabel("ODD")}`,
    finish: "ODD finish",
    dimensions: "",
    planting: "",
    price: MINI_PORT_PRICE,
    emptySrc: "/products/mini-port-purple.png?v=2",
    emptyAlt: `TAEGYE One Port 141, ${finishLabel("ODD")}`,
  },
  {
    id: "mini-port-black",
    category: "mini-port",
    name: `One Port 141, ${finishLabel("VOID")}`,
    nameKr: `원 포트 141, ${finishLabel("VOID")}`,
    finish: "VOID finish",
    dimensions: "",
    planting: "",
    price: MINI_PORT_PRICE,
    emptySrc: "/products/mini-port-black.png?v=2",
    emptyAlt: `TAEGYE One Port 141, ${finishLabel("VOID")}`,
  },
  {
    id: "mini-port-white",
    category: "mini-port",
    name: `One Port 141, ${finishLabel("MIST")}`,
    nameKr: `원 포트 141, ${finishLabel("MIST")}`,
    finish: "MIST finish",
    dimensions: "",
    planting: "",
    price: MINI_PORT_PRICE,
    emptySrc: "/products/mini-port-white.png?v=2",
    emptyAlt: `TAEGYE One Port 141, ${finishLabel("MIST")}`,
  },
  {
    id: "one-port-purple",
    category: "one-port",
    name: `Starship 157, ${finishLabel("ODD")}`,
    nameKr: `스타쉽 157, ${finishLabel("ODD")}`,
    finish: "ODD finish",
    dimensions: "",
    planting: "",
    price: ONE_PORT_PRICE,
    emptySrc: "/products/one-port-purple.png",
    mossSrc: "/products/one-port-purple-plant.png",
    emptyAlt: `TAEGYE Starship 157, ${finishLabel("ODD")}`,
    mossAlt: `TAEGYE Starship 157, ${finishLabel("ODD")} with plant`,
  },
  {
    id: "one-port-black",
    category: "one-port",
    name: `Starship 157, ${finishLabel("VOID")}`,
    nameKr: `스타쉽 157, ${finishLabel("VOID")}`,
    finish: "VOID finish",
    dimensions: "",
    planting: "",
    price: ONE_PORT_PRICE,
    emptySrc: "/products/one-port-black.png",
    mossSrc: "/products/one-port-black-plant.png",
    emptyAlt: `TAEGYE Starship 157, ${finishLabel("VOID")}`,
    mossAlt: `TAEGYE Starship 157, ${finishLabel("VOID")} with plant`,
  },
  {
    id: "one-port-white",
    category: "one-port",
    name: `Starship 157, ${finishLabel("MIST")}`,
    nameKr: `스타쉽 157, ${finishLabel("MIST")}`,
    finish: "MIST finish",
    dimensions: "",
    planting: "",
    price: ONE_PORT_PRICE,
    emptySrc: "/products/one-port-white.png",
    mossSrc: "/products/one-port-white-plant.png",
    emptySrcMobile: "/products/one-port-white-mobile.png",
    mossSrcMobile: "/products/one-port-white-plant-mobile.png",
    emptyAlt: `TAEGYE Starship 157, ${finishLabel("MIST")}`,
    mossAlt: `TAEGYE Starship 157, ${finishLabel("MIST")} with plant`,
  },
  {
    id: "cascade-silver",
    category: "cascade",
    name: `Cascade 600, ${finishLabel("HOLLOW")}`,
    nameKr: `캐스케이드 600, ${finishLabel("HOLLOW")}`,
    finish: "HOLLOW finish",
    dimensions: "",
    planting: "",
    price: CASCADE_PRICE_SILVER,
    emptySrc: "/products/cascade-silver.png",
    emptyAlt: `TAEGYE Cascade 600, ${finishLabel("HOLLOW")}`,
  },
  {
    id: "cascade-black",
    category: "cascade",
    name: `Cascade 600, ${finishLabel("VOID")}`,
    nameKr: `캐스케이드 600, ${finishLabel("VOID")}`,
    finish: "VOID finish",
    dimensions: "",
    planting: "",
    price: CASCADE_PRICE_PURPLE,
    emptySrc: "/products/cascade-black.png",
    emptyAlt: `TAEGYE Cascade 600, ${finishLabel("VOID")}`,
  },
  {
    id: "drain-tower-80",
    category: "drain-tower",
    name: `Drain Tower 80, ${finishLabel("VOID")}`,
    nameKr: `드레인 타워 80, ${finishLabel("VOID")}`,
    finish: "Black",
    dimensions: "W 55 × D 55 × H 80 mm",
    planting: "",
    price: DRAIN_TOWER_PRICE_80,
    emptySrc: "/products/drain-tower-80.png",
    emptyAlt: `TAEGYE Drain Tower 80, ${finishLabel("VOID")}`,
  },
  {
    id: "drain-tower-40",
    category: "drain-tower",
    name: `Drain Tower 40, ${finishLabel("VOID")}`,
    nameKr: `드레인 타워 40, ${finishLabel("VOID")}`,
    finish: "Black",
    dimensions: "W 55 × D 55 × H 45 mm",
    planting: "",
    price: DRAIN_TOWER_PRICE_40,
    emptySrc: "/products/drain-tower-40.png?v=3",
    emptyAlt: `TAEGYE Drain Tower 40, ${finishLabel("VOID")}`,
  },
  {
    id: "drain-tower-20",
    category: "drain-tower",
    name: `Drain Tower 20, ${finishLabel("VOID")}`,
    nameKr: `드레인 타워 20, ${finishLabel("VOID")}`,
    finish: "Black",
    dimensions: "W 55 × D 55 × H 25 mm",
    planting: "",
    price: DRAIN_TOWER_PRICE_20,
    emptySrc: "/products/drain-tower-20.png?v=3",
    emptyAlt: `TAEGYE Drain Tower 20, ${finishLabel("VOID")}`,
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
