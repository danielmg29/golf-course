import { act, cleanup, render, screen, waitFor } from "@testing-library/react";
import { afterEach, beforeEach, expect, test, vi } from "vitest";
import { SceneCanvas } from "@/components/three/SceneCanvas";
import { mountStage } from "@/lib/three";

vi.mock("@/lib/three", () => ({ mountStage: vi.fn() }));

const setup = () => {};
const load = async () => ({ default: setup });
const mount = vi.mocked(mountStage);

beforeEach(() => {
  mount.mockReset();
});

afterEach(() => {
  cleanup();
  vi.restoreAllMocks();
});

test("mounts the scene and tears it down on unmount", async () => {
  const teardown = vi.fn();
  mount.mockReturnValue(teardown);

  const { unmount } = render(<SceneCanvas load={load} label="A scene" />);
  await waitFor(() => expect(mount).toHaveBeenCalledOnce());

  expect(mount.mock.calls[0][0]).toBe(screen.getByRole("img", { name: "A scene" }));
  expect(mount.mock.calls[0][1]).toBe(setup);

  unmount();
  expect(teardown).toHaveBeenCalledOnce();
});

test("shows the fallback when WebGL is unavailable", async () => {
  vi.spyOn(console, "error").mockImplementation(() => {});
  mount.mockImplementation(() => {
    throw new Error("Error creating WebGL context.");
  });

  render(<SceneCanvas load={load} label="A scene" fallback={<p>No 3D here</p>} />);

  expect(await screen.findByText("No 3D here")).toBeDefined();
});

test("never mounts a scene that was unmounted while still loading", async () => {
  let finishLoading: (scene: { default: typeof setup }) => void = () => {};
  const slowLoad = () => new Promise<{ default: typeof setup }>((resolve) => (finishLoading = resolve));

  const { unmount } = render(<SceneCanvas load={slowLoad} label="A scene" />);
  unmount();

  await act(async () => {
    finishLoading({ default: setup });
    await import("@/lib/three");
  });

  expect(mount).not.toHaveBeenCalled();
});
