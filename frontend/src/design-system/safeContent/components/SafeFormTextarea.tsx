import { FunctionComponent, type TextareaHTMLAttributes } from 'react';
import { AdminFormTextarea } from '../../../features/admin/shared/forms/AdminFormPrimitives';
import type { AdminFormFieldKey } from '../../../features/admin/shared/forms/adminFormIcons';
import { useAutoResizeTextarea } from '../hooks/useAutoResizeTextarea';
import CharCount from './CharCount';

interface SafeFormTextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  fieldKey?: AdminFormFieldKey;
  maxLength: number;
  maxHeight?: number;
  showCount?: boolean;
  countId?: string;
}

const SafeFormTextarea: FunctionComponent<SafeFormTextareaProps> = ({
  maxLength,
  maxHeight = 240,
  showCount = true,
  countId,
  value,
  onChange,
  fieldKey,
  className = '',
  ...props
}) => {
  const { ref, adjust } = useAutoResizeTextarea(maxHeight);
  const strValue = String(value ?? '');

  const handleChange: React.ChangeEventHandler<HTMLTextAreaElement> = (e) => {
    if (e.target.value.length <= maxLength) {
      onChange?.(e);
      adjust();
    }
  };

  return (
    <>
      <AdminFormTextarea
        {...props}
        ref={ref}
        fieldKey={fieldKey}
        value={value}
        onChange={handleChange}
        maxLength={maxLength}
        className={`safe-textarea-auto ${className}`.trim()}
        style={{ maxHeight: `${maxHeight}px` }}
      />
      {showCount && (
        <CharCount current={strValue.length} max={maxLength} id={countId} />
      )}
    </>
  );
};

export default SafeFormTextarea;
