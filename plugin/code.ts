/// <reference types="@figma/plugin-typings" />

import { exportFigmaVariables } from "../src/lib/figma/exportFigmaVariables";

import { convertToFigmaColorVariables } from "../src/lib/figma/convertToFigmaVariables";
import { exportTypographyStyles } from "../src/lib/figma/exportTypographyStyles";
import { primitiveTokens } from "../src/lib/tokens/primitiveTokens";
import { getVariableCollectionsList } from "../src/lib/figma/getVariablesCollectionList";

figma.showUI(__html__, {
  width: 800,
  height: 600,
});

figma.ui.onmessage = async (message) => {
  switch (message.type) {
    case "getVariableCollectionsList":
      try {
        const collectionsList = await getVariableCollectionsList();

        figma.ui.postMessage({
          type: "variableCollectionsList",
          success: true,
          data: collectionsList,
        });

        figma.notify("Variable collections list exported.");
      } catch (error) {
        const message =
          error instanceof Error ? error.message : "Unknown error";

        figma.ui.postMessage({
          type: "variableCollectionsList",
          success: false,
          error: message,
        });
        figma.notify(`Failed to get variable collections list: ${message}`);
      }
      break;

    case "export-variables":
      try {
        const targetCollections = [message.data];
        const exportData = await exportFigmaVariables(targetCollections);

        figma.notify("Color variables exported. Check plugin output.");

        figma.ui.postMessage({
          type: "exportedColorVariables",
          success: true,
          data: exportData,
        });
      } catch (error) {
        const message =
          error instanceof Error ? error.message : "Unknown error";

        figma.ui.postMessage({
          type: "exportedColorVariables",
          success: false,
          error: message,
        });

        figma.notify(`Failed to export Color variables: ${error}`);
      }
      break;

    case "export-typography-styles":
      try {
        const exportData = await exportTypographyStyles();
        console.log(exportData);
        figma.notify("Typography styles exported. Check console for output.");
      } catch (error) {
        const message =
          error instanceof Error ? error.message : "Unknown error";

        figma.notify(`Failed to export Typography styles: ${message}`);
      }
      break;

    case "sync-primitive-tokens":
      try {
        await syncPrimitiveColorTokens(primitiveTokens);

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
async function syncPrimitiveColorTokens(tokens: typeof primitiveTokens) {
  const collections = await figma.variables.getLocalVariableCollectionsAsync();

  const newCollectionName = "custom colors";

  let collection = collections.find((c) => c.name === newCollectionName);

  if (!collection) {
    collection = figma.variables.createVariableCollection(newCollectionName);
  }

  const modeId = collection.modes[0].modeId;

  const variables = convertToFigmaColorVariables(tokens);

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
}
