/// <reference types="@figma/plugin-typings" />

import { rgbaToHex } from "./convertToFigmaVariables";

type ResolvedVariableValue = RGBA | string | number | boolean;

async function resolveVariableValue(
  value: VariableValue
): Promise<ResolvedVariableValue> {
  // STRING | NUMBER | BOOLEAN
  if (
    typeof value === "string" ||
    typeof value === "number" ||
    typeof value === "boolean"
  ) {
    return value;
  }

  // RGBA COLOR
  if (typeof value === "object" && value !== null && "r" in value) {
    return value as RGBA;
  }

  // VARIABLE ALIAS
  if (
    typeof value === "object" &&
    value !== null &&
    value.type === "VARIABLE_ALIAS"
  ) {
    const aliasedVariable = await figma.variables.getVariableByIdAsync(
      value.id
    );

    if (!aliasedVariable) {
      throw new Error(`Variable alias not found: ${value.id}`);
    }

    const aliasedModeId = Object.keys(aliasedVariable.valuesByMode)[0];

    const aliasedValue = aliasedVariable.valuesByMode[aliasedModeId];

    return resolveVariableValue(aliasedValue);
  }

  throw new Error("Unsupported variable value");
}

export async function exportFigmaVariables(targetCollections: string[]) {
  const collections = await figma.variables.getLocalVariableCollectionsAsync();

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

    exportData[collection.name] = (
      await Promise.all(
        variables
          .filter((variable): variable is Variable => variable !== null)
          .map(async (variable) => {
            const hasMultipleModes = collection.modes.length > 1;

            if (!hasMultipleModes) {
              const modeId = collection.modes[0].modeId;

              const value = variable.valuesByMode[modeId];

              const resolvedValue = await resolveVariableValue(value);

              let aliasName: string | null = null;

              const isAlias =
                typeof value === "object" &&
                value !== null &&
                "type" in value &&
                value.type === "VARIABLE_ALIAS";

              if (isAlias) {
                const aliasedVariable =
                  await figma.variables.getVariableByIdAsync(value.id);

                aliasName = aliasedVariable?.name ?? null;
              }

              return {
                variableName: variable.name,

                variableType: variable.resolvedType,

                variableAlias: aliasName,

                variableValue:
                  variable.resolvedType === "COLOR"
                    ? rgbaToHex(resolvedValue as RGBA)
                    : resolvedValue,
              };
            } else {
              const modeValues: Record<string, unknown> = {};

              for (const mode of collection.modes) {
                const value = variable.valuesByMode[mode.modeId];

                const resolvedValue = await resolveVariableValue(value);

                modeValues[mode.name] =
                  variable.resolvedType === "COLOR"
                    ? rgbaToHex(resolvedValue as RGBA)
                    : resolvedValue;
              }

              let aliasName: string | null = null;

              const firstModeValue =
                variable.valuesByMode[collection.modes[0].modeId];

              const isAlias =
                typeof firstModeValue === "object" &&
                firstModeValue !== null &&
                "type" in firstModeValue &&
                firstModeValue.type === "VARIABLE_ALIAS";

              if (isAlias) {
                const aliasedVariable =
                  await figma.variables.getVariableByIdAsync(firstModeValue.id);

                aliasName = aliasedVariable?.name ?? null;
              }

              return {
                variableName: variable.name,

                variableType: variable.resolvedType,

                variableAlias: aliasName,

                variableValue: modeValues,
              };
            }
          })
      )
    )
      .filter((variable) => !variable.variableName.includes("_components"))
      .sort((a, b) => a.variableName.localeCompare(b.variableName));
  }

  const tokens = Object.entries(exportData).reduce(
    (collectionAcc, [collectionName, variables]) => {
      const collectionTokens = (
        variables as Array<{
          variableName: string;
          variableValue: unknown;
        }>
      ).reduce(
        (acc, variable) => {
          const path = variable.variableName.split("/");

          let current = acc;

          path.forEach((segment, index) => {
            const isLast = index === path.length - 1;

            if (isLast) {
              current[segment] = variable.variableValue;
              return;
            }

            if (!current[segment]) {
              current[segment] = {};
            }

            current = current[segment] as Record<string, unknown>;
          });

          return acc;
        },
        {} as Record<string, unknown>
      );

      collectionAcc[collectionName] = collectionTokens;

      return collectionAcc;
    },
    {} as Record<string, Record<string, unknown>>
  );

  const exportMuiFormat = tokens;

  console.log(exportMuiFormat);
  console.log(exportData);

  return exportMuiFormat;
}
