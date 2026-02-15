import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { CreditCard, Phone, Wallet, Hash } from 'lucide-react';
import type { PaymentInfo } from '@/utils/payment';

interface PaymentDetailsSectionProps {
  paymentInfo: PaymentInfo;
}

export default function PaymentDetailsSection({ paymentInfo }: PaymentDetailsSectionProps) {
  return (
    <Card className="border-accent">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-lg">
          <CreditCard className="h-5 w-5" />
          Payment Details
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="flex items-start gap-3">
          <Wallet className="h-4 w-4 text-muted-foreground mt-0.5" />
          <div className="flex-1">
            <p className="text-sm text-muted-foreground">Payment Method</p>
            <p className="font-medium">{paymentInfo.method}</p>
          </div>
        </div>

        {paymentInfo.payeeLabel && paymentInfo.payeeValue && (
          <>
            <Separator />
            <div className="flex items-start gap-3">
              <Phone className="h-4 w-4 text-muted-foreground mt-0.5" />
              <div className="flex-1">
                <p className="text-sm text-muted-foreground">{paymentInfo.payeeLabel}</p>
                <p className="font-medium font-mono">{paymentInfo.payeeValue}</p>
              </div>
            </div>
          </>
        )}

        {paymentInfo.transactionRef && (
          <>
            <Separator />
            <div className="flex items-start gap-3">
              <Hash className="h-4 w-4 text-muted-foreground mt-0.5" />
              <div className="flex-1">
                <p className="text-sm text-muted-foreground">Transaction Reference</p>
                <p className="font-medium font-mono text-sm break-all">
                  {paymentInfo.transactionRef}
                </p>
              </div>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
}
