import { Link } from '@tanstack/react-router';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ShoppingBag, Phone, Leaf, Award } from 'lucide-react';

export default function HomePage() {
  return (
    <div className="flex flex-col">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-br from-background via-muted/20 to-background">
        <div className="container py-16 md:py-24">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div className="space-y-6">
              <Badge variant="secondary" className="w-fit">
                <Leaf className="h-3 w-3 mr-1" />
                100% Pure & Natural
              </Badge>
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight">
                Fresh Dairy Products Delivered to Your Door
              </h1>
              <p className="text-lg text-muted-foreground">
                Experience the finest quality milk, curd, paneer, ghee, and frozen desserts. 
                All our products are pure with <strong>no artificial colour or essence</strong>.
              </p>
              <div className="flex flex-wrap gap-4">
                <Link to="/products">
                  <Button size="lg" className="gap-2">
                    <ShoppingBag className="h-5 w-5" />
                    Shop Now
                  </Button>
                </Link>
                <Link to="/contact">
                  <Button size="lg" variant="outline" className="gap-2">
                    <Phone className="h-5 w-5" />
                    Contact Us
                  </Button>
                </Link>
              </div>
            </div>
            <div className="relative">
              <img 
                src="/assets/generated/dairy-field-hero.dim_1600x600.png" 
                alt="Fresh dairy products" 
                className="rounded-2xl shadow-2xl w-full"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 bg-muted/30">
        <div className="container">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4">Why Choose DAIRY FIELD?</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              We are committed to delivering the highest quality dairy products and frozen desserts to your family.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <Card>
              <CardContent className="pt-6 text-center space-y-3">
                <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mx-auto">
                  <Leaf className="h-6 w-6 text-primary" />
                </div>
                <h3 className="font-semibold text-lg">100% Pure</h3>
                <p className="text-sm text-muted-foreground">
                  No artificial colours, flavours, or preservatives. Just pure, natural goodness.
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6 text-center space-y-3">
                <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mx-auto">
                  <Award className="h-6 w-6 text-primary" />
                </div>
                <h3 className="font-semibold text-lg">Premium Quality</h3>
                <p className="text-sm text-muted-foreground">
                  Fresh dairy products sourced from the finest farms and processed with care.
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6 text-center space-y-3">
                <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mx-auto">
                  <Phone className="h-6 w-6 text-primary" />
                </div>
                <h3 className="font-semibold text-lg">Easy Ordering</h3>
                <p className="text-sm text-muted-foreground">
                  Order online or call us at 9000009707 for quick and convenient delivery.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Products Preview */}
      <section className="py-16">
        <div className="container">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4">Our Products</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              From fresh milk to delicious frozen desserts, we have everything you need.
            </p>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-8">
            {['Milk', 'Curd', 'Paneer', 'Ghee', 'Malai Curd', 'Khowa', 'Fruit Ice Cream', 'Ice Candy'].map((product) => (
              <Card key={product} className="text-center hover:shadow-lg transition-shadow">
                <CardContent className="pt-6 pb-4">
                  <div className="w-16 h-16 rounded-full bg-muted mx-auto mb-3 flex items-center justify-center">
                    <span className="text-2xl">🥛</span>
                  </div>
                  <p className="font-medium">{product}</p>
                </CardContent>
              </Card>
            ))}
          </div>
          <div className="text-center">
            <Link to="/products">
              <Button size="lg">View All Products</Button>
            </Link>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-primary text-primary-foreground">
        <div className="container text-center space-y-6">
          <h2 className="text-3xl md:text-4xl font-bold">Ready to Order?</h2>
          <p className="text-lg max-w-2xl mx-auto opacity-90">
            Get fresh, pure dairy products delivered to your doorstep. Call us now or browse our products online.
          </p>
          <div className="flex flex-wrap gap-4 justify-center">
            <a href="tel:9000009707">
              <Button size="lg" variant="secondary" className="gap-2">
                <Phone className="h-5 w-5" />
                Call 9000009707
              </Button>
            </a>
            <Link to="/products">
              <Button size="lg" variant="outline" className="gap-2 bg-transparent border-primary-foreground text-primary-foreground hover:bg-primary-foreground hover:text-primary">
                <ShoppingBag className="h-5 w-5" />
                Shop Online
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
