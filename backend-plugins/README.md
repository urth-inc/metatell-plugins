# Backend plugins

This directory is for metatell plugins that run on the server as Cloudflare
Workers, deployed into a Workers for Platforms dispatch namespace. A request
reaches them through the platform dispatcher, not through a route of their own.

> **Status:** backend plugin support is under development. This directory is a
> placeholder: the templates and examples, along with the package format and the
> registration flow, are added in a later change.

Backend plugins share nothing with the frontend plugins under
[`../frontend-plugins`](../frontend-plugins) except the word "plugin". Those are
Module Federation remotes loaded by the browser at runtime; these are bundled
Workers. The build output, the deployment target, and the registration API
(`/client/api/v1/backend-plugins` rather than `/client/api/v1/plugins`) are all
different. Do not copy a build pipeline from one side to the other.

That is why the two kinds are kept apart at the repository root rather than
sharing a single `templates` and `examples` pair.
