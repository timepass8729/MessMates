import { useAuthState } from 'react-firebase-hooks/auth';
import { auth } from '@/lib/firebase';
import { useNavigate } from 'react-router-dom';
import { useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { HeroButton } from '@/components/ui/hero-button';
import { 
  Utensils, 
  QrCode, 
  MessageSquare, 
  Calendar,
  IndianRupee,
  Users,
  CheckCircle,
  ArrowRight
} from 'lucide-react';

const ADMIN_EMAIL = 'megharajdandgavhal2004@gmail.com';

const Index = () => {
  const [user, loading] = useAuthState(auth);
  const navigate = useNavigate();

  useEffect(() => {
    if (!loading && user) {
      const isAdmin = user.email === ADMIN_EMAIL;
      navigate(isAdmin ? '/admin' : '/dashboard');
    }
  }, [user, loading, navigate]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-hero">
        <div className="text-center">
          <Utensils className="h-12 w-12 animate-pulse mx-auto mb-4 text-primary-foreground" />
          <p className="text-primary-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  const features = [
    {
      icon: QrCode,
      title: "QR Attendance",
      description: "Mark your meal attendance with QR code scanning"
    },
    {
      icon: Calendar,
      title: "Weekly Menu",
      description: "View updated weekly menu and plan your meals"
    },
    {
      icon: MessageSquare,
      title: "Feedback System",
      description: "Submit feedback and complaints easily"
    },
    {
      icon: IndianRupee,
      title: "Bill Estimation",
      description: "Track your monthly meal expenses automatically"
    },
    {
      icon: Users,
      title: "Admin Dashboard",
      description: "Comprehensive management tools for administrators"
    },
    {
      icon: CheckCircle,
      title: "Leave Management",
      description: "Request leaves for meal deductions"
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-hero">
      {/* Hero Section */}
      <section className="relative py-20 px-4">
        <div className="container mx-auto text-center">
          <div className="inline-flex items-center gap-3 bg-background/10 backdrop-blur-sm px-6 py-3 rounded-full mb-8 border border-primary-foreground/20">
            <Utensils className="h-8 w-8 text-primary-foreground" />
            <span className="font-bold text-2xl text-primary-foreground">MessMates</span>
          </div>
          
          <h1 className="text-5xl md:text-7xl font-bold text-primary-foreground mb-6 leading-tight">
            Manage Your
            <span className="block bg-gradient-to-r from-accent to-primary-glow bg-clip-text text-transparent">
              Mess Meals
            </span>
            Efficiently
          </h1>
          
          <p className="text-xl md:text-2xl text-primary-foreground/80 mb-12 max-w-3xl mx-auto leading-relaxed">
            Complete solution for mess management with QR attendance, menu tracking, 
            feedback system, and automated billing. Perfect for students and administrators.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <HeroButton 
              variant="hero" 
              size="lg" 
              onClick={() => navigate('/login')}
              className="min-w-[200px]"
            >
              Get Started
              <ArrowRight className="h-5 w-5" />
            </HeroButton>
            <HeroButton 
              variant="outline" 
              size="lg"
              onClick={() => navigate('/login')}
              className="min-w-[200px]"
            >
              Admin Login
            </HeroButton>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 px-4 bg-background/5 backdrop-blur-sm">
        <div className="container mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-primary-foreground mb-4">
              Everything You Need
            </h2>
            <p className="text-xl text-primary-foreground/80 max-w-2xl mx-auto">
              Comprehensive features designed to make mess management seamless and efficient
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <Card key={index} className="bg-background/10 backdrop-blur-sm border-primary-foreground/20 shadow-glow hover:shadow-elegant transition-all duration-300 hover:scale-[1.02]">
                <CardContent className="p-8 text-center">
                  <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-primary rounded-2xl mb-6 shadow-glow">
                    <feature.icon className="h-8 w-8 text-primary-foreground" />
                  </div>
                  <h3 className="text-xl font-semibold text-primary-foreground mb-3">
                    {feature.title}
                  </h3>
                  <p className="text-primary-foreground/70 leading-relaxed">
                    {feature.description}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4">
        <div className="container mx-auto text-center">
          <div className="bg-background/10 backdrop-blur-sm rounded-3xl p-12 border border-primary-foreground/20 shadow-elegant">
            <h2 className="text-4xl md:text-5xl font-bold text-primary-foreground mb-6">
              Ready to Get Started?
            </h2>
            <p className="text-xl text-primary-foreground/80 mb-8 max-w-2xl mx-auto">
              Join thousands of users who are already managing their mess meals efficiently
            </p>
            <HeroButton 
              variant="hero" 
              size="lg" 
              onClick={() => navigate('/login')}
              className="min-w-[250px]"
            >
              Start Managing Today
              <ArrowRight className="h-5 w-5" />
            </HeroButton>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Index;
