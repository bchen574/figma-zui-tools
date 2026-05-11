import { Button } from "@/components/ui/button";

export function App() {
  const handleGenerateTOC = () => {
    parent.postMessage(
      {
        pluginMessage: {
          type: "generate-toc",
        },
      },
      "*"
    );
  };

  return (
    <div className="flex h-full w-full items-center justify-center bg-background p-4">
      <div className="w-full max-w-sm rounded-xl border bg-card p-4 shadow-sm">
        <div className="flex flex-col gap-4">
          <div>
            <h1 className="text-lg font-semibold">
              Table of Contents
            </h1>

            <p className="text-muted-foreground text-sm">
              Generate a table of contents from
              sections on the current page.
            </p>
          </div>

          <Button onClick={handleGenerateTOC}>
            Generate TOC
          </Button>
        </div>
      </div>
    </div>
  );
}

export default App;