/// <reference types="@figma/plugin-typings" />

type TypographyUnit = "PIXELS" | "PERCENT";

type TypographyValue = {
  unit: TypographyUnit;
  value: number;
};

type TypographyStyle = {
  styleName: string;

  fontFamily: string;

  fontStyle: string;

  fontSize: number;

  lineHeight: TypographyValue;

  letterSpacing: TypographyValue;

  paragraphSpacing: number;
};

type TypographyPreview = {
  font: string;
  fontDetails: string;
};

export async function exportTypographyStyles() {
  const textStyles = await figma.getLocalTextStylesAsync();

  const exportData: TypographyStyle[] = textStyles.map((style) => ({
    styleName: style.name,

    fontFamily: style.fontName.family,

    fontStyle: style.fontName.style,

    fontSize: style.fontSize,

    lineHeight:
      style.lineHeight.unit === "AUTO"
        ? {
            unit: "PIXELS",
            value: style.fontSize * 1.2,
          }
        : {
            unit: style.lineHeight.unit,
            value: style.lineHeight.value,
          },

    letterSpacing: {
      unit: style.letterSpacing.unit,
      value: style.letterSpacing.value,
    },

    paragraphSpacing: style.paragraphSpacing,
  }));

  const cleanedData: TypographyPreview[] = exportData.map((style) => ({
    name: `${style.styleName.replace("typography/", "")}`,

    font: `${style.fontFamily} - ${style.fontStyle}`,

    fontDetails: [
      `${style.fontSize}px`,

      `${style.lineHeight.value.toFixed(2)}${
        style.lineHeight.unit === "PERCENT" ? "%" : "px"
      }`,

      `${style.letterSpacing.value.toFixed(2)}${
        style.letterSpacing.unit === "PERCENT" ? "%" : "px"
      }`,
    ].join(" / "),
  }));

  return cleanedData;
}
