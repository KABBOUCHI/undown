import { defineComponent, h } from "vue";
import type { FunctionalComponent, DefineComponent, PropType } from "vue";
import * as htmlparser from "htmlparser2";
import MarkdownIt, { type PluginSimple } from "markdown-it";
import type { VNode } from "vue";
import { Node, Element, DataNode } from "domhandler";

export type MarkdownPlugin = [PluginSimple, any] | PluginSimple;
export type MarkdownComponent =
  | FunctionalComponent<any>
  | DefineComponent<any, any, any>;
export type MarkdownComponents = Record<string, MarkdownComponent>;

export const Markdown = defineComponent({
  props: {
    content: {
      type: String,
      required: true,
    },
    components: {
      type: Object as PropType<MarkdownComponents>,
      default: () => ({}),
    },
    plugins: {
      type: Array as PropType<MarkdownPlugin[]>,
      default: () => [],
    },
  },
  setup(props) {
    const md = new MarkdownIt({
      html: true,
      linkify: true,
      typographer: true,
    });

    for (const plugin of props.plugins) {
      if (Array.isArray(plugin)) {
        md.use(plugin[0], plugin[1]);
      } else {
        md.use(plugin as any);
      }
    }
    const mapElement = (
      node: Node,
      index: number,
    ): VNode | string | null | undefined => {
      if (node.type === "tag" && node instanceof Element) {
        const elementType = props.components[node.name] || node.name;
        const attrs: Record<string, any> = { key: index, ...node.attribs };

        // if (typeof attrs.style === "string") {
        //   const styles: Record<string, any> = {};
        //   for (const style of attrs.style.split(";")) {
        //     if (style.includes(":")) {
        //       let [key, value] = style.split(":");
        //       if (key && value) {
        //         key = key
        //           .trim()
        //           .replace(/-([a-z])/g, (match) => match[1].toUpperCase());
        //         value = value.trim();
        //         styles[key] = value;
        //       }
        //     }
        //   }
        //   attrs.style = styles;
        // }

        const children = skipAnyChildrenFor.has(node.name)
          ? undefined
          : skipWhitespaceElementsFor.has(node.name)
            ? node.children
                .filter((n) => filterWhitespaceElements(n))
                .map((n, index) => mapElement(n, index))
            : node.children.map((n, index) => mapElement(n, index));

        return h(elementType, attrs, children);
      } else if (node.type === "text" && node instanceof DataNode) {
        return node.data;
      } else if (node.type === "comment") {
        return undefined; // noop
      } else if (node.type === "style" && node instanceof Element) {
        const attrs: Record<string, any> = { key: index, ...node.attribs };
        const children = node.children.map((n, index) => mapElement(n, index));
        return h("style", attrs, children);
      } else {
        console.warn(
          `Warning: Could not map element with type "${node.type}".`,
          node,
        );
        return undefined;
      }
    };

    return () => {
      const html = md.render(props.content);

      const root = htmlparser.parseDOM(html, {
        // Don't change the case of parsed html tags to match inline components.
        lowerCaseTags: false,
        // Don't change the attribute names so that stuff like `className` works correctly.
        lowerCaseAttributeNames: false,
        // Encode entities automatically, so that &copy; and &uuml; works correctly.
        decodeEntities: true,
        // Fix issue with content after a self closing tag.
        recognizeSelfClosing: true,
      });

      return h(
        "div",
        {},
        root.map((n, i) => mapElement(n, i)),
      );
    };
  },
});

const skipAnyChildrenFor = new Set([
  "area",
  "br",
  "col",
  "embed",
  "hr",
  "img",
  "input",
  "keygen",
  "param",
  "source",
  "track",
  "wbr",
]);
const skipWhitespaceElementsFor = new Set(["table", "thead", "tbody", "tr"]);

function filterWhitespaceElements(node: Node) {
  return node.type === "text" && node instanceof DataNode
    ? node.data.trim().length > 0
    : true;
}
