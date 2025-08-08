# Endpoint Visibility Annotations

Add a JSDoc tag above each route handler:

/**
 * @visibility public
 * Description: Health endpoint.
 */

Allowed values: `public | partner | internal`.

The CI check fails if any controller file has exported handlers without an `@visibility` tag.
