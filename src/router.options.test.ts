import { describe, expect, it } from "vitest";
import routerOptions from "./router.options";
import { routes } from "./routes";

describe("router.options", () => {
  it("mengembalikan rute dari src/routes.ts", () => {
    expect((routerOptions as any).routes()).toBe(routes);
  });
});
