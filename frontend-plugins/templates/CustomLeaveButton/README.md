# CustomLeaveButton template

## Description

This is a template for creating a CustomLeaveButton for `metatell`.

`metatell` has a built-in leave button feature that opens a modal when the user clicks the leave button. The leave button is located at the second right side of the toolbar.
The default leave button looks like this:

<p align="center">
  <img src="./docs/toolbar.png" alt="default leave button" />
</p>

When the leave button is clicked, the leave modal is displayed:
Default leave modal looks like this:

<p align="center">
  <img src="./docs/leave-modal.png" alt="default leave modal" />
</p>

You can replace the default leave button and modal with a custom one by creating a CustomChatButton.

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

## Interface

The custom leave button should implement the following interface:

```ts
interface CustomLeaveButtonProps {
  showDefaultModal: () => void;
  destinationUrl: string;
}
```

- `showDefaultModal`: A function that opens the metatell's default leave modal. If you want to use custom leave modal, you don't need to use this function.
- `destinationUrl`: The destination URL to navigate to when the user clicks the leave button.

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

Update the package.json file to add metadata about the custom leave button. The metadata includes the name, description, and version of the plugin.

You can update the following fields to the package.json file:

```json
{
  "name": "my-cool-custom-leave-button",
  "version": "0.0.1",
  "description": "A custom LeaveButton"
}
```

4. Build the project

Run the following command to build the project:

```
npm run build
```

You can find the built files in the `dist` directory.

5. Publish the project

You can upload the plugin from metatell-admin dashboard.

## Tips

### Restrictions

- do not use default export. export Component as named export
- component name should be `CustomLeaveButton`
- component should be placed in `src/CustomLeaveButton` directory
  - You can change the directory to update federation config in `vite.config.ts`

### Styling

You can use CSS Modules without any additional configuration.

If you want to use different styling systems like styled-components, you can do so by installing the required packages.

