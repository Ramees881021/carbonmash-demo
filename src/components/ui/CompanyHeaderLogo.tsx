import { AlmacLogo } from './AlmacLogo';
import kimptonLogo from '@/assets/kimpton-logo.svg';

interface CompanyHeaderLogoProps {
  companyName?: string | null;
  logoUrl?: string | null;
  className?: string;
}

export const CompanyHeaderLogo = ({ companyName, logoUrl, className = "h-10" }: CompanyHeaderLogoProps) => {
  if (logoUrl) {
    return (
      <div className={`flex items-center justify-center ${className}`}>
        <img 
          src={logoUrl} 
          alt={companyName || 'Company Logo'} 
          className="h-full max-h-10 object-contain rounded" 
          onError={(e) => { (e.target as any).style.display = 'none'; }}
        />
      </div>
    );
  }

  const isKimpton = (companyName || '').toLowerCase().includes('kimpton');

  if (isKimpton) {
    return (
      <div className={`flex items-center justify-center ${className}`}>
        <img src={kimptonLogo} alt="Kimpton" className="h-full max-h-10 object-contain" />
      </div>
    );
  }

  return <AlmacLogo className={className} />;
};

