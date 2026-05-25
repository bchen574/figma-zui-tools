export type PaletteScale = Record<string, string>;

export type PaletteCollection = Record<string, PaletteScale>;

type RenameTokenName = (tokenName: string) => string;

type RenameTokenValue = (value: string) => string;

export function renameTokens(
  palettes: PaletteCollection,

  renameTokenName: RenameTokenName,

  renameTokenValue: RenameTokenValue
) {
  const renamed: PaletteCollection = {};

  for (const [paletteName, tokenGroup] of Object.entries(palettes)) {
    renamed[paletteName] = {};

    for (const [tokenName, value] of Object.entries(tokenGroup)) {
      const newTokenName = renameTokenName(tokenName);

      const newValue = renameTokenValue(value);

      renamed[paletteName][newTokenName] = newValue;
    }
  }

  return renamed;
}
