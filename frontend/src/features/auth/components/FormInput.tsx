import { FunctionComponent, InputHTMLAttributes } from 'react';
import { LucideIcon } from 'lucide-react';

interface FormInputProps extends InputHTMLAttributes<HTMLInputElement | HTMLTextAreaElement> {
  label: string;
  error?: string;
  isTextArea?: boolean;
  Icon?: LucideIcon;
}

export const FormInput: FunctionComponent<FormInputProps> = ({
  label,
  error,
  isTextArea = false,
  Icon,
  ...inputProps
}) => {
  return (
    <div className="w-full flex flex-col gap-1.5 focus-within:-translate-y-[1px] transition-transform duration-300 ease-out group">
      <div className="flex items-center justify-between">
        <label className="text-[13px] font-medium text-darkslategray leading-none transition-colors duration-300 group-focus-within:text-mediumslateblue">{label}</label>
        {error && <div className="text-red-500 text-[11px] font-medium animate-pulse">{error}</div>}
      </div>
      <div className={`w-full rounded-xl bg-whitesmoke border-lightgray border-solid border-[1px] box-border overflow-hidden text-slategray-100 transition-all duration-300 focus-within:border-mediumslateblue focus-within:ring-2 focus-within:ring-mediumslateblue/20 focus-within:bg-white focus-within:shadow-sm ${isTextArea ? 'py-2.5 px-3.5' : 'h-[44px] flex items-center px-3.5'}`}>
        {Icon && !isTextArea && (
           <Icon className="w-4 h-4 mr-2.5 text-slategray-200 transition-colors duration-300 group-focus-within:text-mediumslateblue shrink-0" strokeWidth={2} />
        )}
        {isTextArea ? (
          <textarea
            className="w-full bg-transparent border-none outline-none resize-none text-darkslategray text-[14px] leading-5 font-inter placeholder:text-lightgray-200 transition-colors"
            rows={3}
            {...(inputProps as any)}
          />
        ) : (
          <input
            className="w-full bg-transparent border-none outline-none text-darkslategray text-[14px] font-inter placeholder:text-lightgray-200 transition-colors"
            {...(inputProps as any)}
          />
        )}
      </div>
    </div>
  );
};
