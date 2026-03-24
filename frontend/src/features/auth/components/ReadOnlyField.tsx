import { FunctionComponent } from 'react';

interface ReadOnlyFieldProps {
  label: string;
  value: string;
}

export const ReadOnlyField: FunctionComponent<ReadOnlyFieldProps> = ({ label, value }) => {
  return (
    <div className="w-full flex flex-col gap-1.5">
      <div className="text-[13px] font-medium text-darkslategray leading-none">{label}</div>
      <div className="w-full h-[44px] rounded-xl bg-whitesmoke border-lightgray border-solid border-[1px] box-border overflow-hidden flex items-center py-1 px-3.5 text-gray">
        <div className="text-darkslategray text-[14px] truncate w-full">{value}</div>
      </div>
    </div>
  );
};
