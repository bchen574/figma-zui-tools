import type { PrimitiveColorPalette } from "../tokens/primitiveTokens.types";

type RGBA = {
  r: number;
  g: number;
  b: number;
  a: number;
};

export type FigmaColorVariable = {
  name: string;
  value: RGBA;
};

export function hexToRgba(hex: string): RGBA {
  const clean = hex.replace("#", "");

  return {
    r: parseInt(clean.slice(0, 2), 16) / 255,
    g: parseInt(clean.slice(2, 4), 16) / 255,
    b: parseInt(clean.slice(4, 6), 16) / 255,
    a: 1,
  };
}

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

type ConvertToFigmaVariablesOptions = {
  groupName?: string;
};

export function convertToFigmaColorVariables(
  palette: PrimitiveColorPalette,
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
