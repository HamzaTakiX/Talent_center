import { FunctionComponent } from 'react';
import { SAFE_FILE_NAME } from '../classes';

interface SafeFileNameProps {
  name: string;
  className?: string;
}

const SafeFileName: FunctionComponent<SafeFileNameProps> = ({ name, className = '' }) => (
  <span
    className={`safe-file-name ${SAFE_FILE_NAME} ${className}`.trim()}
    title={name.length > 30 ? name : undefined}
  >
    {name}
  </span>
);

export default SafeFileName;
