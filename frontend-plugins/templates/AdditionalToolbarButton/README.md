# AdditionalToolbarButton template

## Description

This is a minimal template for creating an additional toolbar button for metatell.
The exported component renders one native button. It shows an alert by default
so that the click behavior can be verified after installing the plugin. Pass
`label` and `onClick` to customize its text and behavior.

## Pre-requisites

- Node.js 24 (We recommend using volta to manage node versions)

## npm scripts

- `npm run dev`: Start the development server
- `npm run build`: Build the project
- `npm run preview`: Preview the production build locally
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

Update the package.json file to add metadata about the additional toolbar button. The metadata includes the name, description, and icon of the additional toolbar button.

You can update the following fields to the package.json file:

```json
{
  "name": "my-cool-toolbar-button",
  "version": "0.0.1",
  "description": "An additional toolbar button"
}
```

4. Build the project

Run the following command to build the project:

```
npm run build
```

You can find the built files in the `dist` directory.

5. Publish the project

You can upload the plugin from metatell-admin dashborad.

## Tips

### Restrictions

- Do not use default export. export Component as named export
- Component name should be `AdditionalToolbarButton`
- component should be placed in `src/AdditionalToolbarButton` directory
  - You can change the directory to update federation config in `vite.config.ts`

### Styling

You can use CSS Modules without any additional configuration.

If you want to use different styling systems like styled-components, you can do so by installing the required packages.
