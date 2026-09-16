import { useAuth, DEMO_ACCOUNTS } from '@/contexts/AuthContext';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Building2, UserCircle2 } from 'lucide-react';

export const AccountSwitcher = () => {
  const { activeAccount, switchAccount } = useAuth();

  return (
    <div className="flex items-center gap-2">
      <div className="hidden sm:flex items-center text-xs text-muted-foreground font-medium mr-1">
        <UserCircle2 className="h-3.5 w-3.5 mr-1 text-primary" />
        <span>Demo Account:</span>
      </div>
      <Select
        value={activeAccount?.email || DEMO_ACCOUNTS[0].email}
        onValueChange={(val) => switchAccount(val)}
      >
        <SelectTrigger className="h-9 w-[220px] md:w-[260px] bg-background border-border text-xs font-medium shadow-sm">
          <div className="flex items-center gap-2 truncate">
            <Building2 className="h-3.5 w-3.5 text-primary shrink-0" />
            <span className="truncate">{activeAccount?.companyName || 'Select Account'}</span>
          </div>
        </SelectTrigger>
        <SelectContent align="end" className="w-[280px]">
          {DEMO_ACCOUNTS.map((acc) => (
            <SelectItem key={acc.email} value={acc.email} className="cursor-pointer py-2 text-xs">
              <div className="flex flex-col gap-0.5">
                <span className="font-semibold text-foreground flex items-center justify-between">
                  {acc.companyName}
                  <span className="text-[10px] px-1.5 py-0.2 rounded bg-muted text-muted-foreground font-normal uppercase">
                    {acc.role}
                  </span>
                </span>
                <span className="text-[11px] text-muted-foreground truncate">{acc.email}</span>
              </div>
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
};
