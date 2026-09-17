# Templates

This directory contains copyable starter projects for each supported metatell
plugin type.

- [AdditionalToolbarButton](./AdditionalToolbarButton/README.md): Add a toolbar
  button.
- [CustomChatButton](./CustomChatButton/README.md): Replace the chat button and
  modal.
- [CustomEntryPanel](./CustomEntryPanel/README.md): Replace the room entry panel.
- [CustomExitScreen](./CustomExitScreen/README.md): Replace the room exit screen.
- [CustomLeaveButton](./CustomLeaveButton/README.md): Replace the leave button
  and modal.
- [CustomMegaphoneButton](./CustomMegaphoneButton/README.md): Replace the
  megaphone button.
- [CustomNearestUserProfile](./CustomNearestUserProfile/README.md): Replace the
  nearest-user profile UI.
- [CustomOverlay](./CustomOverlay/README.md): Add a custom overlay.
- [CustomProfileModal](./CustomProfileModal/README.md): Replace the profile
  modal.
- [CustomTutorial](./CustomTutorial/README.md): Add a custom tutorial.
- [CustomWebCameraButton](./CustomWebCameraButton/README.md): Replace the web
  camera button and popup.

## Start from a template

Clone this repository and copy the template that matches the plugin type you
want to implement. For example:

```bash
git clone git@github.com:urth-inc/metatell-plugins.git
cp -R metatell-plugins/frontend-plugins/templates/AdditionalToolbarButton /path/to/your/plugin
cd /path/to/your/plugin
git init
git add .
git commit -m "Initial commit"
```

Each template README describes its interface and development workflow.

## Develop locally

Run commands from the selected template directory:

```bash
cd frontend-plugins/templates/AdditionalToolbarButton
npm install
npm run dev
```

Template development servers use `http://localhost:3004` by default. Running
`npm run dev` or `npm run build` generates a new plugin version ID in
`.uuid.env`.

Use the template's build command to create the upload artifact:

```bash
npm run build
```

The generated plugin archive is written to `dist/plugin.zip`.
