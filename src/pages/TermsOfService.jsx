import { Link } from "react-router-dom";
import { Shield, ArrowLeft, FileText, AlertTriangle, Scale, Mail, Globe } from "lucide-react";
import SEOHead from "../components/SEOHead";

const TermsOfService = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      <SEOHead title="Terms of Service" />
      {/* Header */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-10">
        <div className="max-w-4xl mx-auto px-6 py-4 flex items-center justify-between">
          <Link
            to="/"
            className="flex items-center gap-2 text-slate-600 hover:text-primary-600 transition-colors"
          >
            <ArrowLeft size={20} />
            <span className="font-medium">Back to Home</span>
          </Link>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-gradient-to-br from-primary-500 to-secondary-500 rounded-lg flex items-center justify-center">
              <Shield size={18} className="text-white" />
            </div>
            <span className="font-semibold text-slate-800">XertiQ</span>
          </div>
        </div>
      </header>

      {/* Content */}
      <main className="max-w-4xl mx-auto px-6 py-12">
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-8 md:p-12">
          {/* Title */}
          <div className="text-center mb-12">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-primary-50 text-primary-700 rounded-full text-sm font-medium mb-4">
              <FileText size={16} />
              Legal Agreement
            </div>
            <h1 className="text-4xl font-bold text-slate-900 mb-4">Terms of Service</h1>
            <p className="text-slate-600">Last updated: January 2026</p>
          </div>

          {/* Important Notice */}
          <div className="bg-amber-50 border border-amber-200 rounded-xl p-6 mb-10">
            <div className="flex items-start gap-3">
              <AlertTriangle className="text-amber-600 mt-1 flex-shrink-0" size={20} />
              <div>
                <h4 className="font-semibold text-amber-900 mb-2">Please Read Carefully</h4>
                <p className="text-amber-800 text-sm leading-relaxed">
                  By accessing or using XertiQ's services, you agree to be bound by these Terms of Service. If you disagree with any part of these terms, you may not access the service.
                </p>
              </div>
            </div>
          </div>

          {/* Content Sections */}
          <div className="space-y-10 text-slate-700">
            {/* Definitions */}
            <section>
              <h2 className="text-2xl font-semibold text-slate-900 mb-4 flex items-center gap-3">
                <span className="w-8 h-8 bg-primary-100 rounded-lg flex items-center justify-center text-primary-600 text-sm font-bold">1</span>
                Definitions
              </h2>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li><strong>"Platform"</strong> refers to the XertiQ web application and related services</li>
                <li><strong>"User"</strong> refers to any individual or entity accessing the Platform</li>
                <li><strong>"Issuer"</strong> refers to organizations that issue documents through the Platform</li>
                <li><strong>"Holder"</strong> refers to individuals who receive issued documents</li>
                <li><strong>"Verifier"</strong> refers to parties who verify document authenticity</li>
                <li><strong>"Document"</strong> refers to any certificate, diploma, or credential issued through the Platform</li>
                <li><strong>"Credits"</strong> refers to the prepaid units used to access Platform services</li>
              </ul>
            </section>

            {/* Acceptance of Terms */}
            <section>
              <h2 className="text-2xl font-semibold text-slate-900 mb-4 flex items-center gap-3">
                <span className="w-8 h-8 bg-primary-100 rounded-lg flex items-center justify-center text-primary-600 text-sm font-bold">2</span>
                Acceptance of Terms
              </h2>
              <p className="leading-relaxed mb-4">
                By creating an account, accessing, or using XertiQ, you acknowledge that you have read, understood, and agree to be bound by these Terms of Service and our Privacy Policy.
              </p>
              <p className="leading-relaxed">
                If you are using the Platform on behalf of an organization, you represent that you have the authority to bind that organization to these terms.
              </p>
            </section>

            {/* Account Registration */}
            <section>
              <h2 className="text-2xl font-semibold text-slate-900 mb-4 flex items-center gap-3">
                <span className="w-8 h-8 bg-primary-100 rounded-lg flex items-center justify-center text-primary-600 text-sm font-bold">3</span>
                Account Registration
              </h2>
              <p className="leading-relaxed mb-4">To use certain features of the Platform, you must register for an account. When registering, you agree to:</p>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li>Provide accurate, current, and complete information</li>
                <li>Maintain and promptly update your account information</li>
                <li>Keep your password secure and confidential</li>
                <li>Accept responsibility for all activities under your account</li>
                <li>Notify us immediately of any unauthorized use</li>
              </ul>
              <p className="leading-relaxed mt-4">
                We reserve the right to suspend or terminate accounts that violate these terms or provide false information.
              </p>
            </section>

            {/* Services Description */}
            <section>
              <h2 className="text-2xl font-semibold text-slate-900 mb-4 flex items-center gap-3">
                <span className="w-8 h-8 bg-primary-100 rounded-lg flex items-center justify-center text-primary-600 text-sm font-bold">4</span>
                Services Description
              </h2>
              <p className="leading-relaxed mb-4">XertiQ provides:</p>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li>Blockchain-based document issuance and anchoring</li>
                <li>Document verification services</li>
                <li>Holder document management dashboard</li>
                <li>Embeddable verification widgets</li>
                <li>Template design tools for document creation</li>
                <li>IPFS-based encrypted document storage</li>
              </ul>
              <p className="leading-relaxed mt-4">
                We reserve the right to modify, suspend, or discontinue any part of the service with reasonable notice.
              </p>
            </section>

            {/* Credit System and Payments */}
            <section>
              <h2 className="text-2xl font-semibold text-slate-900 mb-4 flex items-center gap-3">
                <span className="w-8 h-8 bg-primary-100 rounded-lg flex items-center justify-center text-primary-600 text-sm font-bold">5</span>
                Credit System and Payments
              </h2>
              <h3 className="text-lg font-semibold text-slate-800 mt-6 mb-3">5.1 Credit Usage</h3>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li>PDF Generation: 2 credits per document</li>
                <li>IPFS Upload: 1 credit per document</li>
                <li>Blockchain Anchoring: 3 credits per document</li>
                <li>Certificate Validation: 1 credit per validation</li>
              </ul>

              <h3 className="text-lg font-semibold text-slate-800 mt-6 mb-3">5.2 Payment Terms</h3>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li>All payments are processed through secure third-party payment providers</li>
                <li>Credits are non-refundable once purchased</li>
                <li>Unused credits do not expire</li>
                <li>Prices are subject to change with 30 days notice</li>
              </ul>
            </section>

            {/* Issuer Responsibilities */}
            <section>
              <h2 className="text-2xl font-semibold text-slate-900 mb-4 flex items-center gap-3">
                <span className="w-8 h-8 bg-primary-100 rounded-lg flex items-center justify-center text-primary-600 text-sm font-bold">6</span>
                Issuer Responsibilities
              </h2>
              <p className="leading-relaxed mb-4">As an Issuer, you agree to:</p>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li>Only issue documents you are legally authorized to issue</li>
                <li>Verify the identity of document holders before issuance</li>
                <li>Ensure all document information is accurate and truthful</li>
                <li>Comply with applicable data protection laws when handling holder data</li>
                <li>Maintain records of issued documents for audit purposes</li>
                <li>Not issue fraudulent, misleading, or deceptive documents</li>
                <li>Respond to legitimate verification requests</li>
              </ul>
            </section>

            {/* Holder Rights and Responsibilities */}
            <section>
              <h2 className="text-2xl font-semibold text-slate-900 mb-4 flex items-center gap-3">
                <span className="w-8 h-8 bg-primary-100 rounded-lg flex items-center justify-center text-primary-600 text-sm font-bold">7</span>
                Holder Rights and Responsibilities
              </h2>
              <p className="leading-relaxed mb-4">As a Holder, you:</p>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li>Own and control access to your documents</li>
                <li>Can generate verification keys to share document access</li>
                <li>Are responsible for keeping your account credentials secure</li>
                <li>Must not share, sell, or transfer documents you don't have rights to</li>
                <li>Acknowledge that document authenticity depends on the issuing organization</li>
              </ul>
            </section>

            {/* Prohibited Activities */}
            <section>
              <h2 className="text-2xl font-semibold text-slate-900 mb-4 flex items-center gap-3">
                <span className="w-8 h-8 bg-primary-100 rounded-lg flex items-center justify-center text-primary-600 text-sm font-bold">8</span>
                Prohibited Activities
              </h2>
              <p className="leading-relaxed mb-4">You agree NOT to:</p>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li>Issue, create, or distribute fraudulent or forged documents</li>
                <li>Attempt to hack, disrupt, or compromise the Platform</li>
                <li>Use the Platform for illegal purposes</li>
                <li>Impersonate any person or organization</li>
                <li>Violate any applicable laws or regulations</li>
                <li>Interfere with other users' access to the Platform</li>
                <li>Attempt to reverse-engineer blockchain data to identify individuals</li>
                <li>Use automated systems or bots without authorization</li>
                <li>Upload malware, viruses, or harmful code</li>
              </ul>
            </section>

            {/* Blockchain Permanence */}
            <section>
              <h2 className="text-2xl font-semibold text-slate-900 mb-4 flex items-center gap-3">
                <span className="w-8 h-8 bg-primary-100 rounded-lg flex items-center justify-center text-primary-600 text-sm font-bold">9</span>
                Blockchain Permanence
              </h2>
              <div className="bg-slate-50 border border-slate-200 rounded-xl p-6">
                <p className="leading-relaxed">
                  <strong>You acknowledge and agree that:</strong>
                </p>
                <ul className="list-disc list-inside space-y-2 ml-4 mt-4">
                  <li>Data recorded on the blockchain (cryptographic hashes) is permanent and cannot be deleted</li>
                  <li>This permanence is a feature that ensures document integrity and prevents tampering</li>
                  <li>No personal information is stored on the blockchain - only mathematical hashes</li>
                  <li>Off-chain data can be deleted upon request, subject to legal retention requirements</li>
                </ul>
              </div>
            </section>

            {/* Intellectual Property */}
            <section>
              <h2 className="text-2xl font-semibold text-slate-900 mb-4 flex items-center gap-3">
                <span className="w-8 h-8 bg-primary-100 rounded-lg flex items-center justify-center text-primary-600 text-sm font-bold">10</span>
                Intellectual Property
              </h2>
              <p className="leading-relaxed mb-4">
                The Platform, including its design, features, and content, is owned by XertiQ and protected by intellectual property laws.
              </p>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li>You retain ownership of documents you upload or create</li>
                <li>You grant XertiQ a license to process, store, and display your documents as needed to provide the service</li>
                <li>XertiQ trademarks and branding may not be used without permission</li>
              </ul>
            </section>

            {/* Limitation of Liability */}
            <section>
              <h2 className="text-2xl font-semibold text-slate-900 mb-4 flex items-center gap-3">
                <span className="w-8 h-8 bg-primary-100 rounded-lg flex items-center justify-center text-primary-600 text-sm font-bold">11</span>
                Limitation of Liability
              </h2>
              <div className="bg-slate-50 border border-slate-200 rounded-xl p-6">
                <p className="leading-relaxed mb-4">
                  TO THE MAXIMUM EXTENT PERMITTED BY LAW:
                </p>
                <ul className="list-disc list-inside space-y-2 ml-4">
                  <li>XertiQ provides the Platform "AS IS" without warranties of any kind</li>
                  <li>We are not liable for any indirect, incidental, or consequential damages</li>
                  <li>Our total liability shall not exceed the amount you paid to us in the past 12 months</li>
                  <li>We are not responsible for the accuracy of documents issued by third parties</li>
                  <li>We are not liable for blockchain network issues or third-party service failures</li>
                </ul>
              </div>
            </section>

            {/* Indemnification */}
            <section>
              <h2 className="text-2xl font-semibold text-slate-900 mb-4 flex items-center gap-3">
                <span className="w-8 h-8 bg-primary-100 rounded-lg flex items-center justify-center text-primary-600 text-sm font-bold">12</span>
                Indemnification
              </h2>
              <p className="leading-relaxed">
                You agree to indemnify, defend, and hold harmless XertiQ and its officers, directors, employees, and agents from any claims, damages, losses, or expenses arising from your use of the Platform, violation of these terms, or infringement of any third-party rights.
              </p>
            </section>

            {/* Termination */}
            <section>
              <h2 className="text-2xl font-semibold text-slate-900 mb-4 flex items-center gap-3">
                <span className="w-8 h-8 bg-primary-100 rounded-lg flex items-center justify-center text-primary-600 text-sm font-bold">13</span>
                Termination
              </h2>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li>You may terminate your account at any time by contacting us</li>
                <li>We may suspend or terminate accounts for violations of these terms</li>
                <li>Upon termination, your access to the Platform will cease</li>
                <li>Blockchain records will remain permanent even after account termination</li>
                <li>Unused credits are non-refundable upon termination</li>
              </ul>
            </section>

            {/* Governing Law */}
            <section>
              <h2 className="text-2xl font-semibold text-slate-900 mb-4 flex items-center gap-3">
                <span className="w-8 h-8 bg-primary-100 rounded-lg flex items-center justify-center text-primary-600 text-sm font-bold">14</span>
                Governing Law
              </h2>
              <p className="leading-relaxed">
                These Terms shall be governed by and construed in accordance with the laws of the Republic of the Philippines, without regard to its conflict of law provisions. Any disputes arising from these terms shall be resolved in the courts of the Philippines.
              </p>
            </section>

            {/* Changes to Terms */}
            <section>
              <h2 className="text-2xl font-semibold text-slate-900 mb-4 flex items-center gap-3">
                <span className="w-8 h-8 bg-primary-100 rounded-lg flex items-center justify-center text-primary-600 text-sm font-bold">15</span>
                Changes to Terms
              </h2>
              <p className="leading-relaxed">
                We reserve the right to modify these Terms of Service at any time. We will provide notice of significant changes through the Platform or via email. Your continued use of the Platform after such modifications constitutes acceptance of the updated terms.
              </p>
            </section>

            {/* Contact */}
            <section>
              <h2 className="text-2xl font-semibold text-slate-900 mb-4 flex items-center gap-3">
                <span className="w-8 h-8 bg-primary-100 rounded-lg flex items-center justify-center text-primary-600 text-sm font-bold">16</span>
                Contact Us
              </h2>
              <p className="leading-relaxed mb-4">
                If you have any questions about these Terms of Service, please contact us:
              </p>
              <div className="bg-slate-50 rounded-xl p-6 space-y-3">
                <div className="flex items-center gap-3">
                  <Mail size={18} className="text-primary-600" />
                  <span><strong>Email:</strong> <a href="mailto:legal@xertiq.com" className="text-primary-600 hover:underline">legal@xertiq.com</a></span>
                </div>
                <div className="flex items-center gap-3">
                  <Globe size={18} className="text-primary-600" />
                  <span><strong>Website:</strong> <a href="https://xertiq.com" className="text-primary-600 hover:underline">xertiq.com</a></span>
                </div>
              </div>
            </section>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-slate-200 py-8 mt-12">
        <div className="max-w-4xl mx-auto px-6 text-center">
          <p className="text-slate-600 text-sm">
            &copy; {new Date().getFullYear()} XertiQ. All rights reserved.
          </p>
          <div className="flex items-center justify-center gap-6 mt-4">
            <Link to="/terms-of-service" className="text-sm text-primary-600 hover:underline">Terms of Service</Link>
            <Link to="/privacy-policy" className="text-sm text-primary-600 hover:underline">Privacy Policy</Link>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default TermsOfService;
