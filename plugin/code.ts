/// <reference types="@figma/plugin-typings" />

import { exportFigmaVariables } from "../src/lib/figma/exportFigmaVariables";

import { exportTypographyStyles } from "../src/lib/figma/exportTypographyStyles";

import { getVariableCollectionsList } from "../src/lib/figma/getVariablesCollectionList";
import { importColorVariables } from "../src/lib/figma/importColorVariables";

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

    case "import-color-variables":
      try {
        const collectionName = message.data.collectionName;
        const tokens = message.data.tokens;
        await importColorVariables(tokens, collectionName);

        figma.notify("Color variables imported successfully.");
      } catch (error) {
        const message =
          error instanceof Error ? error.message : "Unknown error";

        figma.notify(`Failed to import color variables: ${message}`);
        console.log(message);
      }

      break;

    default:
      console.warn("Unknown message type:", message.type);
  }
};
