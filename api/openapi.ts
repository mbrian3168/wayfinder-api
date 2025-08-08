// api/openapi.ts
// Redirects to the static spec produced at /public/openapi.json
export default function handler(_req: any, res: any) {
  res.status(307).setHeader('Location', '/openapi.json').end();
}
