# Runtime integration

Read this when a plugin must interact with the room, the public SDK,
Spoke-authored events, or an external API.

## Prefer documented integration points

Use this order:

1. the selected plugin type's documented React extension point;
2. the public `@urth/metatell-sdk` API; and
3. a documented Spoke JS Call Event for scene-authored interaction.

The public SDK includes APIs for objects, input, triggers, metrics, and plugin
authentication. Confirm each signature in the
[Web SDK reference](https://sdk.metatell.io/web) or in the installed SDK version
before coding. Do not invent an API when documentation is unavailable.

## Spoke JS Call Events

The public
[password collection example](https://github.com/urth-inc/metatell-plugins/tree/develop/frontend-plugins/examples/password-collection-modal)
shows Active and Passive Trigger responses that dispatch JS Call Events. Each
response provides:

- `event`: the browser event name; and
- `detail`: the event payload.

Listen for the event on `window`, validate `CustomEvent.detail` before using it,
and remove the listener during cleanup. Scene trigger and response wiring should
stay in the `.spoke` scene.

A JS Call Event delivers scene-authored input to the local plugin. Do not claim
that arbitrary plugin state is synchronized unless a documented API provides
that behavior.

## External API authentication

Use the public
[external API authentication example](https://github.com/urth-inc/metatell-plugins/tree/develop/frontend-plugins/examples/external-api-auth)
as the starting point:

1. Call `getPluginApiToken(clientId)` from `@urth/metatell-sdk/auth`.
2. Send the token to the intended external service as an
   `Authorization: Bearer <token>` header.
3. Validate the token before trusting its subject.

Keep signing keys and service credentials out of browser code. Use HTTPS,
validate token expiry and claims, restrict allowed origins, bound failures, and
avoid logging tokens. The token API is available in a supported metatell room,
not on a standalone plugin development page.

See the public
[external API authentication documentation](https://docs.metatell.io/docs/developer-docs/plugins/external-api-auth/)
for the current setup requirements.

## Undocumented host surfaces

Do not depend on undocumented host globals by default. If a requested feature
cannot be implemented through the public extension points, SDK, or documented
events, explain that limitation first. When the user explicitly accepts the
risk, isolate the dependency, feature-detect it, provide a safe failure path,
clean up resources on unmount, and retest after client upgrades.
