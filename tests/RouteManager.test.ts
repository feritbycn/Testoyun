import { describe, expect, it } from "vitest";
import { RouteManager, ROUTES } from "../src/systems/RouteManager";
describe("RouteManager", () => {
  it("selects only known routes", () => {
    const routes = new RouteManager();
    routes.select("capital");
    expect(routes.currentRouteId).toBe("capital");
    routes.select("not-real");
    expect(routes.currentRouteId).toBe("capital");
  });
  it("tracks completed trips", () => {
    const routes = new RouteManager();
    routes.markCompleted(ROUTES[0].id);
    expect(routes.totalCompleted).toBe(1);
    expect(routes.completed).toContain(ROUTES[0].id);
  });
});