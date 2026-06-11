import {
  Combobox,
  ComboboxContent,
  ComboboxEmpty,
  ComboboxInput,
  ComboboxItem,
  ComboboxList,
} from "@/components/ui/combobox";

export function ModesDropdown({
  selectedModeNumber,
  setSelectedModeNumber,
}: {
  selectedModeNumber: string | null;
  setSelectedModeNumber: (mode: string | null) => void;
}) {
  return (
    <Combobox
      items={["0", "1", "2", "3"]}
      value={selectedModeNumber}
      onValueChange={setSelectedModeNumber}
    >
      <ComboboxInput placeholder="Select a Mode" />
      <ComboboxContent>
        <ComboboxEmpty>No items found.</ComboboxEmpty>
        <ComboboxList>
          {(item) => (
            <ComboboxItem key={item} value={item}>
              Mode {item}
            </ComboboxItem>
          )}
        </ComboboxList>
      </ComboboxContent>
    </Combobox>
  );
}
