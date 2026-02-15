import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { ShieldAlert } from 'lucide-react';
import { useNavigate } from '@tanstack/react-router';

interface AdminAccessDeniedProps {
  message?: string;
}

export default function AdminAccessDenied({ message }: AdminAccessDeniedProps) {
  const navigate = useNavigate();

  return (
    <div className="container py-12">
      <Card className="max-w-md mx-auto text-center">
        <CardHeader>
          <ShieldAlert className="h-16 w-16 mx-auto mb-4 text-destructive" />
          <CardTitle>Access Denied</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <Alert variant="destructive">
            <AlertDescription>
              {message || 'You do not have permission to access this page. Admin access is required.'}
            </AlertDescription>
          </Alert>
          <Button onClick={() => navigate({ to: '/' })} className="w-full">
            Go to Home
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
