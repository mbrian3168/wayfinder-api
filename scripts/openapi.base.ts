export const openapiBase = {
  openapi: '3.0.3',
  info: {
    title: 'Wayfinder API',
    version: '1.0.0',
    description: 'Generated from controller annotations + Zod schemas',
  },
  servers: [{ url: '/api' }],
  components: {
    securitySchemes: {
      bearerAuth: { type: 'http', scheme: 'bearer', bearerFormat: 'JWT' }
    }
  },
  'x-required-extensions': ['x-visibility', 'x-owner', 'x-sla']
};
