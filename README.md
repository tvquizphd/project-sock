## Socket connection for GitHub Projects 

### Basic Usage

Add new private user project with custom item. 

```js
import { toProject } from "project-sock";
(async () => {
  const project = await toProject({
    owner: "GITHUB_USERNAME",
    title: "PROJECT TITLE",
    token: "GITHUB_TOKEN"
  });
  const title = "PROJECT ITEM";
  const body = "## CUSTOM MARKDOWN";
  await project.addItem(title, body);
})();
```

If a project with "PROJECT TITLE" exists, it will be reused.

### Install

```
pnpm install
```

### Lint

```
pnpm lint
```

Or, run `pnpm build:lint`.

### Publish

```
pnpm build:publish
```
