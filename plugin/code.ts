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
  color: RGB;
  fontStyle: string;
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
    layoutMode: "VERTICAL",
    itemSpacing: 200,
    paddingTop: 200,
    paddingBottom: 200,
    paddingLeft: 200,
    paddingRight: 200,
    cornerRadius: 80,
    fills: [
      {
        type: "SOLID",
        color: {
          r: 0.96,
          g: 0.96,
          b: 0.96,
        },
        opacity: 0.5,
      },
    ],
    strokes: [],
  } satisfies FrameStyleConfig,

  depth0Group: {
    ...sharedVerticalAutoLayout,
    itemSpacing: 40,
    fills: [],
    strokes: [],
  } satisfies FrameStyleConfig,

  depth1Group: {
    ...sharedVerticalAutoLayout,
    itemSpacing: 40,
    fills: [],
    strokes: [],
  } satisfies FrameStyleConfig,

  depth2Group: {
    ...sharedVerticalAutoLayout,
    itemSpacing: 40,
    paddingLeft: 40,
    fills: [],
    strokes: [],
  } satisfies FrameStyleConfig,

  depth3Group: {
    ...sharedVerticalAutoLayout,
    itemSpacing: 32,
    paddingLeft: 32,
    fills: [],
    strokes: [],
  } satisfies FrameStyleConfig,
};

const textStyles = {
  hero: {
    fontSize: 164,
    color: black(),
    fontStyle: "SemiBold",
  },

  helper: {
    fontSize: 80,
    color: muted(),
    fontStyle: "Regular",
  },

  depth1: {
    fontSize: 120,
    color: black(),
    fontStyle: "SemiBold",
  },

  depth2: {
    fontSize: 116,
    color: black(),
    fontStyle: "Regular",
  },

  depth3: {
    fontSize: 96,
    color: muted(),
    fontStyle: "Regular",
  },
};

figma.ui.onmessage = async (msg: PluginMessage) => {
  if (msg.type === "generate-toc") {
    await generateTOC();
  }
};

async function generateTOC() {
  const textFont: FontName = {
    family: "Geist",
    style: "Regular",
  };
  const textSemiBoldFont: FontName = {
    family: "Geist",
    style: "SemiBold",
  };

  await figma.loadFontAsync(textFont);
  await figma.loadFontAsync(textSemiBoldFont);

  const tocFrame = createParentFrame();
  const tocTree = getTopLevelSections();
  const heroFrame = createStyledFrame({
    ...sharedVerticalAutoLayout,
    itemSpacing: 24,
    fills: [],
    strokes: [],
  });

  heroFrame.appendChild(
    createLinkedText({
      textFont,
      label: "Table of Contents",
      ...textStyles.hero,
    })
  );

  heroFrame.appendChild(
    createLinkedText({
      textFont,
      label: "Click on label to navigate to page.",
      ...textStyles.helper,
    })
  );

  tocFrame.appendChild(heroFrame);

  if (tocTree.length === 0) {
    tocFrame.appendChild(
      createLinkedText({
        textFont,
        label: "No sections found on this page.",
        ...textStyles.helper,
      })
    );
  } else {
    tocTree.forEach((node, index) => {
      tocFrame.appendChild(renderTOCNode(node, textFont));

      const isLast = index === tocTree.length - 1;

      if (!isLast) {
        tocFrame.appendChild(createSectionDivider());
      }
    });
  }

  figma.currentPage.appendChild(tocFrame);
  focusViewportOnNode(tocFrame);
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
  const childSections = sortSections(section.children.filter(isSectionNode));

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
  return sortSections(figma.currentPage.selection.filter(isSectionNode)).map(
    (section) => buildTOCTree(section, 0)
  );
}

function getSectionPriority(name: string): number {
  const normalizedName = name.toLowerCase();

  if (normalizedName.startsWith("user flow")) {
    return 0;
  }

  if (normalizedName.startsWith("screens")) {
    return 1;
  }

  if (normalizedName.startsWith("components")) {
    return 2;
  }

  return 3;
}

function sortSections(sections: SectionNode[]): SectionNode[] {
  return [...sections].sort((a, b) => {
    const priorityDifference =
      getSectionPriority(a.name) - getSectionPriority(b.name);

    if (priorityDifference !== 0) {
      return priorityDifference;
    }

    return a.name.localeCompare(b.name, undefined, {
      sensitivity: "base",
    });
  });
}

function createSectionDivider(): FrameNode {
  const divider = figma.createFrame();

  divider.resize(1, 3);
  divider.layoutAlign = "STRETCH";
  divider.fills = [
    {
      type: "SOLID",
      color: {
        r: 0.7,
        g: 0.7,
        b: 0.7,
      },
    },
  ];
  divider.strokes = [];

  return divider;
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
    return frameStyles.depth0Group;
  }

  if (depth === 1) {
    return frameStyles.depth1Group;
  }

  if (depth === 2) {
    return frameStyles.depth2Group;
  }

  return frameStyles.depth3Group;
}

function resolveTextStyles(depth: number): TextStyleConfig {
  if (depth === 0) {
    return textStyles.depth1;
  }

  if (depth === 1) {
    return textStyles.depth2;
  }

  return textStyles.depth3;
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

  if (node.children.length > 0) {
    const childGroup = createStyledFrame(frameStyles.depth2Group);

    childGroup.name = `${node.name} Children`;

    node.children.forEach((childNode) => {
      childGroup.appendChild(renderTOCNode(childNode, textFont));
    });

    frame.appendChild(childGroup);
  }

  return frame;
}

function getNodeFrameName(node: TOCNode): string {
  if (node.depth === 0) {
    return `${node.name} Group`;
  }

  if (node.depth === 1) {
    return `${node.name} Nested Group`;
  }

  return `${node.name} Indented Group`;
}

function createLinkedText({
  textFont,
  label,
  targetNodeId,
  fontSize,
  color,
  fontStyle,
}: {
  textFont: FontName;
  label: string;
  targetNodeId?: string;
  fontSize: number;
  color: RGB;
  fontStyle: string;
}) {
  const text = figma.createText();

  text.fontName = {
    family: textFont.family,
    style: fontStyle,
  };
  text.characters = label;
  text.fontSize = fontSize;
  text.fills = [
    {
      type: "SOLID",
      color,
    },
  ];

  if (targetNodeId) {
    text.setRangeHyperlink(0, label.length, {
      type: "NODE",
      value: targetNodeId,
    });
  }

  return text;
}

function black(): RGB {
  return {
    r: 0,
    g: 0,
    b: 0,
  };
}

function muted(): RGB {
  return {
    r: 0.388,
    g: 0.388,
    b: 0.388,
  };
}

function focusViewportOnNode(node: SceneNode) {
  node.x = figma.viewport.center.x;
  node.y = figma.viewport.center.y;
  figma.currentPage.selection = [node];
  figma.viewport.scrollAndZoomIntoView([node]);
}
