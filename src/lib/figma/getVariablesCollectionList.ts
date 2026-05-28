/// <reference types="@figma/plugin-typings" />

export async function getVariableCollectionsList() {
  const collections = await figma.variables.getLocalVariableCollectionsAsync();

  const collectionsList = collections.map((collection) => collection.name);

  return collectionsList;
}
