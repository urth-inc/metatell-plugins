# Frontend plugins

This directory contains metatell plugins that run in the browser. They are
Module Federation remotes: the host loads `remoteEntry.js` at runtime and mounts
the exported component at one of the supported extension points. They are
written in TypeScript and React, and are distributed as a `dist/plugin.zip`
archive.

- [`templates`](./templates) contains copyable starter projects for each
  supported plugin type.
- [`examples`](./examples) contains runnable reference implementations for
  specific use cases.

Backend plugins are a different artifact with a different runtime and a separate
registration API. See [`../backend-plugins`](../backend-plugins).
