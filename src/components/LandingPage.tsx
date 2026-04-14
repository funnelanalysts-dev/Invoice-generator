import React from 'react';
import { Button } from './ui/button';
import { motion } from 'motion/react';
import { 
  FileText, 
  CheckCircle2, 
  Zap, 
  ShieldCheck, 
  ArrowRight, 
  BarChart3, 
  Download,
  Users,
  Star
} from 'lucide-react';

interface LandingPageProps {
  onSignIn: () => void;
}

export const LandingPage: React.FC<LandingPageProps> = ({ onSignIn }) => {
  const fadeIn = {
    initial: { opacity: 0, y: 20 },
    whileInView: { opacity: 1, y: 0 },
    viewport: { once: true, margin: "-100px" },
    transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1] }
  };

  const staggerContainer = {
    initial: {},
    whileInView: { transition: { staggerChildren: 0.1 } },
    viewport: { once: true, margin: "-100px" }
  };

  const staggerItem = {
    initial: { opacity: 0, y: 20 },
    whileInView: { opacity: 1, y: 0 },
    transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1] }
  };

  return (
    <div className="min-h-screen bg-background selection:bg-primary/20">
      {/* Navigation */}
      <nav className="fixed top-0 z-50 w-full border-b bg-background/80 backdrop-blur-md">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-2">
            <div className="rounded-lg bg-primary p-1.5">
              <FileText className="h-6 w-6 text-primary-foreground" />
            </div>
            <span className="text-xl font-bold tracking-tight">Invoicely</span>
          </div>
          <Button onClick={onSignIn} variant="ghost" className="font-medium">
            Sign In
          </Button>
        </div>
      </nav>

      {/* Hero Section (ATTENTION) */}
      <section className="relative pt-32 pb-20 lg:pt-48 lg:pb-32 overflow-hidden">
        <div className="absolute inset-0 -z-10 bg-[radial-gradient(45%_45%_at_50%_50%,var(--color-primary-10)_0%,transparent_100%)]" />
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
            >
              <h1 className="text-5xl font-extrabold tracking-tight text-foreground sm:text-7xl">
                Stop Chasing Payments. <br />
                <span className="text-primary">Start Growing Your Business.</span>
              </h1>
              <p className="mx-auto mt-6 max-w-2xl text-lg text-muted-foreground sm:text-xl">
                The professional invoicing platform designed for freelancers and small businesses. 
                Create, send, and track invoices in under 60 seconds.
              </p>
              <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
                <Button onClick={onSignIn} size="lg" className="h-12 px-8 text-base font-semibold shadow-lg shadow-primary/20">
                  Get Started for Free <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <CheckCircle2 className="h-4 w-4 text-primary" />
                  No credit card required
                </div>
              </div>
            </motion.div>

            {/* App Preview Mockup */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 40 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              transition={{ duration: 1, delay: 0.2, ease: [0.22, 1, 0.36, 1] }}
              className="mt-16 relative mx-auto max-w-5xl rounded-2xl border bg-card p-2 shadow-2xl"
            >
              <div className="rounded-xl border bg-background overflow-hidden">
                <img 
                  src="https://framerusercontent.com/images/bS92djlbMv8bJeC0HVOhy4XaOb8.png" 
                  alt="Invoicely Dashboard" 
                  className="w-full object-cover opacity-90"
                  referrerPolicy="no-referrer"
                />
              </div>
              <motion.div 
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 1, duration: 0.6 }}
                className="absolute -bottom-6 -right-6 hidden lg:block"
              >
                <div className="rounded-xl border bg-card p-4 shadow-xl animate-bounce-slow">
                  <div className="flex items-center gap-3">
                    <div className="rounded-full bg-green-500/10 p-2">
                      <CheckCircle2 className="h-6 w-6 text-green-500" />
                    </div>
                    <div>
                      <p className="text-sm font-bold">Payment Received</p>
                      <p className="text-xs text-muted-foreground">$1,250.00 from Acme Corp</p>
                    </div>
                  </div>
                </div>
              </motion.div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Features (INTEREST) */}
      <section className="py-24 bg-muted/30">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <motion.div 
            {...fadeIn}
            className="text-center mb-16"
          >
            <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">Everything you need to get paid faster</h2>
            <p className="mt-4 text-muted-foreground">Powerful features that take the headache out of billing.</p>
          </motion.div>
          
          <motion.div 
            variants={staggerContainer}
            initial="initial"
            whileInView="whileInView"
            viewport={{ once: true, margin: "-100px" }}
            className="grid gap-8 md:grid-cols-3"
          >
            {[
              {
                icon: <Zap className="h-6 w-6" />,
                title: "Lightning Fast Creation",
                description: "Generate professional invoices in seconds with our intuitive builder. Save clients and items for even faster billing."
              },
              {
                icon: <BarChart3 className="h-6 w-6" />,
                title: "Smart Analytics",
                description: "Track your revenue, pending payments, and business growth with real-time dashboard insights."
              },
              {
                icon: <Download className="h-6 w-6" />,
                title: "Premium PDF Exports",
                description: "Impress your clients with beautifully designed, professional PDF invoices that reflect your brand quality."
              }
            ].map((feature, i) => (
              <motion.div
                key={i}
                variants={staggerItem}
                whileHover={{ y: -5 }}
                className="rounded-2xl border bg-card p-8 shadow-sm transition-all hover:shadow-md"
              >
                <div className="mb-4 inline-flex rounded-xl bg-primary/10 p-3 text-primary">
                  {feature.icon}
                </div>
                <h3 className="mb-2 text-xl font-bold">{feature.title}</h3>
                <p className="text-muted-foreground leading-relaxed">{feature.description}</p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Social Proof (DESIRE) */}
      <section className="py-24">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid gap-12 lg:grid-cols-2 lg:items-center">
            <motion.div {...fadeIn}>
              <h2 className="text-3xl font-bold tracking-tight sm:text-4xl mb-6">
                Trusted by 5,000+ freelancers worldwide
              </h2>
              <motion.div 
                variants={staggerContainer}
                initial="initial"
                whileInView="whileInView"
                viewport={{ once: true }}
                className="space-y-6"
              >
                {[
                  "Automate your recurring billing cycle",
                  "Securely store all your financial data in the cloud",
                  "Access your dashboard from any device, anywhere",
                  "Customizable templates to match your brand"
                ].map((item, i) => (
                  <motion.div 
                    key={i} 
                    variants={staggerItem}
                    className="flex items-center gap-3"
                  >
                    <ShieldCheck className="h-5 w-5 text-primary" />
                    <span className="text-lg font-medium">{item}</span>
                  </motion.div>
                ))}
              </motion.div>
              <div className="mt-10 flex items-center gap-4">
                <div className="flex -space-x-2">
                  {[1, 2, 3, 4].map((i) => (
                    <img 
                      key={i}
                      src={`https://picsum.photos/seed/user${i}/100/100`} 
                      className="h-10 w-10 rounded-full border-2 border-background"
                      alt="User"
                      referrerPolicy="no-referrer"
                    />
                  ))}
                </div>
                <div className="text-sm">
                  <div className="flex text-yellow-500 mb-0.5">
                    {[1, 2, 3, 4, 5].map((i) => <Star key={i} className="h-4 w-4 fill-current" />)}
                  </div>
                  <p className="font-medium">4.9/5 rating from our community</p>
                </div>
              </div>
            </motion.div>
            <motion.div 
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
              className="relative"
            >
              <div className="aspect-square rounded-3xl bg-primary/5 p-8">
                <div className="h-full w-full rounded-2xl border bg-card p-6 shadow-inner flex flex-col justify-center">
                  <blockquote className="text-2xl font-medium italic text-foreground mb-6">
                    "Invoicely changed the way I handle my freelance business. I used to spend hours on spreadsheets, now it takes me minutes."
                  </blockquote>
                  <div className="flex items-center gap-4">
                    <img 
                      src="https://picsum.photos/seed/sarah/100/100" 
                      className="h-12 w-12 rounded-full"
                      alt="Sarah"
                      referrerPolicy="no-referrer"
                    />
                    <div>
                      <p className="font-bold">Sarah Jenkins</p>
                      <p className="text-sm text-muted-foreground">Creative Director at Studio Bloom</p>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* CTA (ACTION) */}
      <section className="py-24">
        <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
          <motion.div 
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
            className="rounded-3xl bg-primary px-8 py-16 text-center text-primary-foreground shadow-2xl shadow-primary/30"
          >
            <h2 className="text-3xl font-bold sm:text-5xl mb-6">Ready to get paid?</h2>
            <p className="mx-auto mb-10 max-w-xl text-lg opacity-90">
              Join thousands of professionals who have simplified their invoicing. 
              Start your free account today.
            </p>
            <Button onClick={onSignIn} size="lg" variant="secondary" className="h-14 px-10 text-lg font-bold">
              Create My First Invoice Now
            </Button>
            <p className="mt-6 text-sm opacity-70">
              Free forever for your first 3 clients.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t py-12">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col items-center justify-between gap-6 sm:flex-row">
            <div className="flex items-center gap-2">
              <FileText className="h-5 w-5 text-primary" />
              <span className="font-bold">Invoicely</span>
            </div>
            <p className="text-sm text-muted-foreground">
              © {new Date().getFullYear()} Invoicely Inc. All rights reserved.
            </p>
            <div className="flex gap-6">
              <a href="#" className="text-sm text-muted-foreground hover:text-foreground">Privacy</a>
              <a href="#" className="text-sm text-muted-foreground hover:text-foreground">Terms</a>
              <a href="#" className="text-sm text-muted-foreground hover:text-foreground">Contact</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};
