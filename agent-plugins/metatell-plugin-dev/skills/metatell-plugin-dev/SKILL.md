---
name: metatell-plugin-dev
description: >-
  Design, implement, build, validate, package, upload, and apply metatell client
  plugins based on Module Federation, including CustomOverlay — for requests
  such as building a metatell plugin, implementing a CustomOverlay, validating
  a plugin zip, or troubleshooting a versionId error. Not for editing `.spoke`
  scenes, optimizing 3D assets, building MCP servers, or building AI NPCs.
---

# metatell Client Plugin Development

Build the plugin from this repository's canonical `frontend-plugins/templates/` directory,
preserve the Module Federation identity contract, validate the exact upload
artifact, and stop there by default. Upload or apply it to a room only when the
user explicitly requests that action. Do not improvise a generic React
micro-frontend format.

## Start here

1. Choose exactly one host extension type from the table below.
2. Copy that directory from
   [`urth-inc/metatell-plugins/frontend-plugins/templates`](https://github.com/urth-inc/metatell-plugins/tree/develop/frontend-plugins/templates)
   and keep its build pipeline until there is a concrete reason to replace it.
3. Set the package `name`, `version`, and `description`; implement the exported
   component whose name matches the selected type.

| Type | Host extension point |
| --- | --- |
| `CustomChatButton` | Chat button and associated UI |
| `CustomMegaphoneButton` | Megaphone button |
| `CustomEntryPanel` | Room entry panel |
| `CustomLeaveButton` | Leave button |
| `CustomOverlay` | In-room overlay |
| `CustomProfileModal` | Profile modal |
| `AdditionalToolbarButton` | Additional toolbar button |
| `CustomWebCameraButton` | Web-camera button |
| `CustomNearestUserProfile` | Nearest-user profile UI |
| `CustomTutorial` | Tutorial UI |
| `CustomExitScreen` | Exit screen |

Read [references/package-contract.md](references/package-contract.md) when
choosing a type, changing the build, diagnosing `versionId`, or preparing a zip.

## Implement in this order

1. Use the selected public host extension point.
2. Search `@urth/metatell-sdk` for the needed operation. Its main surfaces cover
   objects, input, triggers, metrics, and plugin API authentication.
3. For room-authored interaction, receive a Spoke Active/Passive Trigger **JS
   Call Event** through its `event` name and `detail` payload. Keep the actual
   trigger and response wiring in the `.spoke` scene.
4. If the documented extension points are insufficient, explain the limitation
   before relying on an undocumented host surface. Treat any such integration
   as unstable and keep it isolated behind a feature-detected adapter.

Do not describe local state changes as synchronized behavior unless the public
SDK documents that behavior. For SDK areas, Spoke events, and external API
authentication, read
[references/runtime-integration.md](references/runtime-integration.md).

## Build and package

In an unmodified current template, `npm run build` performs the release chain:

1. mint a fresh `app_` + hyphenless UUID v4 `versionId`;
2. run the Vite Module Federation build with that value as the container name;
3. add `dist/metadata.json` with the same value; and
4. create `dist/plugin.zip` from the contents of `dist`.

Never edit only `metadata.json`. The same fresh value must be embedded in the
Module Federation manifest/container, so a changed `versionId` requires a full
rebuild. Increment the package `version` for every uploaded release as well.

If replacing Vite with webpack and `@module-federation/enhanced`, preserve all
equivalent requirements:

- mint one fresh `versionId` before every build and pass it to the bundler;
- set Module Federation `name` to that value, emit `remoteEntry.js` and
  `mf-manifest.json`, and expose `./<type>`;
- keep `publicPath: "auto"` (or an equivalent relocatable asset base);
- share `react` and `react-dom` as singletons with `requiredVersion` taken from
  `package.json` (the current template uses the React 18.3.1 line);
- when CSS Modules are used, salt their class hashes with `versionId` to avoid
  cross-plugin clashes;
- generate `metadata.json` after the bundler succeeds, then archive the **files
  inside** `dist`, not the `dist` directory itself; and
- emit `<name>-v<version>-plugin.zip` for a release artifact (the generated
  `plugin.zip` may be renamed on handoff).

## Validate the artifact

Run the bundled zero-dependency validator against the exact directory or zip to
be uploaded:

```bash
node <skill>/scripts/validate-plugin-package.mjs path/to/dist
node <skill>/scripts/validate-plugin-package.mjs path/to/name-v1.2.3-plugin.zip
node <skill>/scripts/validate-plugin-package.mjs --json path/to/dist
```

Fix every error before upload. Warnings remain exit code 0 but require review,
especially missing React singleton evidence and source maps. The validator does
not prove that the remote executes in a metatell room.

## Local development

Follow the copied template's README and development-server configuration. Keep
its port and CORS settings unless the public integration instructions require a
change. Test the result in a suitable metatell room before publishing it.

## Upload and apply

Only continue with this section when the user explicitly requests an upload or
room application. Confirm the target and authorization immediately before
changing external state.

1. Validate the final zip.
2. In the metatell administration interface, create the plugin or add a new
   version and upload the zip and any other required assets.
3. Activate/apply that version to the target room.
4. Enter or reload the room and verify rendering, interaction, console/network
   errors, asset URLs, cleanup on unmount, and the intended user permissions.
5. For a new release, increment `version` and rebuild to mint a new `versionId`.

## Troubleshooting

| Symptom | Likely cause | Action |
| --- | --- | --- |
| Plugin is not loaded | Wrong expose/type, missing root files, or `versionId` mismatch | Validate the zip; compare metadata `type` and `versionId` with manifest `exposes`, `id`, and `name`; rebuild rather than hand-editing. |
| Upload error | Invalid metadata, missing root files, or a nested `dist/` directory | Run the validator on the upload zip, fix the reported errors, rebuild, and repackage. |
| Styles collide with the host/another plugin | Global CSS or unscoped CSS Module names | Keep styles local; when the selected template uses `versionId`-salted class names, retain that configuration. |
| React loads twice or hooks fail | React or ReactDOM is bundled as a non-singleton/incompatible share | Configure both as `singleton: true` with package-derived `requiredVersion`; rebuild. |
| Package is unexpectedly large | Large assets or source maps are included | Remove source maps and unneeded files, and optimize large assets. |
| Local development fails with CORS/network errors | The development server does not match the template configuration | Restore the copied template's development-server settings and confirm that `remoteEntry.js` is available. |

## Sources and limits

Use these public sources for current API details and examples:

- [metatell documentation](https://docs.metatell.io/)
- [metatell Web SDK](https://sdk.metatell.io/web)
- [`@urth/metatell-sdk` on npm](https://www.npmjs.com/package/@urth/metatell-sdk)
- [metatell plugin templates](https://github.com/urth-inc/metatell-plugins/tree/develop/frontend-plugins/templates)
- [metatell plugin examples](https://github.com/urth-inc/metatell-plugins/tree/develop/frontend-plugins/examples)

Do not infer undocumented APIs from these URLs when they cannot be accessed.
