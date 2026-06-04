/// <reference types="@figma/plugin-typings" />

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

    exportData[collection.name] = await Promise.all(
      variables
        .filter((variable): variable is Variable => variable !== null)
        .map(async (variable) => {
          const variableValue = variable.valuesByMode[collection.defaultModeId];

          const resolvedValue = await handleVariableAlias(variable, collection);

          return {
            variableId: variable.id,

            variableName: variable.name,

            variableType: variable.resolvedType,

            variableValue,

            resolvedValue,
          };
        })
    );
  }

  console.log(exportData);

  return exportData;
}

async function handleVariableAlias(
  variable: Variable,
  collection: VariableCollection
) {
  const value = variable.valuesByMode[collection.defaultModeId];

  if (
    typeof value === "object" &&
    value !== null &&
    "id" in value &&
    value.type === "VARIABLE_ALIAS"
  ) {
    const aliasedVariable = await figma.variables.getVariableByIdAsync(
      (value as VariableAlias).id
    );

    return {
      aliasId: aliasedVariable?.id,

      aliasName: aliasedVariable?.name,

      aliasType: aliasedVariable?.resolvedType,

      aliasValue: aliasedVariable?.valuesByMode[collection.defaultModeId],
    };
  }

  return value;
}
