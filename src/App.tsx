import { Button } from "@/components/ui/button";
import { useEffect } from "react";
import { useState } from "react";
import { CollectionsDropdown } from "@/components/collectionsDropdown";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";

export function App() {
  const [variableCollections, setVariableCollections] = useState<string[]>([]);
  const [output, setOutput] = useState<unknown>(null);
  const [selectedCollections, setSelectedCollections] = useState<string | null>(
    null
  );

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

  const handleSyncPrimitiveTokens = () => {
    postFigmaMessage("sync-primitive-tokens");
  };

  const handleExportVariables = () => {
    postFigmaMessage("export-color-variables", selectedCollections);
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

  return (
    <div className="flex h-full w-full gap-4 bg-background p-5">
      <div className="flex flex-col gap-6 py-2">
        <h1 className="text-lg font-semibold">Design System Tools</h1>

        <div className="flex flex-col gap-2">
          <h3 className="text-sm font-semibold">Sync Primitive Color Tokens</h3>
          <p className="text-xs text-muted-foreground">
            Sync primitive tokens from the plugin file to Figma.
          </p>
          <Button variant="bold" onClick={handleSyncPrimitiveTokens}>
            Sync Primitive Tokens
          </Button>
        </div>

        <div className="h-[1px] bg-muted"></div>

        <div className="flex flex-col gap-2">
          <h3 className="text-sm font-semibold">Export Variables</h3>
          <p className="text-xs text-muted-foreground">
            Export Variables from Figma Collection to MUI token format.
          </p>
          <CollectionsDropdown
            variableCollections={variableCollections}
            selectedCollections={selectedCollections}
            setSelectedCollections={setSelectedCollections}
          />
          <Button variant="bold" onClick={handleExportVariables}>
            Export Variables
          </Button>
        </div>
        <div className="h-[1px] bg-muted"></div>

        <div className="flex flex-col gap-2">
          <h3 className="text-sm font-semibold">Export Typography Styles</h3>
          <p className="text-xs text-muted-foreground">
            Export Typography Styles from Figma to Console
          </p>
          <Button variant="bold" onClick={handleExportTypographyStyles}>
            Export Typography Styles
          </Button>
        </div>
      </div>
      <div className="h-[1px] bg-muted"></div>

      <div className="flex min-h-0 flex-1 flex-col">
        <h3 className="text-md pb-4 font-semibold">Output</h3>
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
}

export default App;
