/// <reference types="@figma/plugin-typings" />

import { rgbaToHex } from "./convertToFigmaVariables";

export async function exportVariables() {
  const collections = await figma.variables.getLocalVariableCollectionsAsync();

  const targetCollections = ["custom", "palette"];

  const filteredCollections = collections.filter((collection) =>
    targetCollections.includes(collection.name)
  );

  const exportData: Record<string, unknown[]> = {};

  for (const collection of filteredCollections) {
    const variables = await Promise.all(
      collection.variableIds.map((variableId) =>
        figma.variables.getVariableByIdAsync(variableId)
      )
    );

    exportData[collection.name] = variables
      .filter((variable) => variable !== null)
      .map((variable) => {
        const value = Object.values(variable.valuesByMode)[0];

        return {
          variableId: variable.id,

          variableName: variable.name,

          variableType: variable.resolvedType,

          variableValue:
            variable.resolvedType === "COLOR"
              ? rgbaToHex(value as RGBA)
              : value,
        };
      });
  }

  console.log(exportData);
}
