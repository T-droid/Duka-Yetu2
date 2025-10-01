import { ArrowRight, Truck, Clock, Shield } from "lucide-react";
import { Button } from "@/components/ui/button";
import Image from "next/image";
import Link from "next/link";

const HeroSection = () => {
  return (
    <section className="relative overflow-hidden bg-gradient-hero">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-16 lg:py-24">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Left Content */}
          <div className="space-y-8 animate-fade-in">
            <div className="space-y-4">
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold leading-tight">
                Order. Relax.{" "}
                <span className="bg-gradient-primary bg-clip-text text-transparent">
                  Get it delivered
                </span>{" "}
                to your hostel.
              </h1>
              <p className="text-lg md:text-xl text-muted-foreground max-w-lg">
                The easiest way for students to shop online. From snacks to stationery, 
                we deliver everything directly to your doorstep.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-4">
              <Button
                variant="hero"
                size="xl"
                className="group"
                asChild
              >
                <Link href="/shop">
                  Shop Now
                  <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
                </Link>
              </Button>
              <Button variant="outline" size="xl">
                Learn More
              </Button>
            </div>

            {/* Features */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 pt-8">
              <div className="flex items-center space-x-3">
                <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                  <Truck className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <p className="font-semibold">Fast Delivery</p>
                  <p className="text-sm text-muted-foreground">Same day delivery</p>
                </div>
              </div>
              <div className="flex items-center space-x-3">
                <div className="h-10 w-10 rounded-full bg-secondary/10 flex items-center justify-center">
                  <Clock className="h-5 w-5 text-secondary" />
                </div>
                <div>
                  <p className="font-semibold">24/7 Service</p>
                  <p className="text-sm text-muted-foreground">Order anytime</p>
                </div>
              </div>
              <div className="flex items-center space-x-3">
                <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                  <Shield className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <p className="font-semibold">Secure</p>
                  <p className="text-sm text-muted-foreground">Safe payments</p>
                </div>
              </div>
            </div>
          </div>

          {/* Right Image */}
          <div className="relative animate-scale-in">
            <div className="relative rounded-card overflow-hidden shadow-hero">
              <Image
                src="/assets/hero-image.jpg"
                alt="Students shopping online"
                className="w-full h-auto object-cover"
                priority
                width={400}
                height={400}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-primary/20 to-transparent" />
            </div>
            
            {/* Floating Stats */}
            <div className="absolute -bottom-6 -left-6 bg-card rounded-card p-4 shadow-card border">
              <div className="flex items-center space-x-3">
                <div className="h-12 w-12 rounded-full bg-gradient-primary flex items-center justify-center">
                  <span className="text-white font-bold">5K+</span>
                </div>
                <div>
                  <p className="font-semibold">Happy Students</p>
                  <p className="text-sm text-muted-foreground">Trust our service</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;