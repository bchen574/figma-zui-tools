/// <reference types="@figma/plugin-typings" />

import { exportVariables } from "../src/lib/figma/getVariables";

import { convertToFigmaVariables } from "../src/lib/figma/convertToFigmaVariables";
import { primitiveTokens } from "../src/lib/tokens/primitiveTokens";

figma.showUI(__html__, {
  width: 300,
  height: 200,
});

figma.ui.onmessage = async (message) => {
  switch (message.type) {
    case "export-variables":
      try {
        const exportData = await exportVariables();

        console.log(exportData);

        figma.notify("Variables exported");
      } catch (error) {
        const message =
          error instanceof Error ? error.message : "Unknown error";

        figma.notify(`Failed to export variables: ${message}`);
      }

      break;

    case "sync-primitive-tokens":
      try {
        await syncPrimitiveTokens(primitiveTokens);

        figma.notify("Primitive tokens synced");
      } catch (error) {
        const message =
          error instanceof Error ? error.message : "Unknown error";

        figma.notify(`Failed to sync primitive tokens: ${message}`);
      }

      break;

    default:
      console.warn("Unknown message type:", message.type);
  }
};
async function syncPrimitiveTokens(tokens: typeof primitiveTokens) {
  const collections = await figma.variables.getLocalVariableCollectionsAsync();

  let collection = collections.find((c) => c.name === "custom");

  if (!collection) {
    collection = figma.variables.createVariableCollection("custom");
  }

  const modeId = collection.modes[0].modeId;

  const variables = convertToFigmaVariables(tokens);

  const existingVariables =
    await figma.variables.getLocalVariablesAsync("COLOR");

  for (const token of variables) {
    const existingVariable = existingVariables.find(
      (variable) =>
        variable.name === token.name &&
        variable.variableCollectionId === collection.id
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

  figma.notify("Primitive tokens synced");
}
