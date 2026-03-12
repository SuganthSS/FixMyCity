import React from 'react';
import { Link } from 'react-router-dom';
import { 
  AlertCircle, 
  Camera, 
  Search, 
  CheckCircle2, 
  ArrowRight, 
  Shield, 
  Users, 
  BarChart3, 
  Clock,
  MapPin,
  MessageSquare,
  HelpCircle
} from 'lucide-react';
import { Button, Card, Badge } from '../components/UI';
import { motion } from 'motion/react';

export const LandingPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-[#FDFDFD]">
      {/* Navigation */}
      <nav className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-bottom border-zinc-100 px-6 py-4">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-[#F27D26] rounded-lg flex items-center justify-center">
              <AlertCircle className="text-white w-5 h-5" />
            </div>
            <span className="text-xl font-bold text-zinc-900 tracking-tight">FixMyCity</span>
          </div>
          <div className="flex items-center gap-4">
            <Link to="/login">
              <Button variant="ghost">Login</Button>
            </Link>
            <Link to="/register">
              <Button>Register</Button>
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative pt-20 pb-32 overflow-hidden">
        <div className="max-w-7xl mx-auto px-6">
          <div className="max-w-3xl mx-auto text-center">
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              <Badge variant="UNDER_REVIEW" className="mb-6">Public Beta</Badge>
              <h1 className="text-5xl lg:text-6xl font-bold text-zinc-900 leading-[1.1] mb-6">
                FixMyCity – Smart Civic Issue Reporting Platform
              </h1>
              <p className="text-xl text-zinc-600 mb-10 leading-relaxed">
                Report infrastructure issues in your city such as potholes, broken streetlights, garbage problems, or water leaks. Track the progress of your complaint and help keep your city clean.
              </p>
              <div className="flex flex-wrap justify-center gap-4">
                <Link to="/login">
                  <Button size="lg" className="h-14 px-8 text-lg">
                    Get Started
                    <ArrowRight className="ml-2 w-5 h-5" />
                  </Button>
                </Link>
                <Link to="/register">
                  <Button variant="outline" size="lg" className="h-14 px-8 text-lg">
                    Create Account
                  </Button>
                </Link>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-24 bg-zinc-50">
        <div className="max-w-7xl mx-auto px-6 text-center">
          <h2 className="text-3xl font-bold text-zinc-900 mb-16">How It Works</h2>
          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                icon: <Camera className="w-8 h-8 text-[#F27D26]" />,
                title: "Report Issue",
                desc: "Upload photo and describe the problem."
              },
              {
                icon: <Search className="w-8 h-8 text-[#F27D26]" />,
                title: "Track Progress",
                desc: "Monitor complaint lifecycle from submission to resolution."
              },
              {
                icon: <CheckCircle2 className="w-8 h-8 text-[#F27D26]" />,
                title: "City Action",
                desc: "Authorities review and resolve the issue."
              }
            ].map((step, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="relative"
              >
                <div className="bg-white p-8 rounded-2xl border border-zinc-100 shadow-sm">
                  <div className="w-16 h-16 bg-orange-50 rounded-2xl flex items-center justify-center mx-auto mb-6">
                    {step.icon}
                  </div>
                  <h3 className="text-xl font-bold text-zinc-900 mb-3">{step.title}</h3>
                  <p className="text-zinc-600">{step.desc}</p>
                </div>
                {i < 2 && (
                  <div className="hidden md:block absolute top-1/2 -right-4 -translate-y-1/2 z-10">
                    <ArrowRight className="w-6 h-6 text-zinc-300" />
                  </div>
                )}
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-24">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-zinc-900 mb-4">Platform Features</h2>
            <p className="text-zinc-600 max-w-2xl mx-auto">
              Built with modern technology to ensure efficient civic management and community engagement.
            </p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              {
                icon: <BarChart3 className="w-6 h-6" />,
                title: "AI-powered classification",
                desc: "Smart categorization of issues for faster routing."
              },
              {
                icon: <Clock className="w-6 h-6" />,
                title: "Real-time tracking",
                desc: "Live updates on your complaint status."
              },
              {
                icon: <Shield className="w-6 h-6" />,
                title: "Admin management",
                desc: "Powerful tools for city officials to manage tasks."
              },
              {
                icon: <Users className="w-6 h-6" />,
                title: "Community transparency",
                desc: "Public dashboard for city-wide awareness."
              }
            ].map((feature, i) => (
              <Card key={i} className="p-6 hover:border-orange-200 transition-colors">
                <div className="w-12 h-12 bg-zinc-50 rounded-xl flex items-center justify-center mb-4 text-[#F27D26]">
                  {feature.icon}
                </div>
                <h3 className="font-bold text-zinc-900 mb-2">{feature.title}</h3>
                <p className="text-sm text-zinc-600 leading-relaxed">{feature.desc}</p>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Complaint Lifecycle */}
      <section className="py-24 bg-zinc-900 text-white overflow-hidden">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold mb-4">Complaint Lifecycle</h2>
            <p className="text-zinc-400">Transparent process from submission to resolution</p>
          </div>
          <div className="flex flex-wrap justify-center gap-4">
            {['SUBMITTED', 'UNDER_REVIEW', 'ASSIGNED', 'IN_PROGRESS', 'RESOLVED'].map((status, i) => (
              <motion.div
                key={status}
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="flex items-center"
              >
                <div className="flex flex-col items-center gap-3">
                  <Badge variant={status} className="px-6 py-2 text-sm uppercase tracking-wider">
                    {status.replace('_', ' ')}
                  </Badge>
                  {i < 4 && <div className="h-8 w-px bg-zinc-800 md:hidden" />}
                </div>
                {i < 4 && (
                  <div className="hidden md:flex items-center px-4">
                    <div className="w-8 h-px bg-zinc-700" />
                  </div>
                )}
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Call to Action */}
      <section className="py-24">
        <div className="max-w-4xl mx-auto px-6">
          <Card className="bg-[#F27D26] p-12 text-center text-white relative overflow-hidden">
            <div className="absolute top-0 right-0 -translate-y-1/2 translate-x-1/2 w-64 h-64 bg-white/10 rounded-full blur-3xl" />
            <div className="relative z-10">
              <h2 className="text-4xl font-bold mb-6">Ready to make a difference?</h2>
              <p className="text-orange-50 text-lg mb-10 max-w-xl mx-auto">
                Join thousands of citizens helping to build a better city. Start reporting civic issues today.
              </p>
              <div className="flex flex-wrap justify-center gap-4">
                <Link to="/login">
                  <Button variant="secondary" size="lg" className="h-14 px-8 text-lg bg-white text-[#F27D26] hover:bg-orange-50">
                    Get Started
                  </Button>
                </Link>
                <Link to="/login">
                  <Button variant="outline" size="lg" className="h-14 px-8 text-lg border-white text-white hover:bg-white/10">
                    Report an Issue
                  </Button>
                </Link>
              </div>
            </div>
          </Card>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 border-t border-zinc-100">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid md:grid-cols-4 gap-12 mb-12">
            <div className="col-span-2">
              <div className="flex items-center gap-2 mb-6">
                <div className="w-8 h-8 bg-[#F27D26] rounded-lg flex items-center justify-center">
                  <AlertCircle className="text-white w-5 h-5" />
                </div>
                <span className="text-xl font-bold text-zinc-900 tracking-tight">FixMyCity</span>
              </div>
              <p className="text-zinc-500 max-w-sm">
                A smart platform for reporting and tracking civic issues, empowering citizens to improve their city's infrastructure.
              </p>
            </div>
            <div>
              <h4 className="font-bold text-zinc-900 mb-6">Platform</h4>
              <ul className="space-y-4 text-sm text-zinc-600">
                <li><Link to="/help" className="hover:text-[#F27D26] flex items-center gap-2"><HelpCircle className="w-4 h-4" /> Help / Guide</Link></li>
                <li><Link to="/map" className="hover:text-[#F27D26] flex items-center gap-2"><MapPin className="w-4 h-4" /> City Map</Link></li>
                <li><Link to="/maintenance" className="hover:text-[#F27D26] flex items-center gap-2"><Clock className="w-4 h-4" /> Maintenance</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="font-bold text-zinc-900 mb-6">Support</h4>
              <ul className="space-y-4 text-sm text-zinc-600">
                <li><Link to="/support" className="hover:text-[#F27D26] flex items-center gap-2"><MessageSquare className="w-4 h-4" /> Contact Support</Link></li>
                <li><Link to="/messages" className="hover:text-[#F27D26] flex items-center gap-2"><Users className="w-4 h-4" /> Community</Link></li>
              </ul>
            </div>
          </div>
          <div className="pt-8 border-t border-zinc-100 flex flex-col md:flex-row justify-between items-center gap-4 text-sm text-zinc-500">
            <p>© 2026 FixMyCity Platform. All rights reserved.</p>
            <div className="flex gap-8">
              <a href="#" className="hover:text-[#F27D26]">Privacy Policy</a>
              <a href="#" className="hover:text-[#F27D26]">Terms of Service</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};
