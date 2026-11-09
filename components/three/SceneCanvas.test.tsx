import { act, cleanup, render, screen, waitFor } from "@testing-library/react";
import { afterEach, beforeEach, expect, test, vi } from "vitest";
import { SceneCanvas } from "@/components/three/SceneCanvas";
import { mountStage } from "@/lib/three";

vi.mock("@/lib/three", () => ({ mountStage: vi.fn() }));

const setup = () => {};
const load = async () => ({ default: setup });
const mount = vi.mocked(mountStage);

// jsdom has no IntersectionObserver. This one reports the canvas as on screen at once, so
// the scene starts loading straight away, as it does when the canvas is near the viewport.
class OnScreen {
  constructor(private readonly callback: IntersectionObserverCallback) {}
  observe(target: Element) {
    this.callback([{ isIntersecting: true, target } as IntersectionObserverEntry], this as unknown as IntersectionObserver);
  }
  disconnect() {}
  unobserve() {}
  takeRecords() {
    return [];
  }
}

beforeEach(() => {
  mount.mockReset();
  vi.stubGlobal("IntersectionObserver", OnScreen);
});

afterEach(() => {
  cleanup();
  vi.restoreAllMocks();
  vi.unstubAllGlobals();
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

test("waits to load the scene until the canvas comes near the screen", async () => {
  let reveal: () => void = () => {};
  vi.stubGlobal(
    "IntersectionObserver",
    class {
      constructor(callback: IntersectionObserverCallback) {
        reveal = () => callback([{ isIntersecting: true } as IntersectionObserverEntry], this as unknown as IntersectionObserver);
      }
      observe() {}
      disconnect() {}
      unobserve() {}
      takeRecords() {
        return [];
      }
    },
  );
  const watchedLoad = vi.fn(load);

  render(<SceneCanvas load={watchedLoad} label="A scene" />);
  expect(watchedLoad).not.toHaveBeenCalled();

  act(() => reveal());
  await waitFor(() => expect(mount).toHaveBeenCalledOnce());
  expect(watchedLoad).toHaveBeenCalledOnce();
});
