import { AlmacLogo } from './AlmacLogo';
import kimptonLogo from '@/assets/kimpton-logo.svg';

interface CompanyHeaderLogoProps {
  companyName?: string | null;
  userEmail?: string | null;
  logoUrl?: string | null;
  className?: string;
}

export const CompanyHeaderLogo = ({ companyName, userEmail, logoUrl, className = "h-10" }: CompanyHeaderLogoProps) => {
  const isRameesAccount = userEmail?.toLowerCase() === 'rameesraja.kn@gmail.com';

  if (logoUrl && !isRameesAccount) {
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

  const isKimpton = !isRameesAccount && (companyName || '').toLowerCase().includes('kimpton');

  if (isKimpton) {
    return (
      <div className={`flex items-center justify-center ${className}`}>
        <img src={kimptonLogo} alt="Kimpton" className="h-full max-h-10 object-contain" />
      </div>
    );
  }

  return <AlmacLogo className={className} />;
};

