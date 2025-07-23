import { Link, useLocation } from 'wouter';
import { Button } from '@/components/ui/button';
import { 
  Menu, 
  X, 
  Zap,
  FileText,
  Shield,
  Scale,
  Info
} from 'lucide-react';
import { useState } from 'react';

export default function Navigation() {
  const [location] = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navItems = [
    { href: '/templates', label: 'Templates' },
    { href: '/demo', label: 'Demo' },
    { href: '/workspace', label: 'Workspace' },
  ];

  const legalItems = [
    { href: '/privacy', label: 'Privacy Policy', icon: Shield },
    { href: '/terms', label: 'Terms of Service', icon: Scale },
    { href: '/disclosures', label: 'Disclosures', icon: FileText },
  ];

  return (
    <nav className="sticky top-0 z-50 w-full border-b backdrop-blur-xl bg-white/5 dark:bg-gray-900/5">
      <div className="container mx-auto px-4">
        <div className="flex h-16 items-center justify-between">
          {/* Logo */}
          <div className="flex items-center">
            <Link href="/" className="flex items-center space-x-2 hover:opacity-80 transition-opacity">
              <Zap className="h-8 w-8 text-purple-500" />
              <span className="text-xl font-bold bg-gradient-to-r from-purple-500 to-pink-500 bg-clip-text text-transparent">
                Codexel.ai
              </span>
            </Link>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-8">
            {navItems.map(item => (
              <Link key={item.href} href={item.href} className={`text-sm font-medium transition-colors hover:text-purple-500 ${
                location === item.href ? 'text-purple-500' : 'text-gray-300'
              }`}>
                {item.label}
              </Link>
            ))}
          </div>

          {/* Desktop Legal Links */}
          <div className="hidden md:flex items-center space-x-6">
            {legalItems.map(item => (
              <Link key={item.href} href={item.href} className="text-xs text-gray-400 hover:text-gray-300 transition-colors flex items-center gap-1">
                <item.icon className="w-3 h-3" />
                {item.label}
              </Link>
            ))}
            <Link href="/workspace">
              <Button className="ml-4">
                Get Started
              </Button>
            </Link>
          </div>

          {/* Mobile Menu Button */}
          <button
            className="md:hidden"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            {mobileMenuOpen ? (
              <X className="h-6 w-6" />
            ) : (
              <Menu className="h-6 w-6" />
            )}
          </button>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden py-4 space-y-2">
            {navItems.map(item => (
              <Link key={item.href} href={item.href} className={`block py-2 text-sm font-medium transition-colors hover:text-purple-500 ${
                location === item.href ? 'text-purple-500' : 'text-gray-300'
              }`}>
                {item.label}
              </Link>
            ))}
            <div className="border-t pt-4 mt-4 space-y-2">
              {legalItems.map(item => (
                <Link key={item.href} href={item.href} className="flex items-center gap-2 py-2 text-xs text-gray-400 hover:text-gray-300 transition-colors">
                  <item.icon className="w-3 h-3" />
                  {item.label}
                </Link>
              ))}
            </div>
            <Link href="/workspace">
              <Button className="w-full mt-4">
                Get Started
              </Button>
            </Link>
          </div>
        )}
      </div>
    </nav>
  );
}