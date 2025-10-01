import { Users, Target, Heart, Award, Truck, Clock, Shield, Star } from "lucide-react";
import Header from "@/components/Header/Header";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";

export default function About() {
  const values = [
    {
      icon: Target,
      title: "Student-Focused",
      description: "Everything we do is designed specifically for student life and needs."
    },
    {
      icon: Heart,
      title: "Community First",
      description: "Building a supportive community where students help students thrive."
    },
    {
      icon: Award,
      title: "Quality Products",
      description: "Carefully curated products that meet the highest standards at student prices."
    }
  ];

  const features = [
    {
      icon: Truck,
      title: "Fast Delivery",
      description: "Same-day delivery to your hostel or rental"
    },
    {
      icon: Clock,
      title: "24/7 Service",
      description: "Order anytime, anywhere on campus"
    },
    {
      icon: Shield,
      title: "Secure Payments",
      description: "Safe and secure payment options"
    },
    {
      icon: Star,
      title: "Student Discounts",
      description: "Exclusive deals for student community"
    }
  ];

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main>
        {/* Hero Section */}
        <section className="py-16 lg:py-24 bg-gradient-hero">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center max-w-4xl mx-auto">
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6">
                About <span className="bg-gradient-primary bg-clip-text text-transparent">HostelCart</span>
              </h1>
              <p className="text-lg md:text-xl text-muted-foreground mb-8">
                We're revolutionizing how students shop by bringing convenience, affordability, 
                and quality directly to your doorstep.
              </p>
              <Button variant="hero" size="xl">
                Join Our Community
              </Button>
            </div>
          </div>
        </section>

        {/* Mission Section */}
        <section className="py-16 lg:py-24">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid lg:grid-cols-2 gap-12 items-center">
              <div className="space-y-6">
                <h2 className="text-3xl md:text-4xl font-bold">
                  Our <span className="bg-gradient-primary bg-clip-text text-transparent">Mission</span>
                </h2>
                <p className="text-lg text-muted-foreground">
                  Founded by students, for students, HostelCart understands the unique challenges 
                  of campus life. We believe every student deserves easy access to quality products 
                  without breaking the budget or sacrificing valuable study time.
                </p>
                <p className="text-lg text-muted-foreground">
                  From late-night snack cravings to essential study supplies, we're here to make 
                  student life easier, one delivery at a time.
                </p>
              </div>
              <div className="bg-card rounded-card p-8 shadow-card border">
                <div className="grid grid-cols-2 gap-6 text-center">
                  <div>
                    <div className="text-3xl font-bold bg-gradient-primary bg-clip-text text-transparent mb-2">
                      5K+
                    </div>
                    <p className="text-muted-foreground">Students Served</p>
                  </div>
                  <div>
                    <div className="text-3xl font-bold bg-gradient-primary bg-clip-text text-transparent mb-2">
                      50K+
                    </div>
                    <p className="text-muted-foreground">Orders Delivered</p>
                  </div>
                  <div>
                    <div className="text-3xl font-bold bg-gradient-primary bg-clip-text text-transparent mb-2">
                      25+
                    </div>
                    <p className="text-muted-foreground">Campus Locations</p>
                  </div>
                  <div>
                    <div className="text-3xl font-bold bg-gradient-primary bg-clip-text text-transparent mb-2">
                      4.8★
                    </div>
                    <p className="text-muted-foreground">Student Rating</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Values Section */}
        <section className="py-16 lg:py-24 bg-muted/20">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-4xl font-bold mb-4">
                Our <span className="bg-gradient-primary bg-clip-text text-transparent">Values</span>
              </h2>
              <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                The principles that guide everything we do
              </p>
            </div>

            <div className="grid md:grid-cols-3 gap-8">
              {values.map((value, index) => (
                <div 
                  key={index}
                  className="text-center space-y-4 animate-fade-in"
                  style={{ animationDelay: `${index * 150}ms` }}
                >
                  <div className="mx-auto h-16 w-16 rounded-full bg-gradient-primary flex items-center justify-center">
                    <value.icon className="h-8 w-8 text-white" />
                  </div>
                  <h3 className="text-xl font-semibold">{value.title}</h3>
                  <p className="text-muted-foreground">{value.description}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section className="py-16 lg:py-24">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-4xl font-bold mb-4">
                Why Choose <span className="bg-gradient-primary bg-clip-text text-transparent">HostelCart</span>?
              </h2>
              <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                We've built our platform with students in mind
              </p>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
              {features.map((feature, index) => (
                <div 
                  key={index}
                  className="bg-card rounded-card p-6 shadow-card hover:shadow-lg transition-all duration-300 hover:scale-105 border text-center animate-fade-in"
                  style={{ animationDelay: `${index * 100}ms` }}
                >
                  <div className="mx-auto h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center mb-4">
                    <feature.icon className="h-6 w-6 text-primary" />
                  </div>
                  <h3 className="font-semibold text-lg mb-2">{feature.title}</h3>
                  <p className="text-muted-foreground text-sm">{feature.description}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Team Section */}
        <section className="py-16 lg:py-24 bg-muted/20">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-4xl font-bold mb-4">
                Meet Our <span className="bg-gradient-primary bg-clip-text text-transparent">Team</span>
              </h2>
              <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                Students who understand your needs because we've been there too
              </p>
            </div>

            <div className="grid md:grid-cols-3 gap-8 max-w-4xl mx-auto">
              {[
                {
                  name: "Alex Thompson",
                  role: "Founder & CEO",
                  bio: "Computer Science graduate with a passion for solving student problems",
                  image: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=300&h=300&fit=crop&crop=face"
                },
                {
                  name: "Jessica Lee",
                  role: "Head of Operations",
                  bio: "Business major specializing in logistics and customer experience",
                  image: "https://images.unsplash.com/photo-1494790108755-2616b612b786?w=300&h=300&fit=crop&crop=face"
                },
                {
                  name: "David Park",
                  role: "Tech Lead",
                  bio: "Engineering student building the platform that serves our community",
                  image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=300&h=300&fit=crop&crop=face"
                }
              ].map((member, index) => (
                <div 
                  key={index}
                  className="text-center space-y-4 animate-fade-in"
                  style={{ animationDelay: `${index * 150}ms` }}
                >
                  <img 
                    src={member.image} 
                    alt={member.name}
                    className="w-32 h-32 rounded-full mx-auto object-cover shadow-lg"
                  />
                  <div>
                    <h3 className="text-xl font-semibold">{member.name}</h3>
                    <p className="text-primary font-medium">{member.role}</p>
                    <p className="text-muted-foreground text-sm mt-2">{member.bio}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
