import { FunctionComponent } from 'react';

import type { WhiteboardBackgroundType } from '../types/whiteboardPreferences';

interface WhiteboardBackgroundLayerProps {
  color: string;
  type: WhiteboardBackgroundType;
}

const WhiteboardBackgroundLayer: FunctionComponent<WhiteboardBackgroundLayerProps> = ({
  color,
  type,
}) => (
  <div
    className="student-whiteboard-bg-layer"
    data-bg-type={type}
    style={{ '--wb-canvas-color': color } as React.CSSProperties}
    aria-hidden
  />
);

export default WhiteboardBackgroundLayer;
