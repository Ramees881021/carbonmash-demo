import { AlmacLogo } from './AlmacLogo';

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
      <div className={`flex items-center gap-3 ${className}`}>
        <div className="flex items-center">
          <span className="font-extrabold tracking-wider text-2xl text-[#1a365d] uppercase font-sans">
            KIMPTON
          </span>
          <span className="ml-2 px-2 py-0.5 text-xs font-semibold uppercase tracking-wider rounded bg-[#00d084]/20 text-[#00875a]">
            Energy Solutions
          </span>
        </div>
      </div>
    );
  }

  return <AlmacLogo className={className} />;
};

