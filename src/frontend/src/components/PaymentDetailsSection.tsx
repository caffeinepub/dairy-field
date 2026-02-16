import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { CreditCard, QrCode } from 'lucide-react';
import { SiGooglepay } from 'react-icons/si';
import type { PaymentInfo } from '@/utils/payment';

interface PaymentDetailsSectionProps {
  paymentInfo: PaymentInfo;
}

export default function PaymentDetailsSection({ paymentInfo }: PaymentDetailsSectionProps) {
  return (
    <Card className="border-green-200 bg-green-50/50">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-lg">
          <CreditCard className="h-5 w-5" />
          Payment Details
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="flex items-center gap-2">
          <SiGooglepay className="h-6 w-6 text-blue-600" />
          <div>
            <p className="text-sm text-muted-foreground">Payment Method</p>
            <p className="font-medium">{paymentInfo.method}</p>
          </div>
        </div>

        {paymentInfo.paymentFlow && (
          <div className="flex items-center gap-2">
            <QrCode className="h-5 w-5 text-muted-foreground" />
            <div>
              <p className="text-sm text-muted-foreground">Payment Type</p>
              <p className="font-medium capitalize">{paymentInfo.paymentFlow === 'qr' ? 'QR Code' : 'Deep Link'}</p>
            </div>
          </div>
        )}

        {paymentInfo.payeeValue && (
          <div>
            <p className="text-sm text-muted-foreground">
              {paymentInfo.payeeType === 'phone' ? 'Phone / UPI' : 'UPI ID'}
            </p>
            <p className="font-medium">{paymentInfo.payeeValue}</p>
          </div>
        )}

        {paymentInfo.transactionRef && (
          <div>
            <p className="text-sm text-muted-foreground">Transaction Reference</p>
            <p className="font-mono text-sm">{paymentInfo.transactionRef}</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
