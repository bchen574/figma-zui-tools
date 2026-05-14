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

/**
 * A recursive tree mirrors the structure of nested Figma sections directly.
 * This replaces the previous hardcoded parent/child/grandchild approach so the
 * plugin can support any depth without introducing new rendering functions.
 */
type TOCNode = {
  id: string;
  name: string;
  section: SectionNode;
  depth: number;
  children: TOCNode[];
};

type FrameStyleConfig = Partial<FrameNode>;

type TextStyleConfig = {
  fontSize: number;
  isUnderlined: boolean;
};

const sharedVerticalAutoLayout: FrameStyleConfig = {
  layoutMode: "VERTICAL",
  primaryAxisSizingMode: "AUTO",
  counterAxisSizingMode: "AUTO",
};

/**
 * Styling is centralized so rendering can stay focused on structure instead of
 * repeating imperative property assignments throughout the tree renderer.
 */
const frameStyles = {
  tocRoot: {
    ...sharedVerticalAutoLayout,
    layoutMode: "HORIZONTAL",
    itemSpacing: 80,
    paddingTop: 32,
    paddingBottom: 32,
    paddingLeft: 32,
    paddingRight: 32,
    cornerRadius: 32,
    strokes: [],
    fills: [
      {
        type: "SOLID",
        color: { r: 0.745, g: 0.964, b: 0.576 },
      },
    ],
  } satisfies FrameStyleConfig,
  parentGroup: {
    ...sharedVerticalAutoLayout,
    itemSpacing: 24,
    paddingTop: 0,
    paddingBottom: 0,
    paddingLeft: 0,
    paddingRight: 0,
    fills: [],
    strokes: [],
  } satisfies FrameStyleConfig,
  childCard: {
    ...sharedVerticalAutoLayout,
    itemSpacing: 20,
    paddingTop: 32,
    paddingBottom: 32,
    paddingLeft: 32,
    paddingRight: 32,
    cornerRadius: 24,
    fills: [createMutedFill()],
    strokes: [],
  } satisfies FrameStyleConfig,
  grandchildPill: {
    ...sharedVerticalAutoLayout,
    itemSpacing: 16,
    paddingTop: 24,
    paddingBottom: 24,
    paddingLeft: 24,
    paddingRight: 24,
    cornerRadius: 20,
    fills: [createMutedFill()],
    strokes: [],
  } satisfies FrameStyleConfig,
};

const textStyles = {
  parent: {
    fontSize: 36,
    isUnderlined: false,
  } satisfies TextStyleConfig,
  child: {
    fontSize: 28,
    isUnderlined: true,
  } satisfies TextStyleConfig,
  grandchild: {
    fontSize: 24,
    isUnderlined: true,
  } satisfies TextStyleConfig,
  emptyState: {
    fontSize: 18,
    isUnderlined: false,
  } satisfies TextStyleConfig,
};

figma.ui.onmessage = async (msg: PluginMessage) => {
  if (msg.type === "generate-toc") {
    await generateTOC();
  }
};

async function generateTOC() {
  const textFont: FontName = {
    family: "Roboto",
    style: "Regular",
  };

  await figma.loadFontAsync(textFont);

  const tocFrame = createParentFrame();
  const tocTree = getTopLevelSections();

  if (tocTree.length === 0) {
    tocFrame.appendChild(
      createLinkedText({
        textFont,
        label: "No sections found on this page.",
        ...textStyles.emptyState,
      })
    );
  } else {
    tocTree.forEach((node) => {
      tocFrame.appendChild(renderTOCNode(node, textFont));
    });
  }

  figma.currentPage.appendChild(tocFrame);
  focusViewportOnNode(tocFrame);
  figma.closePlugin();
}

function createParentFrame() {
  const tocFrame = createStyledFrame(frameStyles.tocRoot);

  tocFrame.name = "Table of Contents";

  return tocFrame;
}

function isSectionNode(node: SceneNode): node is SectionNode {
  return node.type === "SECTION";
}

/**
 * This recursive traversal walks down the Figma section hierarchy and converts
 * it into plain TOC data. Keeping extraction separate from rendering makes the
 * render phase simpler, testable, and independent from Figma tree traversal.
 */
function buildTOCTree(section: SectionNode, depth: number): TOCNode {
  const childSections = section.children.filter(isSectionNode);

  return {
    id: section.id,
    name: section.name,
    section,
    depth,
    children: childSections.map((childSection) =>
      buildTOCTree(childSection, depth + 1)
    ),
  };
}

/**
 * The page scan happens once at the top level, then each section is expanded
 * recursively into a TOCNode tree. A reusable type predicate avoids repeating
 * inline narrowing logic everywhere child nodes are filtered.
 */
function getTopLevelSections(): TOCNode[] {
  return figma.currentPage.children
    .filter(isSectionNode)
    .map((section) => buildTOCTree(section, 0));
}

/**
 * Config-driven styling keeps node creation small and readable. `Object.assign`
 * lets us apply a prepared style object in one place instead of scattering
 * repetitive frame property assignments across the rendering pipeline.
 */
function applyFrameStyles(frame: FrameNode, styles: object): void {
  Object.assign(frame, styles);
}

function createStyledFrame(styles: Partial<FrameNode>): FrameNode {
  const frame = figma.createFrame();

  applyFrameStyles(frame, styles);

  return frame;
}

function resolveFrameStyles(depth: number): FrameStyleConfig {
  if (depth === 0) {
    return frameStyles.parentGroup;
  }

  if (depth === 1) {
    return frameStyles.childCard;
  }

  return frameStyles.grandchildPill;
}

function resolveTextStyles(depth: number): TextStyleConfig {
  if (depth === 0) {
    return textStyles.parent;
  }

  if (depth === 1) {
    return textStyles.child;
  }

  return textStyles.grandchild;
}

/**
 * Rendering mirrors extraction: each TOC node renders itself, then recursively
 * renders its children and appends their frames. Because the renderer only
 * depends on TOCNode data plus depth-based style resolution, it supports
 * arbitrary nesting without hardcoded hierarchy-specific components.
 */
function renderTOCNode(node: TOCNode, textFont: FontName): FrameNode {
  const frame = createStyledFrame(resolveFrameStyles(node.depth));
  const nodeTextStyles = resolveTextStyles(node.depth);

  frame.name = getNodeFrameName(node);
  frame.appendChild(
    createLinkedText({
      textFont,
      label: node.name,
      targetNodeId: node.id,
      ...nodeTextStyles,
    })
  );

  node.children.forEach((childNode) => {
    frame.appendChild(renderTOCNode(childNode, textFont));
  });

  return frame;
}

function getNodeFrameName(node: TOCNode): string {
  if (node.depth === 0) {
    return `${node.name} Group`;
  }

  if (node.depth === 1) {
    return `${node.name} Card`;
  }

  return `${node.name} Pill`;
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

function focusViewportOnNode(node: SceneNode) {
  node.x = figma.viewport.center.x;
  node.y = figma.viewport.center.y;
  figma.currentPage.selection = [node];
  figma.viewport.scrollAndZoomIntoView([node]);
}
