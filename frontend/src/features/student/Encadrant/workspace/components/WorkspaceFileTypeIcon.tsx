import type { FunctionComponent, ReactNode } from "react";
import type { WorkspaceFileKind } from "../utils/workspaceFileType";
import { getWorkspaceFileKindLabel } from "../utils/workspaceFileType";

type WorkspaceFileTypeIconProps = {
  kind: WorkspaceFileKind;
  className?: string;
};

function FileSvg({
  children,
  title,
  className,
}: {
  children: ReactNode;
  title: string;
  className?: string;
}) {
  return (
    <svg
      viewBox="0 0 32 32"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      role="img"
      aria-label={title}
    >
      <title>{title}</title>
      {children}
    </svg>
  );
}

function FileGlyph({
  fill,
  fold,
  label,
  fontSize = 7.2,
}: {
  fill: string;
  fold: string;
  label: string;
  fontSize?: number;
}) {
  return (
    <>
      <path
        d="M6.4 3h12.3L25.5 9.8V27a2.1 2.1 0 0 1-2.1 2.1H6.4A2.1 2.1 0 0 1 4.3 27V5.1A2.1 2.1 0 0 1 6.4 3Z"
        fill={fill}
      />
      <path d="M18.7 3v6.8h6.8" fill={fold} />
      <text
        x="16"
        y="22"
        textAnchor="middle"
        fill="#fff"
        fontSize={fontSize}
        fontWeight="800"
        fontFamily="system-ui, 'Segoe UI', sans-serif"
      >
        {label}
      </text>
    </>
  );
}

function OfficeTile({ fill, letter }: { fill: string; letter: string }) {
  return (
    <>
      <rect x="3" y="3" width="26" height="26" rx="6" fill={fill} />
      <text
        x="16"
        y="22.6"
        textAnchor="middle"
        fill="#fff"
        fontSize="15"
        fontWeight="800"
        fontFamily="system-ui, 'Segoe UI', sans-serif"
      >
        {letter}
      </text>
    </>
  );
}

const KIND_MARKUP: Record<WorkspaceFileKind, ReactNode> = {
  pdf: <FileGlyph fill="#E5252A" fold="#B91C1C" label="PDF" fontSize={7} />,
  word: <OfficeTile fill="#185ABD" letter="W" />,
  excel: <OfficeTile fill="#107C41" letter="X" />,
  ppt: <OfficeTile fill="#C43E1C" letter="P" />,
  markdown: <FileGlyph fill="#0E7490" fold="#155E75" label="MD" />,
  text: <FileGlyph fill="#64748B" fold="#475569" label="TXT" />,
  archive: <FileGlyph fill="#7C3AED" fold="#5B21B6" label="ZIP" />,
  image: <FileGlyph fill="#DB2777" fold="#9D174D" label="IMG" />,
  video: <FileGlyph fill="#C026D3" fold="#86198F" label="VID" />,
  other: <FileGlyph fill="#64748B" fold="#475569" label="FILE" fontSize={6.2} />,
};

const WorkspaceFileTypeIcon: FunctionComponent<WorkspaceFileTypeIconProps> = ({
  kind,
  className,
}) => (
  <FileSvg title={getWorkspaceFileKindLabel(kind)} className={className}>
    {KIND_MARKUP[kind]}
  </FileSvg>
);

export default WorkspaceFileTypeIcon;
