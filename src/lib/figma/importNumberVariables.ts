// Input collection name as a string, and tokens object of the format.

// Input:

// {
//   spacing: {
//     xs: 4,
//     md: 16
//   },
//   radius: {
//     sm: 4,
//     lg: 12
//   }
// }

// Creates or updates number variables in the specified Figma collection.

type FigmaNumberVariable = {
  name: string;
  value: number;
};

export type TokenScale = Record<string, Record<string, number>>;

function convertToFigmaNumberVariables(
  tokens: Record<string, unknown>,
  path: string[] = []
): FigmaNumberVariable[] {
  const variables: FigmaNumberVariable[] = [];

  for (const [key, value] of Object.entries(tokens)) {
    const currentPath = [...path, key];

    if (typeof value === "number") {
      variables.push({
        name: currentPath.join("/"),
        value,
      });
      continue;
    }

    if (typeof value === "object" && value !== null) {
      variables.push(
        ...convertToFigmaNumberVariables(
          value as Record<string, unknown>,
          currentPath
        )
      );
    }
  }

  return variables;
}

export async function importNumberVariables(
  tokens: TokenScale,
  collectionName: string,
  modeNumber: number
) {
  //find collection, or create if it doesn't exist
  const collections = await figma.variables.getLocalVariableCollectionsAsync();

  let collection = collections.find((c) => c.name === collectionName);

  if (!collection) {
    collection = figma.variables.createVariableCollection(collectionName);
  }

  //setting the mode to be the selected mode in the collection.
  const modeId = collection.modes[modeNumber].modeId;

  //converts the input tokens to correct format for figma.
  const variables = convertToFigmaNumberVariables(tokens);

  //checks if the variable already exists in the collection. If it does, update the value. If not, create a new variable.
  const existingVariables = (
    await figma.variables.getLocalVariablesAsync("FLOAT")
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
      "FLOAT"
    );

    variable.setValueForMode(modeId, token.value);
  }
}
