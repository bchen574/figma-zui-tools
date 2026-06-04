type NavigationProps = {
  activePage: string;
  setActivePage: (page: string) => void;
};

import { Button } from "./ui/button";

export function Navigation({ activePage, setActivePage }: NavigationProps) {
  const pages = [
    "Export Variables",
    "Import Variables",
    "Export Styles",
  ] as const;

  return (
    <nav className="mt-3 mb-4 flex gap-2">
      {pages.map((page) => (
        <Button
          size="sm"
          variant={activePage === page ? "bold" : "outline"}
          key={page}
          onClick={() => setActivePage(page)}
        >
          {page}
        </Button>
      ))}
    </nav>
  );
}
