import { handleVerify } from './api.js';

export function apiPlugin() {
  return {
    name: 'api-plugin',
    configureServer(server) {
      server.middlewares.use('/api/verify', handleVerify);
    }
  }
}
