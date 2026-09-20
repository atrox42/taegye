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
  { label: "New", href: "/new" },
  { label: "About", href: "/about" },
  { label: "Store", href: STORE_URL, external: true },
] as const;

/** Logo display box — keep within the 135×48 px brand lockup. */
export const LOGO_DISPLAY = { width: 135, height: 48 } as const;

export const LOGO_SRC = "/logo-taegye.png";

/** Home grass loop — keep at intrinsic 192×108, never upscale. */
export const HERO_VIDEO_SRC = "/hero-grass-loop.mp4";
export const HERO_VIDEO_POSTER = "/hero-grass-poster.jpg";

export const COPYRIGHT = {
  year: 2026,
  owner: "LAB TAEGYE",
} as const;

export type FooterLinkItem = {
  label: string;
  href: string;
  external?: boolean;
};

/** Link stacks left of Instagram. Instagram is rendered flush right. */
export const FOOTER_COLUMNS: FooterLinkItem[][] = [
  [{ label: "Account", href: STORE_URL, external: true }],
  [
    { label: "Legals", href: "/legal" },
    { label: "Faq", href: "/faq" },
  ],
  [
    { label: "About", href: "/about" },
    { label: "Store", href: STORE_URL, external: true },
  ],
  [{ label: "Contact", href: "/contact" }],
];

export const FOOTER_INSTAGRAM: FooterLinkItem = {
  label: "Instagram",
  href: INSTAGRAM_URL,
  external: true,
};

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
  { id: "wall-kit", label: "Wall-kit" },
  { id: "one-port", label: "One-port" },
  { id: "etc", label: "Etc" },
] as const;

export type NewCategoryId = (typeof NEW_CATEGORIES)[number]["id"];

export const DEFAULT_NEW_CATEGORY: NewCategoryId = "wall-kit";

export type NewProduct = {
  id: string;
  category: NewCategoryId;
  name: string;
  price: string;
  emptySrc: string;
  mossSrc: string;
  emptyAlt: string;
  mossAlt: string;
};

export const STAND_PRICE = "KRW 108,000";

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

/** /new catalog — silver, purple, black, green, white. */
export const NEW_PRODUCTS: NewProduct[] = [
  {
    id: "silver",
    category: "wall-kit",
    name: "Modular Stand, Silver",
    price: STAND_PRICE,
    emptySrc: "/products/stand-silver.webp",
    mossSrc: "/products/stand-silver-moss.webp",
    emptyAlt: "TAEGYE modular stand in frosted silver",
    mossAlt: "TAEGYE modular stand in frosted silver with moss",
  },
  {
    id: "purple",
    category: "wall-kit",
    name: "Modular Stand, Purple",
    price: STAND_PRICE,
    emptySrc: "/products/stand-purple.webp",
    mossSrc: "/products/stand-purple-moss.webp",
    emptyAlt: "TAEGYE modular stand in purple",
    mossAlt: "TAEGYE modular stand in purple with moss",
  },
  {
    id: "black",
    category: "wall-kit",
    name: "Modular Stand, Black",
    price: STAND_PRICE,
    emptySrc: "/products/stand-black.webp",
    mossSrc: "/products/stand-black-moss.webp",
    emptyAlt: "TAEGYE modular stand in black",
    mossAlt: "TAEGYE modular stand in black with moss",
  },
  {
    id: "green",
    category: "wall-kit",
    name: "Modular Stand, Green",
    price: STAND_PRICE,
    emptySrc: "/products/stand-green.webp",
    mossSrc: "/products/stand-green-moss.webp",
    emptyAlt: "TAEGYE modular stand in green",
    mossAlt: "TAEGYE modular stand in green with moss",
  },
  {
    id: "white",
    category: "wall-kit",
    name: "Modular Stand, White",
    price: STAND_PRICE,
    emptySrc: "/products/stand-white.webp",
    mossSrc: "/products/stand-white-moss.webp",
    emptyAlt: "TAEGYE modular stand in white",
    mossAlt: "TAEGYE modular stand in white with moss",
  },
];

export function getNewProduct(id: string) {
  return NEW_PRODUCTS.find((product) => product.id === id);
}

export const FAQ_ITEMS = [
  {
    q: { en: "Where can I purchase TAEGYE?", kr: "태계는 어디에서 구매할 수 있나요?" },
    a: {
      en: "All pieces are available on our store.",
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
      en: "Shipping details are listed at checkout on the store.",
      kr: "배송 안내는 스마트스토어 결제 페이지에서 확인할 수 있습니다.",
    },
  },
] as const;
