import Navigation from '@/components/ui/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Shield, Lock, Eye, Server, UserCheck, Mail, Clock, Globe } from 'lucide-react';

export default function Privacy() {
  const sections = [
    {
      icon: Shield,
      title: 'Information We Collect',
      content: `We collect information you provide directly to us, such as when you create an account, use our services, or contact us. This includes:
      • Account information (name, email, password)
      • Project data and code you create
      • Usage data and analytics
      • Payment information (processed securely through Stripe)`
    },
    {
      icon: Lock,
      title: 'How We Use Your Information',
      content: `We use the information we collect to:
      • Provide, maintain, and improve our services
      • Process transactions and send related information
      • Send technical notices and support messages
      • Respond to your comments and questions
      • Develop new features and services`
    },
    {
      icon: Eye,
      title: 'Information Sharing',
      content: `We do not sell, trade, or rent your personal information. We may share your information:
      • With your consent
      • To comply with legal obligations
      • To protect our rights and prevent fraud
      • With service providers who assist our operations`
    },
    {
      icon: Server,
      title: 'Data Security',
      content: `We implement appropriate technical and organizational measures to protect your data:
      • Encryption in transit and at rest
      • Regular security audits
      • Access controls and authentication
      • Secure data centers with 24/7 monitoring`
    },
    {
      icon: UserCheck,
      title: 'Your Rights',
      content: `You have the right to:
      • Access your personal information
      • Correct inaccurate data
      • Request deletion of your data
      • Export your data
      • Opt-out of marketing communications`
    },
    {
      icon: Globe,
      title: 'International Data Transfers',
      content: `Your information may be transferred to and processed in countries other than your own. We ensure appropriate safeguards are in place to protect your information in accordance with this privacy policy.`
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-950 via-purple-950/20 to-gray-950">
      <Navigation />
      
      <div className="container mx-auto px-4 py-16">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <h1 className="text-4xl font-bold mb-4 bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
              Privacy Policy
            </h1>
            <p className="text-gray-400">
              Last updated: {new Date().toLocaleDateString()}
            </p>
          </div>

          <Card className="backdrop-blur-xl bg-white/5 border-white/10 mb-8">
            <CardContent className="p-6">
              <p className="text-gray-300 leading-relaxed">
                At Codexel.ai, we take your privacy seriously. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you use our AI-powered development platform. Please read this policy carefully to understand our views and practices regarding your personal data.
              </p>
            </CardContent>
          </Card>

          <div className="space-y-6">
            {sections.map((section, index) => (
              <Card key={index} className="backdrop-blur-xl bg-white/5 border-white/10 hover:bg-white/10 transition-colors">
                <CardHeader>
                  <CardTitle className="flex items-center gap-3 text-white">
                    <section.icon className="w-5 h-5 text-purple-400" />
                    {section.title}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-300 whitespace-pre-line">
                    {section.content}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>

          <Card className="backdrop-blur-xl bg-white/5 border-white/10 mt-8">
            <CardHeader>
              <CardTitle className="flex items-center gap-3 text-white">
                <Mail className="w-5 h-5 text-purple-400" />
                Contact Us
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-300">
                If you have any questions about this Privacy Policy, please contact us at:
              </p>
              <div className="mt-4 space-y-2 text-gray-400">
                <p>Email: privacy@codexel.ai</p>
                <p>Address: 123 AI Street, San Francisco, CA 94105</p>
                <p>Phone: +1 (555) 123-4567</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}