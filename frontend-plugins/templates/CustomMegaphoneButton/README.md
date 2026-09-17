# CustomMegaphoneButton template

## Description

This is a template for creating a CustomMegaphoneButton for `metatell`.

`metatell` has a built-in megaphone button feature that allows users to use megaphone.

You can replace the default megaphone button a custom one by creating a CustomChatButton.

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

The CustomMegaphoneButton should implement the following interface:

```ts
interface CustomMegaphoneButtonProps {
  canMegaphone: boolean;
  temporalMegaphone: boolean;
  isActiveMegaphone: boolean;
  muteMegaphone: () => Promise<void>;
  unmuteMegaphone: () => Promise<void>;
  mySessionId: string | undefined;
  messageDispatch: EventTarget;
  requestMegaphone: () => void;
  grantMegaphone: () => Promise<void>;
  revokeMegaphone: () => Promise<void>;
  approveMegaphoneRequest: (sessionId: string) => void;
}
```

- canMegaphone: A boolean value that indicates whether the user has a megaphone permission or not.
- temporalMegaphone: A boolean value that indicates whether the user has a temporal megaphone permission or not.
- isActiveMegaphone: A boolean value that indicates whether the user is using a megaphone or not.
- muteMegaphone: A function that mutes the megaphone. If canMegaphone is false and temporalMegaphone is false, this function should not be called.
- unmuteMegaphone: A function that unmutes the megaphone. If canMegaphone is false and temporalMegaphone is false, this function should not be called.
- mySessionId: A string value that represents the user's session ID.
- messageDispatch: An EventTarget object that is used to dispatch messages. You can use this object to handle megaphone-related events.
- requestMegaphone: A function that requests a temporal megaphone permission.
- grantMegaphone: A function that grants a temporal megaphone permission. If you call this function, you will have a temporal megaphone permission.
- revokeMegaphone: A function that revokes a temporal megaphone permission. If you call this function, you will lose a temporal megaphone permission.
- approveMegaphoneRequest: A function that approves a megaphone request.

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

Update the package.json file to add metadata about the CustomMegaphoneButton. The metadata includes the name, description, and version of the plugin.

You can update the following fields to the package.json file:

```json
{
  "name": "my-cool-custom-megaphone-button",
  "version": "0.0.1",
  "description": "A custom megaphone button"
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

- do not use default export. export Component as named export
- component name should be `CustomMegaphoneButton`
- component should be placed in `src/CustomMegaphoneButton` directory
  - You can change the directory by updating federation config in `vite.config.ts`

### Styling

You can use CSS Modules without any additional configuration.

If you want to use different styling systems like styled-components, you can do so by installing the required packages.

