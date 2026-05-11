/// <reference types="@figma/plugin-typings" />

figma.showUI(__html__);

type PluginMessage =
  | {
      type: "create-shapes";
      count: number;
    }
  | {
      type: "generate-toc";
    };

figma.ui.onmessage = async (msg: PluginMessage) => {
  if (msg.type === "create-shapes") {
    const nodes: SceneNode[] = [];

    for (let i = 0; i < msg.count; i++) {
      const rect = figma.createRectangle();

      rect.x = i * 150;

      rect.fills = [
        {
          type: "SOLID",
          color: {
            r: 1,
            g: 0.5,
            b: 0,
          },
        },
      ];

      figma.currentPage.appendChild(rect);

      nodes.push(rect);
    }

    figma.currentPage.selection = nodes;

    figma.viewport.scrollAndZoomIntoView(nodes);

    figma.closePlugin();

    return;
  }

  if (msg.type === "generate-toc") {
    await generateTOC();

    return;
  }
};

async function generateTOC() {
  const textFont: FontName = {
    family: "Roboto",
    style: "Regular",
  };

  await figma.loadFontAsync(textFont);

  const tocFrame = createParentFrame();

  const topLevelSections = figma.currentPage.children.filter(
    (node): node is SectionNode => node.type === "SECTION"
  );

  if (topLevelSections.length === 0) {
    const emptyText = createLinkedText({
      textFont,
      label: "No sections found on this page.",
    });
    tocFrame.appendChild(emptyText);
  } else {
    topLevelSections.forEach((parentSection) => {
      tocFrame.appendChild(
        createParentSectionFrame({
          parentSection,
          textFont,
        })
      );
    });
  }

  figma.currentPage.appendChild(tocFrame);
  tocFrame.x = figma.viewport.center.x;
  tocFrame.y = figma.viewport.center.y;
  figma.currentPage.selection = [tocFrame];
  figma.viewport.scrollAndZoomIntoView([tocFrame]);
  figma.closePlugin();
}

function createParentFrame() {
  const tocFrame = figma.createFrame();

  tocFrame.name = "Table of Contents";
  tocFrame.layoutMode = "VERTICAL";
  tocFrame.primaryAxisSizingMode = "AUTO";
  tocFrame.counterAxisSizingMode = "AUTO";
  tocFrame.itemSpacing = 40;
  tocFrame.paddingTop = 32;
  tocFrame.paddingBottom = 32;
  tocFrame.paddingLeft = 32;
  tocFrame.paddingRight = 32;
  tocFrame.cornerRadius = 32;
  tocFrame.strokes = [];
  tocFrame.fills = [
    {
      type: "SOLID",
      color: { r: 1, g: 1, b: 1 },
    },
  ];

  return tocFrame;
}

function createParentSectionFrame({
  parentSection,
  textFont,
}: {
  parentSection: SectionNode;
  textFont: FontName;
}) {
  const sectionFrame = figma.createFrame();
  const childSections = parentSection.children.filter(
    (node): node is SectionNode => node.type === "SECTION"
  );

  sectionFrame.name = `${parentSection.name} Group`;
  sectionFrame.layoutMode = "VERTICAL";
  sectionFrame.primaryAxisSizingMode = "AUTO";
  sectionFrame.counterAxisSizingMode = "AUTO";
  sectionFrame.itemSpacing = 24;
  sectionFrame.paddingTop = 0;
  sectionFrame.paddingBottom = 0;
  sectionFrame.paddingLeft = 0;
  sectionFrame.paddingRight = 0;
  sectionFrame.fills = [];
  sectionFrame.strokes = [];

  const parentLabel = createLinkedText({
    textFont,
    label: parentSection.name,
    targetNodeId: parentSection.id,
    fontSize: 36,
    isUnderlined: false,
  });
  sectionFrame.appendChild(parentLabel);

  childSections.forEach((childSection) => {
    sectionFrame.appendChild(
      createChildSectionCard({
        childSection,
        textFont,
      })
    );
  });

  return sectionFrame;
}

function createChildSectionCard({
  childSection,
  textFont,
}: {
  childSection: SectionNode;
  textFont: FontName;
}) {
  const card = figma.createFrame();
  const grandchildSections = childSection.children.filter(
    (node): node is SectionNode => node.type === "SECTION"
  );

  card.name = `${childSection.name} Card`;
  card.layoutMode = "VERTICAL";
  card.primaryAxisSizingMode = "AUTO";
  card.counterAxisSizingMode = "AUTO";
  card.itemSpacing = 20;
  card.paddingTop = 32;
  card.paddingBottom = 32;
  card.paddingLeft = 32;
  card.paddingRight = 32;
  card.cornerRadius = 24;
  card.fills = [createMutedFill()];
  card.strokes = [];

  const childLabel = createLinkedText({
    textFont,
    label: childSection.name,
    targetNodeId: childSection.id,
    fontSize: 28,
    isUnderlined: true,
  });
  card.appendChild(childLabel);

  grandchildSections
    .slice(0, grandchildSections.length)
    .forEach((grandchild) => {
      card.appendChild(
        createGrandchildCard({
          grandchildSection: grandchild,
          textFont,
        })
      );
    });

  return card;
}

function createGrandchildCard({
  grandchildSection,
  textFont,
}: {
  grandchildSection: SectionNode;
  textFont: FontName;
}) {
  const card = figma.createFrame();
  const grandchildLabel = createLinkedText({
    textFont,
    label: grandchildSection.name,
    targetNodeId: grandchildSection.id,
    fontSize: 24,
    isUnderlined: true,
  });

  card.name = `${grandchildSection.name} Pill`;
  card.layoutMode = "VERTICAL";
  card.primaryAxisSizingMode = "AUTO";
  card.counterAxisSizingMode = "AUTO";
  card.paddingTop = 24;
  card.paddingBottom = 24;
  card.paddingLeft = 24;
  card.paddingRight = 24;
  card.cornerRadius = 20;
  card.fills = [createMutedFill()];
  card.strokes = [];
  card.appendChild(grandchildLabel);

  return card;
}

function createLinkedText({
  textFont,
  label,
  targetNodeId,
  fontSize = 18,
  isUnderlined = false,
}: {
  textFont: FontName;
  label: string;
  targetNodeId?: string;
  fontSize?: number;
  isUnderlined?: boolean;
}) {
  const text = figma.createText();

  text.fontName = textFont;
  text.characters = label;
  text.fontSize = fontSize;
  text.fills = [
    {
      type: "SOLID",
      color: { r: 0, g: 0, b: 0 },
    },
  ];
  text.textDecoration = isUnderlined ? "UNDERLINE" : "NONE";

  if (targetNodeId) {
    text.setRangeHyperlink(0, label.length, {
      type: "NODE",
      value: targetNodeId,
    });
  }

  return text;
}

function createMutedFill(): SolidPaint {
  return {
    type: "SOLID",
    color: { r: 0, g: 0, b: 0 },
    opacity: 0.05,
  };
}
