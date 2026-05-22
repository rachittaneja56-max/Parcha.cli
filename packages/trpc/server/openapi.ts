import { generateOpenApiDocument } from "trpc-to-openapi";
import { serverRouter } from "./index";

export const openApiDocument = generateOpenApiDocument(serverRouter, {
  title: "Parcha.cli API",
  version: "1.0.0",
  baseUrl: "http://localhost:8000/api",
  securitySchemes: {
    BearerAuth: {
      type: "http",
      scheme: "bearer",
      bearerFormat: "JWT",
    },
  },
});
