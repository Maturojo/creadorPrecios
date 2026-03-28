const CATEGORY_PALETTES = {
  artistica: [
    {
      background: "#f3e8ff",
      border: "#c084fc",
      tagBackground: "#e9d5ff",
      tagColor: "#5b21b6",
      codeColor: "#6d28d9",
    },
    {
      background: "#ede9fe",
      border: "#a78bfa",
      tagBackground: "#ddd6fe",
      tagColor: "#6d28d9",
      codeColor: "#5b21b6",
    },
    {
      background: "#fae8ff",
      border: "#e879f9",
      tagBackground: "#f5d0fe",
      tagColor: "#a21caf",
      codeColor: "#86198f",
    },
  ],
  "productos para chicos": [
    {
      background: "#ffedd5",
      border: "#fb923c",
      tagBackground: "#fed7aa",
      tagColor: "#c2410c",
      codeColor: "#ea580c",
    },
    {
      background: "#fff7ed",
      border: "#f97316",
      tagBackground: "#ffedd5",
      tagColor: "#c2410c",
      codeColor: "#ea580c",
    },
    {
      background: "#ffedd5",
      border: "#fdba74",
      tagBackground: "#fdba74",
      tagColor: "#9a3412",
      codeColor: "#c2410c",
    },
  ],
  muebles: [
    {
      background: "#ecfdf5",
      border: "#34d399",
      tagBackground: "#d1fae5",
      tagColor: "#065f46",
      codeColor: "#047857",
    },
    {
      background: "#f0fdf4",
      border: "#4ade80",
      tagBackground: "#dcfce7",
      tagColor: "#166534",
      codeColor: "#15803d",
    },
    {
      background: "#e8f5e9",
      border: "#81c784",
      tagBackground: "#c8e6c9",
      tagColor: "#2e7d32",
      codeColor: "#1b5e20",
    },
  ],
  listoneria: [
    {
      background: "#f1f5f9",
      border: "#94a3b8",
      tagBackground: "#e2e8f0",
      tagColor: "#334155",
      codeColor: "#475569",
    },
    {
      background: "#eef2ff",
      border: "#a5b4fc",
      tagBackground: "#e0e7ff",
      tagColor: "#3730a3",
      codeColor: "#4338ca",
    },
    {
      background: "#eff6ff",
      border: "#93c5fd",
      tagBackground: "#dbeafe",
      tagColor: "#1d4ed8",
      codeColor: "#1e40af",
    },
  ],
  cortineria: [
    {
      background: "#ecfeff",
      border: "#67e8f9",
      tagBackground: "#cffafe",
      tagColor: "#155e75",
      codeColor: "#0f766e",
    },
    {
      background: "#f0fdfa",
      border: "#5eead4",
      tagBackground: "#ccfbf1",
      tagColor: "#115e59",
      codeColor: "#0f766e",
    },
    {
      background: "#e0f2fe",
      border: "#7dd3fc",
      tagBackground: "#bae6fd",
      tagColor: "#075985",
      codeColor: "#0369a1",
    },
  ],
  molduras: [
    {
      background: "#e0f2fe",
      border: "#0284c7",
      tagBackground: "#bae6fd",
      tagColor: "#0c4a6e",
      codeColor: "#075985",
    },
    {
      background: "#e0f7fa",
      border: "#0f766e",
      tagBackground: "#b2ebf2",
      tagColor: "#134e4a",
      codeColor: "#115e59",
    },
    {
      background: "#dbeafe",
      border: "#3b82f6",
      tagBackground: "#bfdbfe",
      tagColor: "#1e3a8a",
      codeColor: "#1d4ed8",
    },
  ],
  "calados y laser": [
    {
      background: "#fef2f2",
      border: "#f87171",
      tagBackground: "#fecaca",
      tagColor: "#991b1b",
      codeColor: "#b91c1c",
    },
    {
      background: "#fff1f2",
      border: "#fb7185",
      tagBackground: "#ffe4e6",
      tagColor: "#9f1239",
      codeColor: "#be123c",
    },
    {
      background: "#fff7ed",
      border: "#fb923c",
      tagBackground: "#fed7aa",
      tagColor: "#9a3412",
      codeColor: "#c2410c",
    },
  ],
  "productos varios": [
    {
      background: "#f5f5f4",
      border: "#a8a29e",
      tagBackground: "#e7e5e4",
      tagColor: "#57534e",
      codeColor: "#44403c",
    },
    {
      background: "#fafaf9",
      border: "#d6d3d1",
      tagBackground: "#f5f5f4",
      tagColor: "#57534e",
      codeColor: "#44403c",
    },
    {
      background: "#f8fafc",
      border: "#cbd5e1",
      tagBackground: "#e2e8f0",
      tagColor: "#475569",
      codeColor: "#334155",
    },
  ],
  "sin clasificar": [
    {
      background: "#f8fafc",
      border: "#cbd5e1",
      tagBackground: "#e2e8f0",
      tagColor: "#475569",
      codeColor: "#64748b",
    },
  ],
};

const DEFAULT_PALETTE = [
  {
    background: "#fff7ed",
    border: "#fdba74",
    tagBackground: "#ffedd5",
    tagColor: "#9a3412",
    codeColor: "#c2410c",
  },
];

function normalizeText(value) {
  return String(value || "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .trim()
    .toLowerCase();
}

function getHashIndex(value, length) {
  const normalized = normalizeText(value);

  if (!normalized || length <= 1) return 0;

  let hash = 0;
  for (let index = 0; index < normalized.length; index += 1) {
    hash = (hash * 31 + normalized.charCodeAt(index)) >>> 0;
  }

  return hash % length;
}

export function getProductoCardTheme(categoria, subcategoria) {
  const normalizedCategory = normalizeText(categoria);
  const palette =
    CATEGORY_PALETTES[normalizedCategory] ||
    CATEGORY_PALETTES["productos varios"] ||
    DEFAULT_PALETTE;

  const colorSet = palette[getHashIndex(subcategoria, palette.length)];

  return {
    "--producto-card-bg": colorSet.background,
    "--producto-card-border": colorSet.border,
    "--producto-card-tag-bg": colorSet.tagBackground,
    "--producto-card-tag-color": colorSet.tagColor,
    "--producto-card-code-color": colorSet.codeColor,
  };
}
