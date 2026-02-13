import { Link } from "react-router-dom";
import { Shield, ArrowLeft, Lock, Database, Eye, Globe, Mail } from "lucide-react";

const PrivacyPolicy = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
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
              <Lock size={16} />
              Your Privacy Matters
            </div>
            <h1 className="text-4xl font-bold text-slate-900 mb-4">Privacy Policy</h1>
            <p className="text-slate-600">Last updated: January 2026</p>
          </div>

          {/* Content Sections */}
          <div className="space-y-10 text-slate-700">
            {/* Introduction */}
            <section>
              <h2 className="text-2xl font-semibold text-slate-900 mb-4 flex items-center gap-3">
                <span className="w-8 h-8 bg-primary-100 rounded-lg flex items-center justify-center text-primary-600 text-sm font-bold">1</span>
                Introduction
              </h2>
              <p className="leading-relaxed">
                XertiQ ("we," "our," or "us") is committed to protecting your privacy. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you use our blockchain-based document verification platform.
              </p>
              <p className="leading-relaxed mt-4">
                By using XertiQ, you agree to the collection and use of information in accordance with this policy. If you do not agree with the terms of this policy, please do not access the platform.
              </p>
            </section>

            {/* Information We Collect */}
            <section>
              <h2 className="text-2xl font-semibold text-slate-900 mb-4 flex items-center gap-3">
                <span className="w-8 h-8 bg-primary-100 rounded-lg flex items-center justify-center text-primary-600 text-sm font-bold">2</span>
                Information We Collect
              </h2>

              <h3 className="text-lg font-semibold text-slate-800 mt-6 mb-3">2.1 Personal Information</h3>
              <p className="leading-relaxed mb-4">We may collect the following personal information:</p>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li>Name and email address (for account registration)</li>
                <li>Organization name and logo (for issuers)</li>
                <li>Document holder information (name, email, birthday, gender) for identity verification</li>
                <li>Payment information (processed securely through third-party providers)</li>
              </ul>

              <h3 className="text-lg font-semibold text-slate-800 mt-6 mb-3">2.2 Document Data</h3>
              <p className="leading-relaxed mb-4">When documents are issued through our platform:</p>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li>Document content is encrypted and stored on IPFS (decentralized storage)</li>
                <li>Only cryptographic hashes (SHA-256) are stored on the blockchain - <strong>no personal information is stored on the blockchain</strong></li>
                <li>Merkle tree roots are anchored to the Solana blockchain for verification</li>
              </ul>

              <h3 className="text-lg font-semibold text-slate-800 mt-6 mb-3">2.3 Technical Data</h3>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li>IP address and browser information</li>
                <li>Device information and operating system</li>
                <li>Usage patterns and interaction data</li>
                <li>Cookies and similar tracking technologies</li>
              </ul>
            </section>

            {/* How We Use Your Information */}
            <section>
              <h2 className="text-2xl font-semibold text-slate-900 mb-4 flex items-center gap-3">
                <span className="w-8 h-8 bg-primary-100 rounded-lg flex items-center justify-center text-primary-600 text-sm font-bold">3</span>
                How We Use Your Information
              </h2>
              <p className="leading-relaxed mb-4">We use the collected information for:</p>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li>Providing and maintaining our document verification services</li>
                <li>Processing document issuance and verification requests</li>
                <li>Sending notifications about document status and updates</li>
                <li>Processing payments and managing credit balances</li>
                <li>Improving our platform and user experience</li>
                <li>Complying with legal obligations and preventing fraud</li>
                <li>Communicating with you about service updates and announcements</li>
              </ul>
            </section>

            {/* Blockchain and Data Permanence */}
            <section>
              <h2 className="text-2xl font-semibold text-slate-900 mb-4 flex items-center gap-3">
                <span className="w-8 h-8 bg-primary-100 rounded-lg flex items-center justify-center text-primary-600 text-sm font-bold">4</span>
                Blockchain and Data Permanence
              </h2>
              <div className="bg-amber-50 border border-amber-200 rounded-xl p-6 mb-4">
                <div className="flex items-start gap-3">
                  <Database className="text-amber-600 mt-1 flex-shrink-0" size={20} />
                  <div>
                    <h4 className="font-semibold text-amber-900 mb-2">Important Notice About Blockchain Data</h4>
                    <p className="text-amber-800 text-sm leading-relaxed">
                      Data recorded on the blockchain is permanent and cannot be deleted. However, we only store cryptographic hashes on the blockchain - never personal information. Off-chain data (stored in our database and IPFS) can be removed upon request, subject to legal retention requirements.
                    </p>
                  </div>
                </div>
              </div>
              <p className="leading-relaxed">
                Our system is designed with privacy-by-design principles. Personal identifiable information (PII) is stored only in our secure database, while the blockchain contains only mathematical representations (hashes) that cannot be reversed to reveal personal data.
              </p>
            </section>

            {/* Data Sharing */}
            <section>
              <h2 className="text-2xl font-semibold text-slate-900 mb-4 flex items-center gap-3">
                <span className="w-8 h-8 bg-primary-100 rounded-lg flex items-center justify-center text-primary-600 text-sm font-bold">5</span>
                Data Sharing and Disclosure
              </h2>
              <p className="leading-relaxed mb-4">We may share your information with:</p>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li><strong>Document Issuers:</strong> Information necessary for document issuance</li>
                <li><strong>Verifiers:</strong> Only verified document information when verification is requested with valid credentials</li>
                <li><strong>Service Providers:</strong> Third-party services for payment processing, email delivery, and storage</li>
                <li><strong>Legal Requirements:</strong> When required by law, court order, or government request</li>
              </ul>
              <p className="leading-relaxed mt-4">
                We do not sell your personal information to third parties.
              </p>
            </section>

            {/* Data Security */}
            <section>
              <h2 className="text-2xl font-semibold text-slate-900 mb-4 flex items-center gap-3">
                <span className="w-8 h-8 bg-primary-100 rounded-lg flex items-center justify-center text-primary-600 text-sm font-bold">6</span>
                Data Security
              </h2>
              <p className="leading-relaxed mb-4">We implement robust security measures including:</p>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li>AES-256 encryption for stored documents</li>
                <li>TLS/SSL encryption for data in transit</li>
                <li>Secure authentication with JWT tokens</li>
                <li>Regular security audits and monitoring</li>
                <li>Role-based access controls</li>
                <li>Audit logging for compliance (7-year retention)</li>
              </ul>
            </section>

            {/* Your Rights */}
            <section>
              <h2 className="text-2xl font-semibold text-slate-900 mb-4 flex items-center gap-3">
                <span className="w-8 h-8 bg-primary-100 rounded-lg flex items-center justify-center text-primary-600 text-sm font-bold">7</span>
                Your Rights
              </h2>
              <p className="leading-relaxed mb-4">Depending on your jurisdiction, you may have the right to:</p>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li>Access your personal data</li>
                <li>Correct inaccurate data</li>
                <li>Request deletion of off-chain data (subject to legal retention requirements)</li>
                <li>Object to certain processing activities</li>
                <li>Data portability</li>
                <li>Withdraw consent</li>
              </ul>
              <p className="leading-relaxed mt-4">
                To exercise these rights, please contact us at <a href="mailto:privacy@xertiq.com" className="text-primary-600 hover:underline">privacy@xertiq.com</a>.
              </p>
            </section>

            {/* Data Retention */}
            <section>
              <h2 className="text-2xl font-semibold text-slate-900 mb-4 flex items-center gap-3">
                <span className="w-8 h-8 bg-primary-100 rounded-lg flex items-center justify-center text-primary-600 text-sm font-bold">8</span>
                Data Retention
              </h2>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li><strong>Account Data:</strong> Retained while your account is active and for 30 days after deletion</li>
                <li><strong>Document Data:</strong> Retained as long as required by the issuer and document holder</li>
                <li><strong>Audit Logs:</strong> Retained for 7 years for compliance purposes</li>
                <li><strong>Blockchain Data:</strong> Permanent (hashes only, no PII)</li>
              </ul>
            </section>

            {/* International Transfers */}
            <section>
              <h2 className="text-2xl font-semibold text-slate-900 mb-4 flex items-center gap-3">
                <span className="w-8 h-8 bg-primary-100 rounded-lg flex items-center justify-center text-primary-600 text-sm font-bold">9</span>
                International Data Transfers
              </h2>
              <p className="leading-relaxed">
                Your information may be transferred to and processed in countries other than your country of residence. We ensure appropriate safeguards are in place to protect your information in accordance with applicable data protection laws.
              </p>
            </section>

            {/* Children's Privacy */}
            <section>
              <h2 className="text-2xl font-semibold text-slate-900 mb-4 flex items-center gap-3">
                <span className="w-8 h-8 bg-primary-100 rounded-lg flex items-center justify-center text-primary-600 text-sm font-bold">10</span>
                Children's Privacy
              </h2>
              <p className="leading-relaxed">
                Our services are not directed to individuals under 16 years of age. We do not knowingly collect personal information from children under 16. If we learn that we have collected personal information from a child under 16, we will take steps to delete that information.
              </p>
            </section>

            {/* Changes to Privacy Policy */}
            <section>
              <h2 className="text-2xl font-semibold text-slate-900 mb-4 flex items-center gap-3">
                <span className="w-8 h-8 bg-primary-100 rounded-lg flex items-center justify-center text-primary-600 text-sm font-bold">11</span>
                Changes to This Policy
              </h2>
              <p className="leading-relaxed">
                We may update this Privacy Policy from time to time. We will notify you of any changes by posting the new Privacy Policy on this page and updating the "Last updated" date. You are advised to review this Privacy Policy periodically for any changes.
              </p>
            </section>

            {/* Contact */}
            <section>
              <h2 className="text-2xl font-semibold text-slate-900 mb-4 flex items-center gap-3">
                <span className="w-8 h-8 bg-primary-100 rounded-lg flex items-center justify-center text-primary-600 text-sm font-bold">12</span>
                Contact Us
              </h2>
              <p className="leading-relaxed mb-4">
                If you have any questions about this Privacy Policy, please contact us:
              </p>
              <div className="bg-slate-50 rounded-xl p-6 space-y-3">
                <div className="flex items-center gap-3">
                  <Mail size={18} className="text-primary-600" />
                  <span><strong>Email:</strong> <a href="mailto:privacy@xertiq.com" className="text-primary-600 hover:underline">privacy@xertiq.com</a></span>
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

export default PrivacyPolicy;
