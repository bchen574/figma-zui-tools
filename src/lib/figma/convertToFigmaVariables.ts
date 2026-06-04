// ======================================================
// DATA TYPES
// ======================================================

/**
 * Figma color format.
 * Values are normalized between 0 and 1.
 *
 * Example:
 * { r: 1, g: 0, b: 0, a: 1 }
 */
type RGBA = {
  r: number;
  g: number;
  b: number;
  a: number;
};

/**
 * Design token palette structure.
 *
 * Input:
 * {
 *   primary: {
 *     "100": "#E3F2FD",
 *     "500": "#2196F3"
 *   },
 *   secondary: {
 *     "100": "#F3E5F5"
 *   }
 * }
 */
export type TokenPalette = Record<string, Record<string, string>>;

/**
 * Figma variable format.
 *
 * Output:
 * {
 *   name: "primary/500",
 *   value: RGBA
 * }
 */
export type FigmaColorVariable = {
  name: string;
  value: RGBA;
};

// ======================================================
// CONFIGURATION TYPES
// ======================================================

/**
 * Optional settings for variable generation.
 *
 * Example:
 * {
 *   groupName: "light"
 * }
 */
type ConvertToFigmaVariablesOptions = {
  groupName?: string;
};

// ======================================================
// CONVERSION FUNCTIONS
// ======================================================

/**
 * Convert Hex -> RGBA
 *
 * Input:
 * "#2196F3"
 *
 * Output:
 * {
 *   r: 0.129,
 *   g: 0.588,
 *   b: 0.953,
 *   a: 1
 * }
 */
export function hexToRgba(hex: string): RGBA {
  const clean = hex.replace("#", "");

  return {
    r: parseInt(clean.slice(0, 2), 16) / 255,
    g: parseInt(clean.slice(2, 4), 16) / 255,
    b: parseInt(clean.slice(4, 6), 16) / 255,
    a: 1,
  };
}

/**
 * Convert RGBA -> Hex
 *
 * Input:
 * {
 *   r: 0.129,
 *   g: 0.588,
 *   b: 0.953,
 *   a: 1
 * }
 *
 * Output:
 * "#2196F3"
 */
export function rgbaToHex(rgba: RGBA): string {
  const r = Math.round(rgba.r * 255)
    .toString(16)
    .padStart(2, "0");

  const g = Math.round(rgba.g * 255)
    .toString(16)
    .padStart(2, "0");

  const b = Math.round(rgba.b * 255)
    .toString(16)
    .padStart(2, "0");

  return `#${r}${g}${b}`.toUpperCase();
}

// ======================================================
// TRANSFORMATION FUNCTIONS
// ======================================================

/**
 * Convert a token palette into Figma variables.
 *
 * Input:
 * {
 *   primary: {
 *     "100": "#E3F2FD",
 *     "500": "#2196F3"
 *   }
 * }
 *
 * Output:
 * [
 *   {
 *     name: "primary/100",
 *     value: RGBA
 *   },
 *   {
 *     name: "primary/500",
 *     value: RGBA
 *   }
 * ]
 *
 * Optional:
 * groupName = "light"
 *
 * Produces:
 * light/primary/100
 * light/primary/500
 */
export function convertToFigmaColorVariables(
  palette: TokenPalette,
  options?: ConvertToFigmaVariablesOptions
): FigmaColorVariable[] {
  const variables: FigmaColorVariable[] = [];

  for (const [paletteName, scale] of Object.entries(palette)) {
    for (const [toneKey, hex] of Object.entries(scale)) {
      const nameParts = [options?.groupName, paletteName, toneKey].filter(
        Boolean
      );

      variables.push({
        name: nameParts.join("/"),
        value: hexToRgba(hex),
      });
    }
  }

  return variables;
}
