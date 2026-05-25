// PRIMITIVE COLOR TOKENS

// Hex color string.
// Example: "#FFFFFF"
export type HexColor = `#${string}`;

// Allowed primitive tone labels.
export type PrimitiveColorTokenName =
  | "0"
  | "10"
  | "20"
  | "50"
  | "100"
  | "200"
  | "300"
  | "400"
  | "500"
  | "600"
  | "650"
  | "700"
  | "750"
  | "800"
  | "850"
  | "900"
  | "950"
  | "1000";

// Tonal scale for a single color.
// Example: brand -> { "0": "#FFF", "1000": "#000" }
export type PrimitiveColorScale = Record<PrimitiveColorTokenName, HexColor>;

// Collection of primitive color scales.
// Example: { brand: {...}, neutral: {...} }
export type PrimitiveColorPalette = Record<string, PrimitiveColorScale>;
