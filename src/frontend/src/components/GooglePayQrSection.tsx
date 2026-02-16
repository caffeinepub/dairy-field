import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Copy, Check, QrCode as QrCodeIcon, AlertCircle } from 'lucide-react';
import { SiGooglepay } from 'react-icons/si';
import { useState, useMemo } from 'react';
import { toast } from 'sonner';
import { encodeQrToSvg, svgToDataUrl } from '@/utils/qr/encodeQrToSvg';

interface GooglePayQrSectionProps {
  upiUri: string;
  payeeValue: string;
  payeeName: string;
  amount: number;
}

export default function GooglePayQrSection({
  upiUri,
  payeeValue,
  payeeName,
  amount,
}: GooglePayQrSectionProps) {
  const [copiedPhone, setCopiedPhone] = useState(false);
  const [copiedAmount, setCopiedAmount] = useState(false);
  const [qrError, setQrError] = useState(false);

  // Generate QR code from the exact UPI URI
  const qrCodeDataUrl = useMemo(() => {
    try {
      const svg = encodeQrToSvg(upiUri, { ecLevel: 'M', margin: 2 });
      return svgToDataUrl(svg);
    } catch (error) {
      console.error('QR generation failed:', error);
      setQrError(true);
      return null;
    }
  }, [upiUri]);

  const handleCopyPhone = async () => {
    try {
      await navigator.clipboard.writeText(payeeValue);
      setCopiedPhone(true);
      toast.success('Phone number copied!');
      setTimeout(() => setCopiedPhone(false), 2000);
    } catch (error) {
      toast.error('Failed to copy. Please try again.');
    }
  };

  const handleCopyAmount = async () => {
    try {
      await navigator.clipboard.writeText(amount.toString());
      setCopiedAmount(true);
      toast.success('Amount copied!');
      setTimeout(() => setCopiedAmount(false), 2000);
    } catch (error) {
      toast.error('Failed to copy. Please try again.');
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <SiGooglepay className="h-6 w-6 text-blue-600" />
          Google Pay QR Code
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <Alert>
          <QrCodeIcon className="h-4 w-4" />
          <AlertDescription>
            Scan the QR code below with any UPI app (Google Pay, PhonePe, Paytm, etc.) to complete your payment.
          </AlertDescription>
        </Alert>

        {/* QR Code Display */}
        <div className="flex justify-center p-6 bg-white rounded-lg border-2 border-dashed">
          {qrError || !qrCodeDataUrl ? (
            <div className="flex flex-col items-center gap-3 text-muted-foreground">
              <AlertCircle className="h-12 w-12" />
              <p className="text-sm text-center">
                QR code could not be generated.<br />
                Please use manual payment details below.
              </p>
            </div>
          ) : (
            <img
              src={qrCodeDataUrl}
              alt="UPI Payment QR Code"
              className="max-w-full h-auto"
              style={{ width: '256px', height: '256px', imageRendering: 'pixelated' }}
            />
          )}
        </div>

        {/* Payment Details */}
        <div className="space-y-3 p-4 bg-muted/50 rounded-lg">
          <div className="flex justify-between items-center">
            <div>
              <p className="text-sm text-muted-foreground">Pay to</p>
              <p className="font-medium">{payeeName}</p>
            </div>
          </div>
          
          <div className="flex justify-between items-center">
            <div>
              <p className="text-sm text-muted-foreground">Phone / UPI</p>
              <p className="font-medium">{payeeValue}</p>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleCopyPhone}
              className="h-8"
            >
              {copiedPhone ? (
                <Check className="h-4 w-4 text-green-600" />
              ) : (
                <Copy className="h-4 w-4" />
              )}
            </Button>
          </div>

          <div className="flex justify-between items-center">
            <div>
              <p className="text-sm text-muted-foreground">Amount</p>
              <p className="font-bold text-lg">₹{amount}</p>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleCopyAmount}
              className="h-8"
            >
              {copiedAmount ? (
                <Check className="h-4 w-4 text-green-600" />
              ) : (
                <Copy className="h-4 w-4" />
              )}
            </Button>
          </div>
        </div>

        <Alert variant="default" className="bg-blue-50 border-blue-200">
          <AlertDescription className="text-sm">
            <strong>Manual Payment:</strong> If you can't scan the QR code, open any UPI app and send ₹{amount} to <strong>{payeeValue}</strong> ({payeeName}).
          </AlertDescription>
        </Alert>
      </CardContent>
    </Card>
  );
}
