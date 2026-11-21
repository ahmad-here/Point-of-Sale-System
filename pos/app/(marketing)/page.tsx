'use client';

import { useRouter } from 'next/navigation';
import Button from '@/components/button';
import { BarChart3, ShoppingCart, TrendingUp, Zap, Globe, Lock } from 'lucide-react';
import zlogo from '@/public/zlogo.png'

interface FeatureItem {
  icon: React.ReactNode;
  title: string;
  description: string;
}

export default function Home() {
  const router = useRouter();

  const features: FeatureItem[] = [
    {
      icon: <BarChart3 className="w-6 h-6" />,
      title: 'Real-time Analytics',
      description: 'Track sales, revenue, and customer insights with powerful analytics dashboards.',
    },
    {
      icon: <ShoppingCart className="w-6 h-6" />,
      title: 'Inventory Management',
      description: 'Manage stock levels, track products, and automate reorder processes.',
    },
    {
      icon: <TrendingUp className="w-6 h-6" />,
      title: 'Sales Tracking',
      description: 'Monitor sales performance and customer transactions in real-time.',
    },
    {
      icon: <Zap className="w-6 h-6" />,
      title: 'Fast & Reliable',
      description: 'Lightning-fast transaction processing with 99.9% uptime guarantee.',
    },
    {
      icon: <Globe className="w-6 h-6" />,
      title: 'Multi-channel',
      description: 'Accept payments through credit cards, cash, and digital wallets.',
    },
    {
      icon: <Lock className="w-6 h-6" />,
      title: 'Secure',
      description: 'Enterprise-grade security to protect your business and customer data.',
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#fffcf2] via-[#ccc5b9]/30 to-[#fffcf2] text-[#252422]">
      {/* Navigation */}
      <nav className="fixed top-0 w-full z-50 bg-[#fffcf2]/80 backdrop-blur-md border-b border-[#ccc5b9]/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-2">
              <div className="flex h-12 w-12 items-center justify-center">
                <img src={zlogo.src} alt="TOSPOS Logo" />
              </div>
              <span className="text-xl font-bold text-[#252422]">TOSPOS</span>
            </div>
            <div className="hidden md:flex items-center gap-8">
              <a href="#features" className="text-[#403d39] hover:text-[#eb5e28] transition">Features</a>
              <a href="#pricing" className="text-[#403d39] hover:text-[#eb5e28] transition">Pricing</a>
              <a href="#contact" className="text-[#403d39] hover:text-[#eb5e28] transition">Contact</a>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="pt-32 pb-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-5xl mx-auto text-center">
          <h1 className="text-5xl md:text-7xl font-bold mb-6 bg-gradient-to-r from-[#252422] via-[#403d39] to-[#eb5e28] bg-clip-text text-transparent">
            Transform Your Business with TOSPOS
          </h1>
          <p className="text-xl text-[#403d39] mb-8 max-w-2xl mx-auto">
            A complete Point of Sale system designed to streamline your business operations, 
            boost sales, and provide real-time insights into your performance.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button
              size="lg"
              variant="primary"
              onClick={() => router.push('/dashboard')}
              className="w-full sm:w-auto"
            >
              Get Started Now
            </Button>
            <Button
              size="lg"
              variant="secondary"
              onClick={() => {
                document.getElementById('features')?.scrollIntoView({ behavior: 'smooth' });
              }}
              className="w-full sm:w-auto"
            >
              Learn More
            </Button>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 border-y border-[#ccc5b9]/30">
        <div className="max-w-5xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="text-4xl font-bold text-[#eb5e28] mb-2">10K+</div>
              <p className="text-[#403d39]">Active Users</p>
            </div>
            <div className="text-center">
              <div className="text-4xl font-bold text-[#eb5e28] mb-2">$50M+</div>
              <p className="text-[#403d39]">Processed Annually</p>
            </div>
            <div className="text-center">
              <div className="text-4xl font-bold text-[#eb5e28] mb-2">99.9%</div>
              <p className="text-[#403d39]">Uptime SLA</p>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold mb-4 text-[#252422]">Powerful Features</h2>
            <p className="text-xl text-[#403d39] max-w-2xl mx-auto">
              Everything you need to run your business efficiently and grow your sales
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, idx) => (
              <div
                key={idx}
                className="p-6 rounded-xl bg-gradient-to-br from-[#fffcf2] to-[#ccc5b9]/20 border border-[#ccc5b9]/30 hover:border-[#eb5e28]/50 transition-all duration-300 hover:shadow-lg hover:shadow-[#eb5e28]/10"
              >
                <div className="p-3 w-fit bg-[#eb5e28]/20 rounded-lg text-[#eb5e28] mb-4">
                  {feature.icon}
                </div>
                <h3 className="text-lg font-semibold text-[#252422] mb-2">{feature.title}</h3>
                <p className="text-[#403d39]">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-r from-[#eb5e28]/10 to-[#d94a1f]/10 border-y border-[#ccc5b9]/30">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-4xl font-bold mb-4 text-[#252422]">Ready to get started?</h2>
          <p className="text-xl text-[#403d39] mb-8">
            Join thousands of businesses already using TOSPOS to grow their sales and streamline operations.
          </p>
          <Button
            size="lg"
            variant="primary"
            onClick={() => router.push('/dashboard')}
          >
            Launch Your POS System
          </Button>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-[#ccc5b9]/30 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-5xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
            <div>
              <h4 className="font-semibold text-[#252422] mb-4">Product</h4>
              <ul className="space-y-2 text-[#403d39]">
                <li><a href="#" className="hover:text-[#eb5e28] transition">Features</a></li>
                <li><a href="#" className="hover:text-[#eb5e28] transition">Pricing</a></li>
                <li><a href="#" className="hover:text-[#eb5e28] transition">Security</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold text-[#252422] mb-4">Company</h4>
              <ul className="space-y-2 text-[#403d39]">
                <li><a href="#" className="hover:text-[#eb5e28] transition">About</a></li>
                <li><a href="#" className="hover:text-[#eb5e28] transition">Blog</a></li>
                <li><a href="#" className="hover:text-[#eb5e28] transition">Careers</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold text-[#252422] mb-4">Resources</h4>
              <ul className="space-y-2 text-[#403d39]">
                <li><a href="#" className="hover:text-[#eb5e28] transition">Documentation</a></li>
                <li><a href="#" className="hover:text-[#eb5e28] transition">Support</a></li>
                <li><a href="#" className="hover:text-[#eb5e28] transition">Community</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold text-[#252422] mb-4">Legal</h4>
              <ul className="space-y-2 text-[#403d39]">
                <li><a href="#" className="hover:text-[#eb5e28] transition">Privacy</a></li>
                <li><a href="#" className="hover:text-[#eb5e28] transition">Terms</a></li>
                <li><a href="#" className="hover:text-[#eb5e28] transition">Cookies</a></li>
              </ul>
            </div>
          </div>

          <div className="border-t border-[#ccc5b9]/30 pt-8">
            <div className="flex flex-col md:flex-row items-center justify-between">
              <p className="text-[#403d39] text-sm">
                &copy; 2024 TOSPOS. All rights reserved.
              </p>
              <div className="flex gap-4 mt-4 md:mt-0">
                <a href="#" className="text-[#403d39] hover:text-[#eb5e28] transition">Twitter</a>
                <a href="#" className="text-[#403d39] hover:text-[#eb5e28] transition">GitHub</a>
                <a href="#" className="text-[#403d39] hover:text-[#eb5e28] transition">LinkedIn</a>
              </div>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
