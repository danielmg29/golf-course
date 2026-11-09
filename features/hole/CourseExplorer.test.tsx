import { act, cleanup, fireEvent, render, screen, within } from "@testing-library/react";
import { afterEach, expect, test, vi } from "vitest";
import { CourseExplorer } from "@/features/hole/CourseExplorer";
import { mapController } from "@/features/hole/courseLayout";
import type { Hole } from "@/lib/generated/schema";

vi.mock("@/components/three/SceneCanvas", () => ({
  SceneCanvas: () => <div data-testid="map" />,
}));

const farReach: Hole = { id: 7, number: 7, name: "Far Reach", par: 5, yards: 555, strokeIndex: 3 };
const TIP = /Three good shots/;

// Uses the strip of numbers under the map. The labels on the map stay hidden until the 3D
// scene places them, and the strip is what works without WebGL.
const pickHoleSeven = () =>
  act(async () => {
    const strip = screen.getByRole("group", { name: "Choose a hole" });
    fireEvent.click(within(strip).getByRole("button", { name: "Hole 7" }));
  });

const renderExplorer = (holes: Promise<Hole[]>) =>
  act(async () => {
    render(<CourseExplorer holes={holes} />);
  });

afterEach(() => {
  cleanup();
  mapController.selected = null;
});

test("the map and the pro tip don't wait for the database", async () => {
  await renderExplorer(new Promise(() => {}));
  expect(screen.getByTestId("map")).toBeDefined();

  await pickHoleSeven();

  expect(screen.getAllByText(TIP).length).toBeGreaterThan(0);
  expect(screen.getAllByText("–").length).toBeGreaterThan(0);
  expect(screen.queryByText("Far Reach")).toBeNull();
});

test("the name and numbers fill in once the data arrives", async () => {
  let finishRead: (holes: Hole[]) => void = () => {};
  await renderExplorer(new Promise((resolve) => (finishRead = resolve)));
  await pickHoleSeven();

  await act(async () => finishRead([farReach]));

  expect(screen.getAllByText("Far Reach").length).toBeGreaterThan(0);
  expect(screen.getAllByText("555").length).toBeGreaterThan(0);
  expect(screen.queryByText("–")).toBeNull();
});

test("a failed read still leaves a usable panel", async () => {
  await renderExplorer(Promise.resolve([]));
  await pickHoleSeven();

  expect(screen.getAllByText(TIP).length).toBeGreaterThan(0);
  expect(screen.queryByText("–")).toBeNull();
  expect(screen.queryByText("Par")).toBeNull();
});
