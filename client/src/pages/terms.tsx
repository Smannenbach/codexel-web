import Navigation from '@/components/ui/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Scale, FileText, AlertCircle, Ban, DollarSign, ShieldCheck, Gavel, Users } from 'lucide-react';

export default function Terms() {
  const sections = [
    {
      icon: FileText,
      title: 'Agreement to Terms',
      content: `By accessing or using Codexel.ai, you agree to be bound by these Terms of Service. If you disagree with any part of these terms, you may not access our service.

These terms apply to all users, including but not limited to:
• Individual developers
• Teams and organizations
• Trial and paid subscribers
• API users and integrators`
    },
    {
      icon: Users,
      title: 'User Accounts',
      content: `Account Responsibilities:
• You must provide accurate and complete information
• You are responsible for maintaining account security
• You must be at least 18 years old to use our service
• One person or legal entity may maintain no more than one free account

Account Termination:
• You may terminate your account at any time
• We reserve the right to suspend or terminate accounts that violate these terms`
    },
    {
      icon: ShieldCheck,
      title: 'Acceptable Use',
      content: `You agree not to use Codexel.ai to:
• Violate any laws or regulations
• Infringe on intellectual property rights
• Transmit malicious code or viruses
• Attempt to gain unauthorized access to our systems
• Use our service for illegal activities
• Harass, abuse, or harm others
• Create competing services using our platform
• Overload our infrastructure with excessive requests`
    },
    {
      icon: DollarSign,
      title: 'Payment Terms',
      content: `Subscription Billing:
• Subscriptions are billed monthly or annually
• All fees are non-refundable except as required by law
• Prices may change with 30 days notice
• You authorize us to charge your payment method on a recurring basis

Free Trial:
• New users may be eligible for a free trial
• Credit card required for trial activation
• Automatic conversion to paid plan unless cancelled`
    },
    {
      icon: AlertCircle,
      title: 'Intellectual Property',
      content: `Your Content:
• You retain all rights to code and content you create
• You grant us a license to host and display your content
• You are responsible for your content's legality

Our Property:
• Codexel.ai and its features are protected by copyright and trademark
• You may not copy, modify, or reverse engineer our service
• Our AI models and algorithms remain our proprietary technology`
    },
    {
      icon: Ban,
      title: 'Limitation of Liability',
      content: `To the maximum extent permitted by law:
• Codexel.ai is provided "as is" without warranties
• We are not liable for indirect, incidental, or consequential damages
• Our total liability is limited to the amount you paid us in the past 12 months
• We do not guarantee uninterrupted or error-free service

You acknowledge that AI-generated code may contain errors and should be reviewed before use in production environments.`
    },
    {
      icon: Gavel,
      title: 'Governing Law',
      content: `These Terms are governed by the laws of California, USA, without regard to conflict of law principles. Any disputes will be resolved in the courts of San Francisco County, California.

For users outside the United States, your local laws may provide additional rights that cannot be waived by these terms.`
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-950 via-purple-950/20 to-gray-950">
      <Navigation />
      
      <div className="container mx-auto px-4 py-16">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <h1 className="text-4xl font-bold mb-4 bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
              Terms of Service
            </h1>
            <p className="text-gray-400">
              Effective Date: {new Date().toLocaleDateString()}
            </p>
          </div>

          <Card className="backdrop-blur-xl bg-white/5 border-white/10 mb-8">
            <CardContent className="p-6">
              <p className="text-gray-300 leading-relaxed">
                Welcome to Codexel.ai. These Terms of Service ("Terms") govern your use of our AI-powered development platform. By using our services, you agree to these terms. Please read them carefully.
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

          <Card className="backdrop-blur-xl bg-purple-900/20 border-purple-500/20 mt-8">
            <CardHeader>
              <CardTitle className="text-white">Questions?</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-300">
                If you have any questions about these Terms of Service, please contact our legal team at:
              </p>
              <p className="mt-2 text-purple-400">legal@codexel.ai</p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}