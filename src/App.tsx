import { Button } from "@/components/ui/button";
import { useEffect } from "react";
import { useState } from "react";
import { CollectionsDropdown } from "@/components/collectionsDropdown";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";

export function App() {
  const [variableCollections, setVariableCollections] = useState<string[]>([]);
  const [output, setOutput] = useState<unknown>("No output yet.");

  const handleVariableCollectionsList = () => {
    parent.postMessage(
      {
        pluginMessage: {
          type: "getVariableCollectionsList",
        },
      },
      "*"
    );
  };

  const handleSyncPrimitiveTokens = () => {
    parent.postMessage(
      {
        pluginMessage: {
          type: "sync-primitive-tokens",
        },
      },
      "*"
    );
  };

  const handleExportVariables = () => {
    parent.postMessage(
      {
        pluginMessage: {
          type: "export-color-variables",
        },
      },
      "*"
    );
  };

  const handleExportTypographyStyles = () => {
    parent.postMessage(
      {
        pluginMessage: {
          type: "export-typography-styles",
        },
      },
      "*"
    );
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
          <h3 className="text-md font-semibold">Sync Primite Color Tokens</h3>
          <p className="text-sm text-muted-foreground">
            Sync primitive tokens from the plugin file to Figma.
          </p>
          <Button variant="default" onClick={handleSyncPrimitiveTokens}>
            Sync Primitive Tokens
          </Button>
        </div>

        <div className="flex flex-col gap-2">
          <h3 className="text-md font-semibold">Export Variables</h3>
          <p className="text-xs text-muted-foreground">
            Export Variables from Figma Collection to Console
          </p>
          <CollectionsDropdown variableCollections={variableCollections} />
          <Button variant="default" onClick={handleExportVariables}>
            Export Variables
          </Button>
        </div>

        <div className="flex flex-col gap-2">
          <h3 className="text-md font-semibold">Export Typography Styles</h3>
          <p className="text-xs text-muted-foreground">
            Export Typography Styles from Figma to Console
          </p>
          <Button variant="default" onClick={handleExportTypographyStyles}>
            Export Typography Styles
          </Button>
        </div>
      </div>

      <div className="flex min-h-0 flex-1 flex-col">
        <h3 className="text-md pb-4 font-semibold">Output</h3>
        <ScrollArea className="min-h-0 flex-1 rounded border bg-muted">
          <pre className="p-4 text-xs">{JSON.stringify(output, null, 2)}</pre>
        </ScrollArea>
      </div>
    </div>
  );
}

export default App;
