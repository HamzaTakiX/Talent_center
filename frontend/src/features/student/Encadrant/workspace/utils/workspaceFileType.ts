export type WorkspaceFileKind =
  | "pdf"
  | "word"
  | "excel"
  | "ppt"
  | "markdown"
  | "text"
  | "archive"
  | "image"
  | "video"
  | "other";

const KIND_BY_EXTENSION: Record<string, WorkspaceFileKind> = {
  pdf: "pdf",
  doc: "word",
  docx: "word",
  odt: "word",
  rtf: "word",
  xls: "excel",
  xlsx: "excel",
  csv: "excel",
  ods: "excel",
  ppt: "ppt",
  pptx: "ppt",
  odp: "ppt",
  md: "markdown",
  markdown: "markdown",
  txt: "text",
  log: "text",
  zip: "archive",
  rar: "archive",
  "7z": "archive",
  tar: "archive",
  gz: "archive",
  png: "image",
  jpg: "image",
  jpeg: "image",
  gif: "image",
  webp: "image",
  svg: "image",
  mp4: "video",
  mov: "video",
  avi: "video",
  webm: "video",
};

const LABEL_BY_KIND: Record<WorkspaceFileKind, string> = {
  pdf: "PDF",
  word: "Word",
  excel: "Excel",
  ppt: "PowerPoint",
  markdown: "Markdown",
  text: "Texte",
  archive: "Archive",
  image: "Image",
  video: "Vidéo",
  other: "Fichier",
};

export function resolveWorkspaceFileKind(filename: string): WorkspaceFileKind {
  const extension = filename.split(".").pop()?.toLowerCase() ?? "";
  return KIND_BY_EXTENSION[extension] ?? "other";
}

export function getWorkspaceFileKindLabel(kind: WorkspaceFileKind): string {
  return LABEL_BY_KIND[kind];
}
