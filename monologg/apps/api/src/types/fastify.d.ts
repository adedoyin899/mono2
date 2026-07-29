import type { AccessTokenPayload } from "../services/auth.js";

declare module "fastify" {
  interface FastifyRequest {
    user?: AccessTokenPayload;
  }
}
