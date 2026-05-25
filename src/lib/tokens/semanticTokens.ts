import { primitiveTokens } from "./primitiveTokens";

const { brand, neutral, yellow, green, red } = primitiveTokens;

export const semanticTokens = {
  primary: {
    lighter: brand["100"],
    light: brand["400"],
    main: brand["600"],
    dark: brand["700"],
    darker: brand["800"],
    contrastText: "#FFFFFF",
  },
  neutral: {
    lighter: neutral["100"],
    light: neutral["400"],
    main: neutral["600"],
    dark: neutral["700"],
    darker: neutral["800"],
    contrastText: "#FFFFFF",
  },
  error: {
    lighter: red["100"],
    light: red["400"],
    main: red["600"],
    dark: red["700"],
    darker: red["800"],
    contrastText: "#FFFFFF",
  },
  warning: {
    lighter: yellow["100"],
    light: yellow["400"],
    main: yellow["600"],
    dark: yellow["700"],
    darker: yellow["800"],
    contrastText: "#FFFFFF",
  },
  success: {
    lighter: green["100"],
    light: green["400"],
    main: green["600"],
    dark: green["700"],
    darker: green["800"],
    contrastText: "#FFFFFF",
  },
};
