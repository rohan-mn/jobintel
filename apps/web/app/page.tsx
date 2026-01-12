"use client"

import { useState, useEffect } from 'react';
import { BarChart3, Zap, TrendingUp, Shield, Globe, Users, ArrowRight, Sparkles } from 'lucide-react';

export default function Home() {
  const [typedText, setTypedText] = useState('');
  const [isDeleting, setIsDeleting] = useState(false);
  const [loopNum, setLoopNum] = useState(0);
  const [scrollY, setScrollY] = useState(0);

  const phrases = [
    'Real-Time Insights',
    'Market Intelligence',
    'Strategic Advantage',
    'Career Opportunities'
  ];

  useEffect(() => {
    const handleScroll = () => setScrollY(window.scrollY);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    const currentPhrase = phrases[loopNum % phrases.length];
    const typingSpeed = isDeleting ? 50 : 100;
    const pauseEnd = 2000;

    const timer = setTimeout(() => {
      if (!isDeleting && typedText === currentPhrase) {
        setTimeout(() => setIsDeleting(true), pauseEnd);
      } else if (isDeleting && typedText === '') {
        setIsDeleting(false);
        setLoopNum(loopNum + 1);
      } else {
        setTypedText(
          isDeleting
            ? currentPhrase.substring(0, typedText.length - 1)
            : currentPhrase.substring(0, typedText.length + 1)
        );
      }
    }, typingSpeed);

    return () => clearTimeout(timer);
  }, [typedText, isDeleting, loopNum]);

  const features = [
    {
      icon: Zap,
      title: 'Real-Time Analytics',
      description: 'Access live job market data updated every minute to stay ahead of trends'
    },
    {
      icon: TrendingUp,
      title: 'Predictive Insights',
      description: 'AI-powered forecasting to anticipate market shifts before they happen'
    },
    {
      icon: Shield,
      title: 'Enterprise Security',
      description: 'Bank-level encryption and compliance with SOC 2 Type II standards'
    },
    {
      icon: Globe,
      title: 'Global Coverage',
      description: 'Track opportunities across 150+ countries and 50+ industries'
    },
    {
      icon: Users,
      title: 'Talent Mapping',
      description: 'Identify skill gaps and emerging talent pools with precision'
    },
    {
      icon: BarChart3,
      title: 'Custom Dashboards',
      description: 'Build personalized views with drag-and-drop analytics widgets'
    }
  ];

  const stats = [
    { value: '10M+', label: 'Jobs Tracked Daily' },
    { value: '99.9%', label: 'Uptime SLA' },
    { value: '<50ms', label: 'Query Response' },
    { value: '500+', label: 'Enterprise Clients' }
  ];

  return (
    <div className="min-h-screen bg-black text-white">
      {/* Animated Background Grid */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute inset-0 opacity-20"
          style={{
            backgroundImage: `linear-gradient(rgba(255,255,255,0.03) 1px, transparent 1px),
                            linear-gradient(90deg, rgba(255,255,255,0.03) 1px, transparent 1px)`,
            backgroundSize: '50px 50px',
            transform: `translateY(${scrollY * 0.3}px)`
          }}
        />
      </div>

      {/* Navigation */}
      <nav className="relative z-10 border-b border-gray-800 backdrop-blur-sm bg-black/50">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Sparkles className="w-6 h-6 text-white" />
            <span className="text-xl font-bold tracking-tight">JobIntel</span>
          </div>
          <div className="flex items-center gap-8">
            <a href="/dashboard" className="text-gray-400 hover:text-white transition-colors text-sm font-medium">
              Dashboard
            </a>
            <a href="/jobs" className="text-gray-400 hover:text-white transition-colors text-sm font-medium">
              Jobs
            </a>
            <button className="px-6 py-2 bg-white text-black rounded-lg font-semibold hover:bg-gray-200 transition-all hover:scale-105">
              Get Started
            </button>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative z-10 max-w-7xl mx-auto px-6 pt-32 pb-24">
        <div className="text-center space-y-8">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-gray-900 rounded-full border border-gray-800 animate-fade-in">
            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
            <span className="text-sm text-gray-400">Live Market Data Available</span>
          </div>
          
          <h1 className="text-7xl font-bold tracking-tight leading-tight">
            Intelligence for the
            <br />
            <span className="bg-gradient-to-r from-white via-gray-300 to-gray-500 bg-clip-text text-transparent">
              Modern Workforce
            </span>
          </h1>

          <div className="h-16 flex items-center justify-center">
            <p className="text-2xl text-gray-400">
              Unlock{' '}
              <span className="text-white font-semibold border-r-2 border-white pr-1">
                {typedText}
              </span>
            </p>
          </div>

          <p className="text-xl text-gray-500 max-w-3xl mx-auto leading-relaxed">
            Transform job market chaos into strategic clarity. JobIntel delivers enterprise-grade 
            intelligence that empowers organizations to make data-driven talent decisions.
          </p>

          <div className="flex items-center justify-center gap-4 pt-4">
            <button className="group px-8 py-4 bg-white text-black rounded-lg font-semibold hover:bg-gray-200 transition-all flex items-center gap-2 hover:gap-3">
              Start Free Trial
              <ArrowRight className="w-5 h-5 transition-all" />
            </button>
            <button className="px-8 py-4 border border-gray-700 rounded-lg font-semibold hover:bg-gray-900 transition-all">
              Book a Demo
            </button>
          </div>
        </div>

        {/* Stats Bar */}
        <div className="grid grid-cols-4 gap-8 mt-24 pt-16 border-t border-gray-800">
          {stats.map((stat, i) => (
            <div key={i} className="text-center group cursor-default">
              <div className="text-4xl font-bold mb-2 group-hover:scale-110 transition-transform">
                {stat.value}
              </div>
              <div className="text-sm text-gray-500">{stat.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* Features Grid */}
      <section className="relative z-10 max-w-7xl mx-auto px-6 py-24">
        <div className="text-center mb-16">
          <h2 className="text-5xl font-bold mb-4">Built for Enterprise Scale</h2>
          <p className="text-xl text-gray-500">
            Comprehensive tools designed for organizations that demand excellence
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          {features.map((feature, i) => (
            <div
              key={i}
              className="group p-8 bg-gradient-to-b from-gray-900 to-black border border-gray-800 rounded-2xl hover:border-gray-600 transition-all hover:scale-105 cursor-default"
              style={{ animationDelay: `${i * 100}ms` }}
            >
              <div className="w-12 h-12 bg-white rounded-lg flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                <feature.icon className="w-6 h-6 text-black" />
              </div>
              <h3 className="text-xl font-semibold mb-3">{feature.title}</h3>
              <p className="text-gray-400 leading-relaxed">{feature.description}</p>
            </div>
          ))}
        </div>
      </section>

      {/* CTA Section */}
      <section className="relative z-10 max-w-7xl mx-auto px-6 py-24">
        <div className="bg-gradient-to-r from-gray-900 via-gray-800 to-gray-900 rounded-3xl p-16 text-center border border-gray-700 relative overflow-hidden">
          <div className="absolute inset-0 opacity-10"
            style={{
              backgroundImage: `radial-gradient(circle at 2px 2px, white 1px, transparent 0)`,
              backgroundSize: '32px 32px'
            }}
          />
          <div className="relative z-10">
            <h2 className="text-5xl font-bold mb-6">Ready to Transform Your Strategy?</h2>
            <p className="text-xl text-gray-400 mb-8 max-w-2xl mx-auto">
              Join hundreds of forward-thinking organizations using JobIntel to stay ahead of the market
            </p>
            <button className="group px-10 py-5 bg-white text-black rounded-lg font-bold text-lg hover:bg-gray-200 transition-all flex items-center gap-3 mx-auto hover:gap-4">
              Get Started Today
              <ArrowRight className="w-6 h-6 transition-all" />
            </button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="relative z-10 border-t border-gray-800 mt-24">
        <div className="max-w-7xl mx-auto px-6 py-12">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-gray-400" />
              <span className="text-gray-400">© 2026 JobIntel. All rights reserved.</span>
            </div>
            <div className="flex gap-8 text-sm text-gray-400">
              <a href="#" className="hover:text-white transition-colors">Privacy</a>
              <a href="#" className="hover:text-white transition-colors">Terms</a>
              <a href="#" className="hover:text-white transition-colors">Contact</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}