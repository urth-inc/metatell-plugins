# CustomEntryPanel template

## Description

This is a template for creating a CustomEntryPanel for `metatell`.

`metatell` has a built-in entry panel that allows users to join a room, enter with a VR headset, spectate, and access room settings. You can replace the default entry panel with a custom entry panel by creating a CustomEntryPanel.

The default entry panel looks like this:

<p align="center">
  <img src="./docs/entry-panel.png" alt="default entry panel" width="800"/>
</p>

You can replace the default entry panel with a custom entry panel that matches your branding or design requirements.

## Pre-requisites

- Node.js 24 (We recommend using volta to manage node versions)

## npm scripts

- `npm run dev`: Start the development server
- `npm run build`: Build the project
- `npm run preview`: Preview the production build locally
- `npm run test`: Run unit tests (vitest)
- `npm run lint`: Run all lint check
- `npm run lint:tsc`: Run code check based on tsc
- `npm run lint:biome`: Run code check based on biome
- `npm run lint-fix`: Run code fix based on biome

## Interfaces

The custom entry panel should implement the following interface:

```ts
interface CustomEntryPanelProps {
  roomName: string | undefined;
  logoUrl: string | undefined;
  showJoinRoom: boolean;
  isRoomFull: boolean;
  onJoinRoom: () => void;
  showEnterOnDevice: boolean;
  onEnterOnDevice: () => void;
  showSpectate: boolean;
  onSpectate: () => void;
  showOptions: boolean;
  onOptions: () => void;
  leftImage: React.ReactNode;
  rightImage: React.ReactNode;
  leftMessage: string;
  rightMessage: string;
  termsOfServiceUrl: string | undefined;
  privacyPolicyUrl: string | undefined;
}
```

- `roomName`: The name of the room.
- `logoUrl`: The URL of the logo image.
- `showJoinRoom`: A boolean value that controls whether to display the "Join Room" button.
- `isRoomFull`: A boolean value indicating whether the room is full.
- `onJoinRoom`: A function that is executed when the "Join Room" button is clicked.
- `showEnterOnDevice`: A boolean value that controls whether to display the "Enter with VR Headset" button.
- `showSpectate`: A boolean value that controls whether to display the "Join Tour" button.
- `onSpectate`: A function that is executed when the "Join Tour" button is displayed.
- `showOptions`: A boolean value that controls whether to display the "Room Settings" button.
- `onShowOptions`: A function that is executed when the "Room Settings" button is clicked.
- `leftImage`: The image element displayed on the left side of the screen.
- `rightImage`: The image element displayed on the right side of the screen.
- `leftMessage`: The string displayed on the left side of the screen.
- `rightMessage`: The string displayed on the right side of the screen.
- `termsOfServiceUrl`: A string representing the URL link to the terms of service.
- `privacyPolicyUrl`: A string representing the URL link to the privacy policy.

## How to develop

1. Install dependencies

install the dependencies by running the following command:

```
npm install
```

2. Run the development server

Run the following command to start the development server:

the development server will start at http://localhost:3004

```
npm run dev
```

3. update package.json to add metadata

Update the package.json file to add metadata about the CustomEntryPanel. The metadata includes the name, description, and the version of plugin.

You can update the following fields to the package.json file:

```json
{
  "name": "my-cool-custom-entry-panel",
  "version": "0.0.1",
  "description": "A custom entry panel for metatell",
}
```

4. Build the project

Run the following command to build the project:

```
npm run build
```

You can find the built files in the `dist` directory.

5. Publish the project

You can upload the plugin from `metatell-admin` dashboard.

## Tips

### Restrictions

- Do not use default export. export Component as named export
- Component name should be `CustomEntryPanel`
- component should be placed in `src/CustomEntryPanel` directory
  - You can change the directory to update federation config in `vite.config.ts`

### Styling

You can use CSS Modules without any additional configuration.

If you want to use different styling systems like styled-components, you can do so by installing the required packages.

