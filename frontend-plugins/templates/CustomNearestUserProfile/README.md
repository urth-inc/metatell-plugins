# CustomNearestUserProfile template

## Description

This template is for creating a custom NearestUserProfile for Metatell.

The NearestUserProfile feature displays the closest user profile based on the user's location.

The default NearestUserProfile looks like this:

![Default NearestUserProfile](./images/default-nearest-user-profile.png)

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

## Interfaces

The CustomProfileModal should implement the following interface:

```ts
export type User = {
  sessionId: string;
  displayName: string;
  avatarThumbnailUrl: string;
  biography: string;
  distance: number;
};
```

```ts
interface CustomNearestUserProfileProps {
    user: User | undefined
}
```

- `user`: The user object that contains the user's information.

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

Update the package.json file to add metadata about the nearestUserProfile. The metadata includes the name, version, and description of the nearestUserProfile plugin.

You can update the following fields to the package.json file:

```json
{
  "name": "my-cool-nearest-user-profile",
  "version": "0.0.1",
  "description": "A custom nearest user profile for metatell"
}
```

4. Build the project

Run the following command to build the project:

```
npm run build
```

You can find the built files in the `dist` directory.

5. Publish the project

You can upload the plugin from `metatell-admin` dashborad.

## Tips

### Restrictions

- Do not use default export. export Component as named export
- Component name should be `CustomNearestUserProfile`
- component should be placed in `src/CustomNearestUserProfile` directory
  - You can change the directory to update federation config in `vite.config.ts`

### Styling

You can use CSS Modules without any additional configuration.

If you want to use different styling systems like styled-components, you can do so by installing the required packages.

