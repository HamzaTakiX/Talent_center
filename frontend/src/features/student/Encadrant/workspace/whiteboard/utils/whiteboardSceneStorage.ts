import { restore, serializeAsJSON } from "@excalidraw/excalidraw";
import type {
  BinaryFiles,
  ExcalidrawInitialDataState,
} from "@excalidraw/excalidraw/types";

type SceneElement = { isDeleted?: boolean };

export function countLiveWhiteboardElements(
  elements: readonly SceneElement[] | null | undefined,
): number {
  return (elements ?? []).filter((element) => !element.isDeleted).length;
}

export function readWhiteboardScene(
  storageKey: string,
): ExcalidrawInitialDataState | null {
  try {
    const raw = localStorage.getItem(storageKey);
    if (!raw) return null;
    const parsed: unknown = JSON.parse(raw);
    try {
      return restore(parsed as Parameters<typeof restore>[0], null, null);
    } catch {
      if (!parsed || typeof parsed !== "object") return null;
      const record = parsed as Record<string, unknown>;
      return {
        elements: (record.elements as ExcalidrawInitialDataState["elements"]) ?? [],
        appState: (record.appState as ExcalidrawInitialDataState["appState"]) ?? {},
        files: (record.files as ExcalidrawInitialDataState["files"]) ?? {},
      };
    }
  } catch {
    return null;
  }
}

export function writeWhiteboardScene(
  storageKey: string,
  elements: Parameters<typeof serializeAsJSON>[0],
  appState: Parameters<typeof serializeAsJSON>[1],
  files: BinaryFiles,
): boolean {
  if (countLiveWhiteboardElements(elements) === 0) return false;
  try {
    localStorage.setItem(
      storageKey,
      serializeAsJSON(elements, appState, files, "local"),
    );
    return true;
  } catch {
    return false;
  }
}

export function whiteboardSceneHasContent(storageKey: string): boolean {
  return countLiveWhiteboardElements(readWhiteboardScene(storageKey)?.elements) > 0;
}
