import { AlmacLogo } from './AlmacLogo';
import kimptonLogo from '@/assets/kimpton-logo.svg';
import carbonmashLogo from '@/assets/carbonmash-logo.webp';

interface CompanyHeaderLogoProps {
  companyName?: string | null;
  userEmail?: string | null;
  logoUrl?: string | null;
  className?: string;
}

export const CompanyHeaderLogo = ({ companyName, userEmail, logoUrl, className = "h-10" }: CompanyHeaderLogoProps) => {
  const isRameesAccount = userEmail?.toLowerCase() === 'rameesraja.kn@gmail.com';
  const cleanEmail = (userEmail || '').toLowerCase();
  const cleanCompany = (companyName || '').toLowerCase();

  // 1. Custom uploaded logo
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

  // 2. Kimpton branding
  const isKimpton = !isRameesAccount && (cleanCompany.includes('kimpton') || cleanEmail.includes('kimpton') || cleanEmail.includes('niamh'));
  if (isKimpton) {
    return (
      <div className={`flex items-center justify-center ${className}`}>
        <img src={kimptonLogo} alt="Kimpton" className="h-full max-h-10 object-contain" />
      </div>
    );
  }

  // 3. Almac branding
  const isAlmac = cleanCompany.includes('almac') || cleanEmail.includes('almac');
  if (isAlmac) {
    return <AlmacLogo className={className} />;
  }

  // 4. CarbonMash / Net-Z Platform branding
  if (cleanCompany.includes('carbonmash') || cleanEmail.includes('carbonmash') || cleanCompany.includes('net-z') || cleanEmail.includes('democc')) {
    return (
      <div className={`flex items-center justify-center ${className}`}>
        <img src={carbonmashLogo} alt="CarbonMash" className="h-full max-h-10 object-contain" />
      </div>
    );
  }

  // Default fallback
  return <AlmacLogo className={className} />;
};

