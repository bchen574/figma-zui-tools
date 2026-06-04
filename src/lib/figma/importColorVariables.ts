import type { TokenPalette } from "./convertToFigmaVariables";
import { convertToFigmaColorVariables } from "./convertToFigmaVariables";

//Input collection name as a string, and tokens object of the format.

// Input:

// {
//   primary: {
//     "100": "#E3F2FD",
//     "500": "#2196F3"
//   },
//   secondary: {
//     "100": "#F3E5F5"
//   }
// }

// Creates or updates color variables in the specified Figma collection.

export async function importColorVariables(
  tokens: TokenPalette,
  collectionName: string
) {
  //find collection, or create if it doesn't exist
  const collections = await figma.variables.getLocalVariableCollectionsAsync();

  let collection = collections.find((c) => c.name === collectionName);

  if (!collection) {
    collection = figma.variables.createVariableCollection(collectionName);
  }

  //setting the mode to be the first mode in the collection. This can be extended in the future to support multiple modes.
  const modeId = collection.modes[0].modeId;

  //converts the input tokens to correct format for figma.
  const variables = convertToFigmaColorVariables(tokens);

  //checks if the variable already exists in the collection. If it does, update the value. If not, create a new variable.
  const existingVariables = (
    await figma.variables.getLocalVariablesAsync("COLOR")
  )
    // line above checks the type, "COLOR" | "FLOAT" | "STRING" | "BOOLEAN";

    .filter((variable) => variable.variableCollectionId === collection.id);

  for (const token of variables) {
    const existingVariable = existingVariables.find(
      (variable) => variable.name === token.name
    );

    if (existingVariable) {
      existingVariable.setValueForMode(modeId, token.value);

      continue;
    }

    const variable = figma.variables.createVariable(
      token.name,
      collection,
      "COLOR"
    );

    variable.setValueForMode(modeId, token.value);
  }
}
