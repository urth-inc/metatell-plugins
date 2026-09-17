# Plugin package contract

Read this before changing the build pipeline, diagnosing upload failures, or
handing off a release zip.

## Supported plugin types

The public
[plugin templates](https://github.com/urth-inc/metatell-plugins/tree/develop/frontend-plugins/templates)
provide these supported extension types:

```text
AdditionalToolbarButton
CustomChatButton
CustomEntryPanel
CustomExitScreen
CustomLeaveButton
CustomMegaphoneButton
CustomNearestUserProfile
CustomOverlay
CustomProfileModal
CustomTutorial
CustomWebCameraButton
```

Each template exposes and records its extension type, uses port 3004 with the
required development CORS header, and shares React and ReactDOM as singletons.

## Required metadata

The generated `metadata.json` contains these fields:

| Field | Requirement |
| --- | --- |
| `metadata.name` | Non-empty string |
| `metadata.type` | One of the supported extension types above |
| `metadata.description` | String |
| `metadata.version` | Non-empty string |
| `metadata.versionId` | Build-generated identifier |

Use the bundled validator to check the package structure before upload. Follow
the administration interface for any additional upload requirements.

## One identity across the build

The templates establish this release-time sequence:

- `scripts/set_uuid.js` generates `app_` followed by a UUID v4 without hyphens.
- `vite.config.ts` uses that value as the Module Federation container name.
- `scripts/add_metadata.js` writes the same value to
  `metadata.json.versionId`.
- `mf-manifest.json` identifies the container with that value.

Required shape:

```text
^app_[0-9a-f]{32}$
```

The generated metadata and Module Federation output must use the same
`versionId`. Changing only `metadata.json` makes the artifact inconsistent.
Always generate the ID before the bundler runs and rebuild all release files
together.

## Module Federation contract

For the selected `<type>`:

- emit `remoteEntry.js` at the archive root;
- emit `mf-manifest.json` at the archive root;
- set the manifest and container `id` and `name` to the release `versionId`;
- include an expose named `./<type>`;
- share React and ReactDOM as singletons, using the versions declared in
  `package.json`;
- use a relocatable public path; and
- when the selected template configures CSS Modules, preserve its
  `versionId`-based hash salt.

Read the copied template's `package.json` instead of hard-coding dependency
versions.

## Zip layout and naming

Archive the contents of `dist` at the zip root:

```text
remoteEntry.js
mf-manifest.json
metadata.json
assets/...
```

Do not wrap those files in a top-level `dist/` directory. The template's archive
script excludes the generated `plugin.zip` from itself. Use
`<name>-v<version>-plugin.zip` when handing off a release artifact.

## Public references

- [Plugin templates](https://github.com/urth-inc/metatell-plugins/tree/develop/frontend-plugins/templates)
- [Plugin examples](https://github.com/urth-inc/metatell-plugins/tree/develop/frontend-plugins/examples)
- [metatell documentation](https://docs.metatell.io/)
