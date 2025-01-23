# undown

[![npm version](https://img.shields.io/npm/v/undown?color=yellow)](https://npmjs.com/package/undown)
[![npm downloads](https://img.shields.io/npm/dm/undown?color=yellow)](https://npm.chart.dev/undown)

Markdown component for Vue.

## Usage

Install package:

```sh
# npm
npm install undown

# yarn
yarn add undown

# pnpm
pnpm install undown
```

Basic usage:

```vue
<script setup lang="tsx">
import { Markdown } from "undown";

const content = "# Hello, World!";
</script>

<template>
  <Markdown :content />
</template>
```

With plugins:

```vue
<script setup lang="tsx">
import { Markdown } from "undown";
import type { MarkdownPlugin } from "undown";
import { alert } from "@mdit/plugin-alert";
import { tasklist } from "@mdit/plugin-tasklist";

const content = "# Hello, World!";
const plugins: MarkdownPlugin[] = [
  alert,
  [
    tasklist,
    {
      // your options, optional
    },
  ],
];
</script>

<template>
  <Markdown :content :plugins />
</template>
```

With components:

```vue
<script setup lang="tsx">
import { defineComponent } from "vue";
import { Markdown } from "undown";
import type { MarkdownPlugin, MarkdownComponents } from "undown";
import { alert } from "@mdit/plugin-alert";
import { tasklist } from "@mdit/plugin-tasklist";

const content = `# Hello, World!

\`\`\`js
console.log("Hello, World!");
\`\`\`

<Counter />`;
const components: MarkdownComponents = {
  pre: (_props, { slots }) => {
    return h("pre", slots.default?.());
  },
  h1: (props, { slots }) => {
    return (
      <h1 class="text-3xl font-semibold mt-6 mb-2" {...props}>
        {slots.default?.()}
      </h1>
    );
  },
  Counter: defineComponent({
    setup() {
      const count = ref(0);
      return () => h("button", { onClick: () => count.value++ }, count.value);
    },
  }),
};
</script>

<template>
  <Markdown :content :components />
</template>
```

## License

Published under the [MIT](https://github.com/KABBOUCHI/undown/blob/main/LICENSE) license.
Made by [community](https://github.com/KABBOUCHI/undown/graphs/contributors) 💛
