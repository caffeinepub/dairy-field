import { Phone, MapPin, Clock } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export default function ContactPage() {
  return (
    <div className="container py-12">
      <div className="max-w-3xl mx-auto">
        <h1 className="text-4xl font-bold mb-4 text-center">Contact Us</h1>
        <p className="text-center text-muted-foreground mb-12">
          Get in touch with us for orders and inquiries
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Phone className="h-5 w-5" />
                Phone
              </CardTitle>
            </CardHeader>
            <CardContent>
              <a 
                href="tel:9494237076" 
                className="text-2xl font-semibold hover:text-primary transition-colors"
              >
                9494237076
              </a>
              <p className="text-sm text-muted-foreground mt-2">
                Call us for orders and inquiries
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Clock className="h-5 w-5" />
                Business Hours
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-lg font-medium">Open Daily</p>
              <p className="text-muted-foreground">6:00 AM - 9:00 PM</p>
            </CardContent>
          </Card>
        </div>

        <Card className="bg-muted/30">
          <CardContent className="pt-6">
            <div className="text-center space-y-4">
              <h2 className="text-2xl font-semibold">DAIRY FIELD</h2>
              <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                Premium dairy products and frozen desserts with no artificial colour or essence. 
                Natural fruits and dry fruits saffron added for authentic taste and quality.
              </p>
              <div className="pt-4">
                <p className="text-sm text-muted-foreground">
                  Experience the purity of nature in every product
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
