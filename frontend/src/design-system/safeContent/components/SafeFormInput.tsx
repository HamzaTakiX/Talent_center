import { FunctionComponent, type InputHTMLAttributes } from 'react';
import { AdminFormInput } from '../../../features/admin/shared/forms/AdminFormPrimitives';
import type { AdminFormFieldKey } from '../../../features/admin/shared/forms/adminFormIcons';
import CharCount from './CharCount';

interface SafeFormInputProps extends InputHTMLAttributes<HTMLInputElement> {
  fieldKey?: AdminFormFieldKey;
  maxLength: number;
  showCount?: boolean;
  countId?: string;
}

const SafeFormInput: FunctionComponent<SafeFormInputProps> = ({
  maxLength,
  showCount = true,
  countId,
  value,
  onChange,
  fieldKey,
  ...props
}) => {
  const strValue = String(value ?? '');
  const handleChange: React.ChangeEventHandler<HTMLInputElement> = (e) => {
    if (e.target.value.length <= maxLength) {
      onChange?.(e);
    }
  };

  return (
    <>
      <AdminFormInput
        {...props}
        fieldKey={fieldKey}
        value={value}
        onChange={handleChange}
        maxLength={maxLength}
      />
      {showCount && (
        <CharCount current={strValue.length} max={maxLength} id={countId} />
      )}
    </>
  );
};

export default SafeFormInput;
