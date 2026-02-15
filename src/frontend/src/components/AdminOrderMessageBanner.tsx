import { Alert, AlertDescription } from '@/components/ui/alert';
import { Info } from 'lucide-react';

export default function AdminOrderMessageBanner() {
  return (
    <Alert className="mb-4 border-primary/50 bg-primary/5">
      <Info className="h-4 w-4" />
      <AlertDescription className="text-sm">
        <strong>Admin Notice:</strong> New orders will appear in your order management system. Check the admin panel regularly for incoming orders.
      </AlertDescription>
    </Alert>
  );
}
