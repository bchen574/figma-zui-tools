export type UniversalTokens = Record<number, string>;

//A group of colours. Is either called a role like primary, secondary, tertiary, error, success etc. or a color hue like red, green, yellow, etc.
export type UniversalPalette = Record<string, UniversalTokens>;

//An object with multiple palettes.
export type MdPaletteExport = {
  palettes: UniversalPalette;
};
