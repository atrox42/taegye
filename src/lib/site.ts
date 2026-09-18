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
  { label: "home", href: "/" },
  { label: "new", href: "/new" },
  { label: "about", href: "/about" },
  { label: "store", href: STORE_URL, external: true },
] as const;

/** Logo display box — keep within the 135×48 px brand lockup. */
export const LOGO_DISPLAY = { width: 135, height: 48 } as const;

export const LOGO_SRC = "/logo-taegye.png";

export const COPYRIGHT = {
  year: 2026,
  owner: "LAB TAEGYE",
} as const;

export type FooterLinkItem = {
  label: string;
  href: string;
  external?: boolean;
};

/** Amomento-style two columns. No Order Status / Stockists. */
export const FOOTER_COLUMNS: FooterLinkItem[][] = [
  [
    { label: "Account", href: STORE_URL, external: true },
    { label: "Legals", href: "/legal" },
    { label: "FAQ", href: "/faq" },
  ],
  [
    { label: "About", href: "/about" },
    { label: "Store", href: STORE_URL, external: true },
    { label: "Contact", href: "/contact" },
    { label: "Instagram", href: INSTAGRAM_URL, external: true },
  ],
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

export const ABOUT = {
  en: {
    kicker: "TAEGYE",
    paragraphs: [
      "A moss terrarium is not decoration. It is a small climate — held, edited, and kept close.",
      "TAEGYE builds modular landscapes from moss, mineral, and glass. Each piece is assembled by hand, then left to settle into its own tempo.",
      "We look at form the way we look at moss: structure, repetition, and the patience of growth.",
    ],
  },
  kr: {
    kicker: "태계",
    paragraphs: [
      "이끼 테라리움은 장식이 아닙니다. 가까이 두고 가꾸는, 작은 기후입니다.",
      "태계는 이끼와 광물, 유리로 모듈형 풍경을 조립합니다. 모든 작업은 손으로 이루어지며, 그 이후의 시간은 풍경 스스로에게 맡깁니다.",
      "우리는 이끼를 보듯 형태를 봅니다. 구조, 반복, 그리고 자라는 일의 인내.",
    ],
  },
} as const;

export type NewProduct = {
  id: string;
  name: string;
  emptySrc: string;
  mossSrc: string;
  emptyAlt: string;
  mossAlt: string;
};

/** /new catalog — empty default, moss on hover. Prices omitted until Smart Store is live. */
export const NEW_PRODUCTS: NewProduct[] = [
  {
    id: "purple",
    name: "Modular Stand, Purple",
    emptySrc: "/products/stand-purple.webp",
    mossSrc: "/products/stand-purple-moss.webp",
    emptyAlt: "TAEGYE modular stand in purple",
    mossAlt: "TAEGYE modular stand in purple with moss",
  },
  {
    id: "white",
    name: "Modular Stand, White",
    emptySrc: "/products/stand-white.webp",
    mossSrc: "/products/stand-white-moss.webp",
    emptyAlt: "TAEGYE modular stand in white",
    mossAlt: "TAEGYE modular stand in white with moss",
  },
  {
    id: "black",
    name: "Modular Stand, Black",
    emptySrc: "/products/stand-black.webp",
    mossSrc: "/products/stand-black-moss.webp",
    emptyAlt: "TAEGYE modular stand in black",
    mossAlt: "TAEGYE modular stand in black with moss",
  },
  {
    id: "green",
    name: "Modular Stand, Green",
    emptySrc: "/products/stand-green.webp",
    mossSrc: "/products/stand-green-moss.webp",
    emptyAlt: "TAEGYE modular stand in green",
    mossAlt: "TAEGYE modular stand in green with moss",
  },
  {
    id: "silver",
    name: "Modular Stand, Silver",
    emptySrc: "/products/stand-silver.webp",
    mossSrc: "/products/stand-silver-moss.webp",
    emptyAlt: "TAEGYE modular stand in frosted silver",
    mossAlt: "TAEGYE modular stand in frosted silver with moss",
  },
];

export const FAQ_ITEMS = [
  {
    q: { en: "Where can I purchase TAEGYE?", kr: "태계는 어디에서 구매할 수 있나요?" },
    a: {
      en: "All pieces are available on our Naver Smart Store.",
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
      en: "Shipping details are listed at checkout on Smart Store.",
      kr: "배송 안내는 스마트스토어 결제 페이지에서 확인할 수 있습니다.",
    },
  },
] as const;
