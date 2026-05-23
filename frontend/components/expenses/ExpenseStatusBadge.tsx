import { useLanguage } from '@/contexts/LanguageContext';
import Badge from '@/components/ui/Badge';
import { ExpenseStatus, getStatusLabel } from '@/types';

export default function ExpenseStatusBadge({ status }: { status: ExpenseStatus }) {
  const { language } = useLanguage();
  return <Badge status={status}>{getStatusLabel(status, language)}</Badge>;
}
