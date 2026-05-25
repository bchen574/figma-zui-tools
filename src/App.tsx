import { Button } from "@/components/ui/button";

export function App() {
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
          type: "export-variables",
        },
      },
      "*"
    );
  };

  return (
    <div className="flex h-full w-full items-center justify-center bg-background p-4">
      <div className="flex flex-col gap-4 py-2">
        <h1 className="text-lg font-semibold">Design System Tools</h1>

        <Button variant="secondary" onClick={handleSyncPrimitiveTokens}>
          Sync Primitive Tokens
        </Button>
        <p className="text-sm text-muted-foreground">
          Sync primitive tokens from the plugin file to Figma.
        </p>

        <Button variant="secondary" onClick={handleExportVariables}>
          Export Variables
        </Button>
        <p className="text-sm text-muted-foreground">
          Export Variables from Figma Collection to Console
        </p>
      </div>
    </div>
  );
}

export default App;
