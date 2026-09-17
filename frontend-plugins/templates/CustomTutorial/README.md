# CustomTutorial template

## Description

This template is for creating a custom tutorial for the `Metatell`.

## Interface

```tsx
interface CustomTutorialProps {
  showMicrophone: boolean
  showMegaphone: boolean
  showVideo: boolean
  showShare: boolean
  showPlace: boolean
  showReaction: boolean
  showChat: boolean
}
```

These props are used to determine which components should be displayed in the application.
You can use these props to conditionally render the components.

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

Update the package.json file to add metadata about the CustomTutorial. The metadata includes the name, description, and the version of the plugin.

You can update the following fields to the package.json file:

```json
{
  "name": "my-cool-custom-tutorial",
  "version": "0.0.1",
  "description": "A custom tutorial"
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
- component name should be `CustomTutorial`
- component should be placed in `src/CustomTutorial` directory
  - You can change the directory by updating federation config in `vite.config.ts`

### Styling ecosystem

You can use CSS Modules without any additional configuration.

If you want to use different styling systems like styled-components, you can do so by installing the required packages.

