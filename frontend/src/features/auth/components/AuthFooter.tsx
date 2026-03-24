import { FunctionComponent } from 'react';

export const AuthFooter: FunctionComponent = () => {
  return (
    <div className="w-full border-t border-solid border-gainsboro mt-6 pt-4 mb-2 flex justify-center text-[13px] text-dimgray">
      <div>
        <span>{`Need help? Contact `}</span>
        <span className="text-mediumslateblue cursor-pointer hover:underline font-medium">support@esca.ma</span>
      </div>
    </div>
  );
};
