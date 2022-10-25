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

### Development

```
pnpm build:lint
```

Now link "dist/index.js" in relevant dependencies.

### Test

Create a GitHub token with `repo` and `project` scope. Write to `.env`:

```properties
GITHUB_USER="USERNAME"
GITHUB_REPO="TEST_REPOSITORY"
GITHUB_TOKEN="TEST_USER_TOKEN"
```

```
pnpm test
```

### Publish

```
pnpm build:publish
```
