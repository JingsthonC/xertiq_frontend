import { Link } from "react-router-dom";
import {
  Shield,
  Zap,
  Palette,
  Lock,
  Smartphone,
  Target,
  EyeOff,
  CheckCircle,
  FileCheck,
  QrCode,
  Globe,
  Clock,
  Users,
  ChevronDown,
} from "lucide-react";
import { useState } from "react";
import xertiqLogo from "../assets/xertiq_logo.png";
import xertiqJumbotron from "../assets/xertiq_jumbotron.png";

const LandingPage = () => {
  const [activeFaq, setActiveFaq] = useState(null);

  const features = [
    {
      icon: <Shield size={40} className="text-[#3B82F6]" />,
      title: "Blockchain Secured",
      description:
        "Powered by Solana blockchain for immutable, tamper-proof verification of credentials.",
    },
    {
      icon: <Zap size={40} className="text-[#3B82F6]" />,
      title: "Lightning Fast",
      description:
        "Instant verification with no delays. Optimized for performance and speed.",
    },
    {
      icon: <Globe size={40} className="text-[#3B82F6]" />,
      title: "Easy Integration",
      description:
        "Simple embed on any website. Works with WordPress, Shopify, React, and more.",
    },
    {
      icon: <Smartphone size={40} className="text-[#3B82F6]" />,
      title: "Mobile Responsive",
      description:
        "Perfect experience across all devices - desktop, tablet, and mobile.",
    },
    {
      icon: <QrCode size={40} className="text-[#3B82F6]" />,
      title: "QR Code Support",
      description:
        "Quick verification through QR code scanning for instant document authentication.",
    },
    {
      icon: <EyeOff size={40} className="text-[#3B82F6]" />,
      title: "Holder Privacy Control",
      description:
        "Document holders can show or hide credentials, maintaining full privacy control.",
    },
  ];

  const whyChoose = [
    {
      title: "Single Source of Truth",
      description:
        "All document verifications centralized on the blockchain with immutable records.",
    },
    {
      title: "Zero Trust Architecture",
      description:
        "Cryptographic verification ensures authenticity without relying on intermediaries.",
    },
    {
      title: "Compliance Ready",
      description:
        "Built to meet verification standards and audit requirements for certified documents.",
    },
    {
      title: "Instant Verification",
      description:
        "Real-time blockchain lookup provides immediate verification results.",
    },
    {
      title: "Easy for Everyone",
      description:
        "Simple interface anyone can use - no blockchain knowledge required.",
    },
    {
      title: "Enterprise Grade",
      description:
        "Secure, scalable infrastructure that grows with your organization.",
    },
  ];

  const faqs = [
    {
      question: "How does blockchain verification work?",
      answer:
        "Each document is hashed and stored on the Solana blockchain. When someone verifies a document, we check its hash against the blockchain record to confirm authenticity. This makes verification tamper-proof and transparent.",
    },
    {
      question: "Can I verify documents without an account?",
      answer:
        "Yes! Anyone can verify documents using our public verification page. You only need an account if you want to issue certificates or manage document visibility.",
    },
    {
      question: "What types of documents can be verified?",
      answer:
        "XertiQ supports certificates, diplomas, licenses, transcripts, and any official document that needs blockchain-backed verification.",
    },
    {
      question: "How long does verification take?",
      answer:
        "Verification is instant! Our system checks the blockchain in real-time and provides results within seconds.",
    },
    {
      question: "Is my data secure?",
      answer:
        "Absolutely. We use bank-level encryption and blockchain technology. Document hashes (not the documents themselves) are stored on-chain, ensuring privacy and security.",
    },
    {
      question: "How much does it cost?",
      answer:
        "We offer flexible credit-based pricing. Purchase credits as you need them for document issuance. Verification is always free for everyone.",
    },
  ];

  const testimonials = [
    {
      name: "Alex Johnson",
      role: "HR Manager",
      initials: "AJ",
      quote:
        "The verification process is incredibly fast and reliable. It has streamlined our credential checking workflow.",
      rating: 5,
    },
    {
      name: "Sarah Chen",
      role: "Training Coordinator",
      initials: "SC",
      quote:
        "Easy to use and integrate. The blockchain verification gives us confidence in document authenticity.",
      rating: 5,
    },
    {
      name: "Michael Torres",
      role: "IT Administrator",
      initials: "MT",
      quote:
        "Setup was straightforward and the support team was helpful. Great solution for certificate management.",
      rating: 5,
    },
  ];

  const scrollToSection = (id) => {
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  };

  const toggleFaq = (index) => {
    setActiveFaq(activeFaq === index ? null : index);
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Navigation */}
      <nav className="sticky top-0 z-50 bg-white shadow-md">
        <div className="max-w-7xl mx-auto px-5 py-4 flex justify-between items-center">
          <a
            href="#"
            className="flex items-center gap-3 text-2xl font-bold text-[#2d3748] no-underline"
          >
            <img src={xertiqLogo} alt="XertiQ" className="h-10 w-auto" />
          </a>
          <div className="hidden md:flex gap-8">
            <button
              onClick={() => scrollToSection("features")}
              className="text-[#4a5568] font-medium hover:text-[#3B82F6] transition-colors cursor-pointer bg-transparent border-0"
            >
              Features
            </button>
            <button
              onClick={() => scrollToSection("demo")}
              className="text-[#4a5568] font-medium hover:text-[#3B82F6] transition-colors cursor-pointer bg-transparent border-0"
            >
              Live Demo
            </button>
            <button
              onClick={() => scrollToSection("how-it-works")}
              className="text-[#4a5568] font-medium hover:text-[#3B82F6] transition-colors cursor-pointer bg-transparent border-0"
            >
              How It Works
            </button>
            <button
              onClick={() => scrollToSection("docs")}
              className="text-[#4a5568] font-medium hover:text-[#3B82F6] transition-colors cursor-pointer bg-transparent border-0"
            >
              Docs
            </button>
          </div>
          <Link
            to="/login"
            className="bg-[#3B82F6] text-white px-6 py-2 rounded-full font-semibold hover:bg-[#2563EB] transition-all no-underline"
          >
            Sign In
          </Link>
        </div>
      </nav>

      {/* Hero Section */}
      <section
        className="bg-gradient-to-br from-[#3B82F6] to-[#8B5CF6] text-white py-24 px-5 text-center relative overflow-hidden"
        style={{
          backgroundImage: `linear-gradient(rgba(102, 126, 234, 0.85), rgba(118, 75, 162, 0.85)), url(${xertiqJumbotron})`,
          backgroundSize: "cover",
          backgroundPosition: "center",
        }}
      >
        <h1 className="text-5xl md:text-6xl font-bold mb-6 animate-[fadeInUp_0.8s]">
          Blockchain-Secured Document Verification
        </h1>
        <p className="text-xl md:text-2xl mb-8 opacity-95 animate-[fadeInUp_0.8s_0.2s_both]">
          Embed verification widgets on any website - just like HubSpot forms
        </p>
        <div className="flex gap-5 justify-center flex-wrap animate-[fadeInUp_0.8s_0.4s_both]">
          <button
            onClick={() => scrollToSection("demo")}
            className="bg-white text-[#3B82F6] px-8 py-4 rounded-full font-semibold text-base transition-all hover:-translate-y-0.5 hover:shadow-2xl border-0 cursor-pointer"
          >
            Try Live Demo
          </button>
          <Link
            to="/register"
            className="bg-transparent text-white px-8 py-4 rounded-full font-semibold text-base transition-all hover:bg-white hover:text-[#3B82F6] border-2 border-white no-underline"
          >
            Get Started
          </Link>
        </div>
      </section>

      {/* Why Choose XertiQ Section */}
      <section className="py-20 px-5 bg-white">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-4xl md:text-5xl font-bold mb-4 text-[#2d3748]">
              Why Businesses Choose XertiQ
            </h2>
            <p className="text-xl text-[#4a5568] max-w-3xl mx-auto">
              Built for organizations that need trust, transparency, and
              tamper-proof credential verification
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {whyChoose.map((item, index) => (
              <div
                key={index}
                className="bg-[#f7fafc] p-6 rounded-xl border border-[#e2e8f0]"
              >
                <div className="flex items-start gap-3">
                  <CheckCircle
                    size={24}
                    className="text-[#48bb78] flex-shrink-0 mt-1"
                  />
                  <div>
                    <h3 className="text-lg font-semibold text-[#2d3748] mb-2">
                      {item.title}
                    </h3>
                    <p className="text-[#4a5568] text-sm leading-relaxed">
                      {item.description}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-16 bg-gradient-to-br from-[#3B82F6]/10 to-[#8B5CF6]/10 rounded-2xl p-8 border border-[#3B82F6]/20">
            <h3 className="text-2xl font-bold text-[#2d3748] mb-6 text-center">
              Built with Security, Transparency, and Scale in Mind
            </h3>
            <div className="grid md:grid-cols-3 gap-8">
              <div className="text-center">
                <div className="text-3xl font-bold text-[#3B82F6] mb-2">
                  100%
                </div>
                <p className="text-[#4a5568]">Tamper-Proof Records</p>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-[#3B82F6] mb-2">
                  &lt;2s
                </div>
                <p className="text-[#4a5568]">Average Verification Time</p>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-[#3B82F6] mb-2">
                  24/7
                </div>
                <p className="text-[#4a5568]">Blockchain Availability</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-20 px-5 bg-[#f7fafc]">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-4xl md:text-5xl font-bold mb-4 text-[#2d3748]">
              What Our Users Say
            </h2>
            <p className="text-xl text-[#4a5568]">
              Feedback from our community
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {testimonials.map((testimonial, index) => (
              <div key={index} className="bg-white p-8 rounded-2xl shadow-lg">
                <div className="flex items-center gap-2 mb-4">
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <span key={i} className="text-yellow-400 text-xl">
                      ★
                    </span>
                  ))}
                </div>
                <p className="text-[#4a5568] mb-6 italic leading-relaxed">
                  "{testimonial.quote}"
                </p>
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-gradient-to-br from-[#3B82F6] to-[#8B5CF6] rounded-full flex items-center justify-center text-white font-bold">
                    {testimonial.initials}
                  </div>
                  <div>
                    <div className="font-semibold text-[#2d3748]">
                      {testimonial.name}
                    </div>
                    <div className="text-sm text-[#4a5568]">
                      {testimonial.role}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-20 px-5 bg-white">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-4xl md:text-5xl font-bold mb-4 text-[#2d3748]">
              Frequently Asked Questions
            </h2>
            <p className="text-xl text-[#4a5568]">
              Got questions? We've got answers.
            </p>
          </div>

          <div className="space-y-4">
            {faqs.map((faq, index) => (
              <div
                key={index}
                className="bg-[#f7fafc] rounded-xl overflow-hidden border border-[#e2e8f0]"
              >
                <button
                  onClick={() => toggleFaq(index)}
                  className="w-full p-6 text-left flex items-center justify-between hover:bg-[#edf2f7] transition-colors"
                >
                  <span className="font-semibold text-[#2d3748] pr-4">
                    {faq.question}
                  </span>
                  <ChevronDown
                    size={20}
                    className={`text-[#3B82F6] flex-shrink-0 transition-transform ${
                      activeFaq === index ? "rotate-180" : ""
                    }`}
                  />
                </button>
                {activeFaq === index && (
                  <div className="px-6 pb-6">
                    <p className="text-[#4a5568] leading-relaxed">
                      {faq.answer}
                    </p>
                  </div>
                )}
              </div>
            ))}
          </div>

          <div className="mt-12 text-center bg-gradient-to-br from-[#3B82F6]/10 to-[#8B5CF6]/10 rounded-2xl p-8 border border-[#3B82F6]/20">
            <h3 className="text-xl font-bold text-[#2d3748] mb-2">
              Still have questions?
            </h3>
            <p className="text-[#4a5568] mb-4">
              Get in touch with our support team
            </p>
            <a
              href="mailto:support@xertiq.com"
              className="inline-block bg-[#3B82F6] text-white px-8 py-3 rounded-full font-semibold hover:bg-[#2563EB] transition-all no-underline"
            >
              Contact Support
            </a>
          </div>
        </div>
      </section>

      {/* Newsletter */}
      <section className="py-20 px-5 bg-[#f7fafc]">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-4 text-[#2d3748]">
            Stay Updated with XertiQ
          </h2>
          <p className="text-lg text-[#4a5568] mb-8">
            Get the latest updates, security tips, and feature announcements
          </p>

          <div className="flex gap-4 max-w-md mx-auto mb-8">
            <input
              type="email"
              placeholder="Enter your email"
              className="flex-1 px-4 py-3 rounded-lg border-2 border-[#e2e8f0] focus:border-[#3B82F6] focus:outline-none"
            />
            <button className="bg-[#3B82F6] text-white px-8 py-3 rounded-lg font-semibold hover:bg-[#2563EB] transition-all whitespace-nowrap">
              Subscribe
            </button>
          </div>

          <p className="text-sm text-[#4a5568]">
            No spam, unsubscribe at any time.
          </p>

          <div className="grid md:grid-cols-3 gap-8 mt-12">
            <div className="text-center">
              <div className="text-4xl mb-3">📧</div>
              <h4 className="font-semibold text-[#2d3748] mb-2">
                Weekly Updates
              </h4>
              <p className="text-sm text-[#4a5568]">
                Latest features and improvements
              </p>
            </div>
            <div className="text-center">
              <div className="text-4xl mb-3">💡</div>
              <h4 className="font-semibold text-[#2d3748] mb-2">
                Security Insights
              </h4>
              <p className="text-sm text-[#4a5568]">
                Best practices for document verification
              </p>
            </div>
            <div className="text-center">
              <div className="text-4xl mb-3">📊</div>
              <h4 className="font-semibold text-[#2d3748] mb-2">
                Industry Trends
              </h4>
              <p className="text-sm text-[#4a5568]">
                Blockchain and credential insights
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Demo Section */}
      <section id="demo" className="py-20 px-5 bg-white">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-center text-4xl md:text-5xl font-bold mb-12 text-[#2d3748]">
            Live Demo{" "}
            <span className="inline-block bg-[#48bb78] text-white px-4 py-1 rounded-full text-sm font-semibold ml-2 animate-pulse">
              LIVE
            </span>
          </h2>

          <div className="bg-[#f7fafc] p-10 rounded-2xl border-2 border-dashed border-[#cbd5e0]">
            <h3 className="text-center text-2xl font-semibold mb-6 text-[#2d3748]">
              Try Document Verification
            </h3>
            <p className="text-center text-[#4a5568] mb-8">
              Experience blockchain-powered verification in action
            </p>
            <div className="flex justify-center gap-5 flex-wrap">
              <Link
                to="/verify"
                className="bg-[#3B82F6] text-white px-8 py-4 rounded-full font-semibold text-base transition-all hover:-translate-y-0.5 hover:shadow-xl no-underline"
              >
                🔍 Verify Document
              </Link>
              <Link
                to="/register"
                className="bg-white text-[#3B82F6] px-8 py-4 rounded-full font-semibold text-base transition-all hover:-translate-y-0.5 hover:shadow-xl border-2 border-[#3B82F6] no-underline"
              >
                Get Started Free
              </Link>
            </div>
          </div>

          <div className="mt-12 bg-[#1a202c] text-[#e2e8f0] p-8 rounded-xl overflow-x-auto">
            <h4 className="text-xl font-semibold mb-4 text-white">
              Integration Code Example:
            </h4>
            <pre className="text-sm leading-relaxed">
              {`<!-- Step 1: Add container div -->
<div id="xertiq-verify-widget"></div>

<!-- Step 2: Add widget script -->
<script src="https://xertiq-frontend.vercel.app/embed-widget.js"></script>

<!-- That's it! Widget auto-initializes -->`}
            </pre>
          </div>
        </div>
      </section>

      {/* Documentation Section */}
      <section id="docs" className="py-20 px-5 bg-[#f7fafc]">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-center text-4xl md:text-5xl font-bold mb-12 text-[#2d3748]">
            Documentation & Resources
          </h2>
          <div className="grid md:grid-cols-3 gap-10">
            <div className="bg-white p-10 rounded-2xl shadow-lg text-center hover:-translate-y-2 transition-transform">
              <div className="text-5xl mb-5">📚</div>
              <h3 className="text-2xl font-semibold mb-4 text-[#2d3748]">
                Integration Guide
              </h3>
              <p className="text-[#4a5568] mb-6 leading-relaxed">
                Complete developer documentation with examples for all
                platforms.
              </p>
              <Link
                to="/integration-guide"
                className="inline-block bg-[#3B82F6] text-white px-6 py-3 rounded-full font-semibold transition-all hover:-translate-y-0.5 hover:shadow-xl no-underline"
              >
                View Full Demo
              </Link>
            </div>
            <div className="bg-white p-10 rounded-2xl shadow-lg text-center hover:-translate-y-2 transition-transform">
              <div className="text-5xl mb-5">🧪</div>
              <h3 className="text-2xl font-semibold mb-4 text-[#2d3748]">
                Test Pages
              </h3>
              <p className="text-[#4a5568] mb-6 leading-relaxed">
                Interactive test pages to verify integration before deployment.
              </p>
              <Link
                to="/test-widget"
                className="inline-block bg-[#3B82F6] text-white px-6 py-3 rounded-full font-semibold transition-all hover:-translate-y-0.5 hover:shadow-xl no-underline"
              >
                Test Widget
              </Link>
            </div>
            <div className="bg-white p-10 rounded-2xl shadow-lg text-center hover:-translate-y-2 transition-transform">
              <div className="text-5xl mb-5">🖼️</div>
              <h3 className="text-2xl font-semibold mb-4 text-[#2d3748]">
                iframe Examples
              </h3>
              <p className="text-[#4a5568] mb-6 leading-relaxed">
                Learn how to embed using traditional iframe methods.
              </p>
              <Link
                to="/iframe-examples"
                className="inline-block bg-[#3B82F6] text-white px-6 py-3 rounded-full font-semibold transition-all hover:-translate-y-0.5 hover:shadow-xl no-underline"
              >
                iframe Tests
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-[#2d3748] text-white py-16 px-5">
        <div className="max-w-7xl mx-auto grid md:grid-cols-4 gap-10 mb-10">
          <div>
            <h3 className="text-xl font-semibold mb-5 flex items-center gap-2">
              <img
                src={xertiqLogo}
                alt="XertiQ"
                className="h-8 w-auto brightness-0 invert"
              />
              XertiQ
            </h3>
            <p className="text-gray-300 leading-relaxed">
              Blockchain-secured document verification platform for secure
              credential management.
            </p>
          </div>
          <div>
            <h3 className="text-xl font-semibold mb-5">Quick Links</h3>
            <ul className="space-y-3 list-none p-0">
              <li>
                <button
                  onClick={() => scrollToSection("features")}
                  className="text-gray-300 hover:text-white transition-colors cursor-pointer bg-transparent border-0 p-0"
                >
                  Features
                </button>
              </li>
              <li>
                <button
                  onClick={() => scrollToSection("demo")}
                  className="text-gray-300 hover:text-white transition-colors cursor-pointer bg-transparent border-0 p-0"
                >
                  Live Demo
                </button>
              </li>
              <li>
                <button
                  onClick={() => scrollToSection("how-it-works")}
                  className="text-gray-300 hover:text-white transition-colors cursor-pointer bg-transparent border-0 p-0"
                >
                  How It Works
                </button>
              </li>
              <li>
                <Link
                  to="/integration-guide"
                  className="text-gray-300 hover:text-white transition-colors no-underline"
                >
                  Full Demo
                </Link>
              </li>
            </ul>
          </div>
          <div>
            <h3 className="text-xl font-semibold mb-5">Resources</h3>
            <ul className="space-y-3 list-none p-0">
              <li>
                <Link
                  to="/test-widget"
                  className="text-gray-300 hover:text-white transition-colors no-underline"
                >
                  Widget Test
                </Link>
              </li>
              <li>
                <Link
                  to="/iframe-examples"
                  className="text-gray-300 hover:text-white transition-colors no-underline"
                >
                  iframe Test
                </Link>
              </li>
              <li>
                <Link
                  to="/verify"
                  className="text-gray-300 hover:text-white transition-colors no-underline"
                >
                  Verification Page
                </Link>
              </li>
              <li>
                <Link
                  to="/login"
                  className="text-gray-300 hover:text-white transition-colors no-underline"
                >
                  Sign In
                </Link>
              </li>
            </ul>
          </div>
          <div>
            <h3 className="text-xl font-semibold mb-5">Connect</h3>
            <ul className="space-y-3 list-none p-0">
              <li>
                <a
                  href="mailto:support@xertiq.com"
                  className="text-gray-300 hover:text-white transition-colors no-underline"
                >
                  Support
                </a>
              </li>
              <li>
                <a
                  href="https://github.com/xertiq"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-gray-300 hover:text-white transition-colors no-underline"
                >
                  GitHub
                </a>
              </li>
              <li>
                <a
                  href="https://twitter.com/xertiq"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-gray-300 hover:text-white transition-colors no-underline"
                >
                  Twitter
                </a>
              </li>
              <li>
                <a
                  href="https://xertiq.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-gray-300 hover:text-white transition-colors no-underline"
                >
                  Website
                </a>
              </li>
            </ul>
          </div>
        </div>
        <div className="text-center pt-8 border-t border-gray-700 text-gray-400">
          <p>
            &copy; 2026 XertiQ. All rights reserved. | Powered by Solana
            Blockchain
          </p>
        </div>
      </footer>

      <style jsx>{`
        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(30px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>
    </div>
  );
};

export default LandingPage;
