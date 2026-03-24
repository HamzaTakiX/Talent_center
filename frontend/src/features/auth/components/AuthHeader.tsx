import { FunctionComponent } from 'react';
import logoImage from '../assets/images/common/Logo_ESCA.png';

export const AuthHeader: FunctionComponent = () => {
  return (
    <div className="w-full flex flex-col items-start gap-1.5 mb-6 mt-5 lg:mb-8 lg:mt-4">
      <div className="flex items-center gap-3">
        <img className="h-10 lg:h-12 w-auto object-contain shrink-0" alt="ESCA Logo" src={logoImage} />
        <div className="text-[21px] lg:text-[24px] font-semibold text-gray leading-8 tracking-tight">Digital Talent Center</div>
      </div>
      <div className="text-[13px] lg:text-[15px] font-medium text-dimgray leading-6">ESCA Internship Management Platform</div>
    </div>
  );
};
