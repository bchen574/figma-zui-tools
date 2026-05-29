import {
  Combobox,
  ComboboxContent,
  ComboboxEmpty,
  ComboboxInput,
  ComboboxItem,
  ComboboxList,
} from "@/components/ui/combobox";

export function CollectionsDropdown({
  variableCollections,
  selectedCollections,
  setSelectedCollections,
}: {
  variableCollections: string[];
  selectedCollections: string | null;
  setSelectedCollections: (collection: string | null) => void;
}) {
  return (
    <Combobox
      items={variableCollections}
      value={selectedCollections}
      onValueChange={setSelectedCollections}
    >
      <ComboboxInput placeholder="Select a Collection" />
      <ComboboxContent>
        <ComboboxEmpty>No items found.</ComboboxEmpty>
        <ComboboxList>
          {(item) => (
            <ComboboxItem key={item} value={item}>
              {item}
            </ComboboxItem>
          )}
        </ComboboxList>
      </ComboboxContent>
    </Combobox>
  );
}
