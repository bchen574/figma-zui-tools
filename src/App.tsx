import { Button } from "@/components/ui/button";
import { useEffect } from "react";
import { useState } from "react";
import { CollectionsDropdown } from "@/components/collectionsDropdown";
import { ModesDropdown } from "@/components/modesDropdown";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Field, FieldLabel } from "@/components/ui/field";
import { Navigation } from "@/components/navigation";
import { Separator } from "@/components/ui/separator";
import { Textarea } from "@/components/ui/textarea";

export function App() {
  const [textAreaInput, setTextAreaInput] = useState("");
  const [variableCollections, setVariableCollections] = useState<string[]>([]);
  const [output, setOutput] = useState<unknown>(null);
  const [selectedCollections, setSelectedCollections] = useState<string | null>(
    null
  );
  const [selectedModeNumber, setSelectedModeNumber] = useState<string | null>(
    null
  );
  const [activePage, setActivePage] = useState("Export Variables");

  function postFigmaMessage(messageType: string, data?: unknown) {
    parent.postMessage(
      {
        pluginMessage: {
          type: messageType,
          data: data,
        },
      },
      "*"
    );
  }

  const handleVariableCollectionsList = () => {
    postFigmaMessage("getVariableCollectionsList");
  };

  const handleImportColorVariables = () => {
    postFigmaMessage("import-color-variables", {
      collectionName: selectedCollections,
      tokens: JSON.parse(textAreaInput),
    });
  };

  const handleImportNumberVariables = () => {
    postFigmaMessage("import-number-variables", {
      collectionName: selectedCollections,
      tokens: JSON.parse(textAreaInput),
      modeNumber: Number(selectedModeNumber),
    });
  };

  const handleExportVariables = () => {
    postFigmaMessage("export-variables", selectedCollections);
  };

  const handleExportTypographyStyles = () => {
    postFigmaMessage("export-typography-styles");
  };

  useEffect(() => {
    handleVariableCollectionsList();
  }, []);

  useEffect(() => {
    window.onmessage = (event) => {
      const message = event.data.pluginMessage;

      switch (message.type) {
        case "variableCollectionsList":
          if (message.success) {
            setVariableCollections(message.data);
          } else {
            setVariableCollections([]);
          }

          break;

        case "exportedColorVariables":
          if (message.success) {
            setOutput(message.data);
          } else {
            setOutput("Failed to export color variables.");
          }
      }
    };
  }, []);

  const exportVariablesPage = (
    <div className="flex h-full min-h-0 w-full gap-4">
      <div className="flex w-[300px] flex-col gap-2">
        <h3 className="text-sm font-semibold">Export Variables</h3>
        <p className="mb-2 text-xs text-muted-foreground">
          Export Variables from Figma Collection to MUI token format.
        </p>
        <Field className="mb-2">
          <FieldLabel>Collection Name</FieldLabel>
          <CollectionsDropdown
            variableCollections={variableCollections}
            selectedCollections={selectedCollections}
            setSelectedCollections={setSelectedCollections}
          />
        </Field>
        <Button
          disabled={selectedCollections === null}
          variant="bold"
          onClick={handleExportVariables}
        >
          Export Variables
        </Button>
      </div>
      <div className="flex min-h-0 flex-1 flex-col">
        <ScrollArea className="min-h-0 flex-1 rounded border bg-muted">
          <pre className="p-4 text-xs">
            {output === null
              ? "No output to display."
              : JSON.stringify(output, null, 2)}
          </pre>
        </ScrollArea>
      </div>
    </div>
  );
  const importColorVariablesPage = (
    <div className="flex h-full min-h-0 w-full gap-4">
      <div className="flex w-[300px] flex-col gap-2">
        <h3 className="text-sm font-semibold">Import Color Tokens</h3>
        <p className="mb-2 text-xs text-muted-foreground">
          Import color tokens to as variables in a Figma collection.
        </p>
        <Field className="mb-2">
          <FieldLabel>Collection Name</FieldLabel>
          <CollectionsDropdown
            variableCollections={variableCollections}
            selectedCollections={selectedCollections}
            setSelectedCollections={setSelectedCollections}
          />
        </Field>
        <Button
          disabled={selectedCollections === null}
          variant="bold"
          onClick={handleImportColorVariables}
        >
          Import Variables
        </Button>
      </div>
      <div className="flex min-h-0 flex-1 flex-col">
        <Textarea
          value={textAreaInput}
          onChange={(e) => setTextAreaInput(e.target.value)}
          placeholder={`{
  "primary": {
    "100": "#E3F2FD",
    "500": "#2196F3"
  },
  "secondary": {
    "100": "#F3E5F5"
  }
}`}
          className="min-h-0 flex-1 rounded border bg-muted"
        ></Textarea>
      </div>
    </div>
  );
  const importNumberVariablesPage = (
    <div className="flex h-full min-h-0 w-full gap-4">
      <div className="flex w-[300px] flex-col gap-2">
        <h3 className="text-sm font-semibold">Import Number Tokens</h3>
        <p className="mb-2 text-xs text-muted-foreground">
          Import number tokens to as variables in a Figma collection.
        </p>
        <Field className="mb-2">
          <FieldLabel>Collection Name</FieldLabel>
          <CollectionsDropdown
            variableCollections={variableCollections}
            selectedCollections={selectedCollections}
            setSelectedCollections={setSelectedCollections}
          />
          <ModesDropdown
            selectedModeNumber={selectedModeNumber}
            setSelectedModeNumber={setSelectedModeNumber}
          />
        </Field>
        <Button
          disabled={selectedCollections === null || selectedModeNumber === null}
          variant="bold"
          onClick={handleImportNumberVariables}
        >
          Import Variables
        </Button>
      </div>
      <div className="flex min-h-0 flex-1 flex-col">
        <Textarea
          value={textAreaInput}
          onChange={(e) => setTextAreaInput(e.target.value)}
          placeholder={`{
  "primary": {
    "100": "#E3F2FD",
    "500": "#2196F3"
  },
  "secondary": {
    "100": "#F3E5F5"
  }
}`}
          className="min-h-0 flex-1 rounded border bg-muted"
        ></Textarea>
      </div>
    </div>
  );

  return (
    <div className="flex h-full w-full flex-col bg-background p-5">
      <h1 className="text-lg font-semibold">Design System Tools</h1>

      <Navigation activePage={activePage} setActivePage={setActivePage} />
      <Separator className="mb-5"></Separator>

      {activePage === "Export Variables" && exportVariablesPage}
      {activePage === "Import Color Variables" && importColorVariablesPage}
      {activePage === "Import Number Variables" && importNumberVariablesPage}
      {activePage === "Export Styles" && (
        <div className="flex flex-col gap-2">
          <h3 className="text-sm font-semibold">Export Typography Styles</h3>
          <p className="mb-2 text-xs text-muted-foreground">
            Export Typography Styles from Figma to Console
          </p>
          <Button variant="bold" onClick={handleExportTypographyStyles}>
            Export Typography Styles
          </Button>
        </div>
      )}
    </div>
  );
}

export default App;
