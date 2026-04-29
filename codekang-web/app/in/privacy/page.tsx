'use client';

import { motion } from 'framer-motion';
import { 
  RiShieldUserLine, 
  RiEyeOffLine, 
  RiDatabase2Line,
  RiArrowRightLine,
  RiTimeLine,
  RiLockLine,
  RiGlobalLine,
  RiInformationLine,
  RiMailLine,
  RiShieldKeyholeLine,
  RiUserSettingsLine,
  RiScales3Line
} from 'react-icons/ri';
import HomeHeader from '@/component/HomeHeader';
import Footer from '@/component/Footer';
import Link from 'next/link';

export default function PrivacyPage() {
  const lastUpdated = "April 27, 2026";

  return (
    <div className="min-h-screen bg-[#fcfcfc] text-black font-[family-name:var(--font-space-grotesk)]">
      <HomeHeader />

      <main>
        {/* ── Hero ── */}
        <section className="pt-32 pb-20 px-10 text-center relative border-b-2 border-black/10 bg-white">
          <div className="absolute inset-0 pointer-events-none -z-10 opacity-[0.03]"
            style={{ backgroundImage: 'radial-gradient(#000 1px, transparent 1px)', backgroundSize: '32px 32px' }} />
          
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="max-w-4xl mx-auto"
          >
            <span className="inline-block px-3 py-1 border-2 border-[#f97316] text-[#f97316] text-[12px] font-black uppercase tracking-[0.2em] mb-8">
              Privacy First
            </span>
            <h1 className="text-6xl md:text-8xl font-black uppercase tracking-tighter leading-[0.85] mb-10">
              Privacy <br />
              <span className="text-[#f97316]">Policy</span>
            </h1>
            <div className="flex items-center justify-center gap-4 text-gray-500 font-bold uppercase tracking-widest text-[12px]">
              <RiTimeLine className="text-[#f97316]" />
              Last Updated: {lastUpdated}
            </div>
          </motion.div>
        </section>

        {/* ── Content ── */}
        <section className="px-6 md:px-10 py-24 bg-[#fcfcfc]">
          <div className="max-w-4xl mx-auto">
            <div className="grid gap-12">
              
              {/* Introduction */}
              <div className="p-10 border-2 border-black bg-white shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]">
                <h2 className="text-3xl font-black uppercase mb-6 flex items-center gap-4">
                  <span className="w-10 h-10 bg-black text-white flex items-center justify-center text-sm">01</span>
                  Introduction
                </h2>
                <div className="space-y-4 text-gray-600 font-medium leading-relaxed uppercase tracking-tight">
                  <p>
                    Welcome to CodeKang. We value your privacy and are committed to protecting your personal data. This Privacy Policy explains how we collect, use, and safeguard your information when you visit our website or use our services.
                  </p>
                  <p>
                    By using CodeKang, you consent to the data practices described in this policy. We encourage you to read this document carefully to understand our commitment to your privacy.
                  </p>
                </div>
              </div>

              {/* Data Collection */}
              <div className="p-10 border-2 border-black bg-white shadow-[8px_8px_0px_0px_rgba(249,115,22,1)]">
                <h2 className="text-3xl font-black uppercase mb-6 flex items-center gap-4">
                  <span className="w-10 h-10 bg-[#f97316] text-white flex items-center justify-center text-sm">02</span>
                  Information We Collect
                </h2>
                <div className="space-y-6 text-gray-600 font-medium leading-relaxed uppercase tracking-tight">
                  <div>
                    <h3 className="text-black font-black mb-2 flex items-center gap-2">
                      <RiInformationLine className="text-[#f97316]" /> Personal Data
                    </h3>
                    <p>While using our Service, we may ask you to provide us with certain personally identifiable information that can be used to contact or identify you ("Personal Data"). This may include, but is not limited to:</p>
                    <ul className="list-disc ml-6 mt-2 space-y-1">
                      <li>Email address</li>
                      <li>First name and last name</li>
                      <li>Company name</li>
                      <li>Cookies and Usage Data</li>
                    </ul>
                  </div>
                  <div>
                    <h3 className="text-black font-black mb-2 flex items-center gap-2">
                      <RiDatabase2Line className="text-[#f97316]" /> Usage Data
                    </h3>
                    <p>We may also collect information on how the Service is accessed and used ("Usage Data"). This may include information such as your computer's IP address, browser type, browser version, the pages of our Service that you visit, the time and date of your visit, and other diagnostic data.</p>
                  </div>
                  <div>
                    <h3 className="text-black font-black mb-2 flex items-center gap-2">
                      <RiGlobalLine className="text-[#f97316]" /> Code & Repository Data
                    </h3>
                    <p>To provide our autonomous engineering services, we access and analyze your source code. This data is handled with extreme care and is used only for the purposes you authorize.</p>
                  </div>
                </div>
              </div>

              {/* Use of Data */}
              <div className="p-10 border-2 border-black bg-white shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]">
                <h2 className="text-3xl font-black uppercase mb-6 flex items-center gap-4">
                  <span className="w-10 h-10 bg-black text-white flex items-center justify-center text-sm">03</span>
                  How We Use Your Information
                </h2>
                <div className="space-y-4 text-gray-600 font-medium leading-relaxed uppercase tracking-tight">
                  <p>CodeKang uses the collected data for various purposes:</p>
                  <ul className="list-disc ml-6 space-y-2">
                    <li>To provide and maintain our Service</li>
                    <li>To notify you about changes to our Service</li>
                    <li>To provide customer support</li>
                    <li>To gather analysis or valuable information so that we can improve our Service</li>
                    <li>To monitor the usage of our Service</li>
                    <li>To detect, prevent and address technical issues</li>
                    <li>To perform autonomous engineering tasks as requested by you</li>
                  </ul>
                </div>
              </div>

              {/* Data Transfer */}
              <div className="p-10 border-2 border-black bg-white shadow-[8px_8px_0px_0px_rgba(249,115,22,1)]">
                <h2 className="text-3xl font-black uppercase mb-6 flex items-center gap-4">
                  <span className="w-10 h-10 bg-[#f97316] text-white flex items-center justify-center text-sm">04</span>
                  Transfer Of Data
                </h2>
                <div className="space-y-4 text-gray-600 font-medium leading-relaxed uppercase tracking-tight">
                  <p>
                    Your information, including Personal Data, may be transferred to — and maintained on — computers located outside of your state, province, country or other governmental jurisdiction where the data protection laws may differ than those from your jurisdiction.
                  </p>
                  <p>
                    Your consent to this Privacy Policy followed by your submission of such information represents your agreement to that transfer.
                  </p>
                </div>
              </div>

              {/* Disclosure of Data */}
              <div className="p-10 border-2 border-black bg-white shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]">
                <h2 className="text-3xl font-black uppercase mb-6 flex items-center gap-4">
                  <span className="w-10 h-10 bg-black text-white flex items-center justify-center text-sm">05</span>
                  Disclosure Of Data
                </h2>
                <div className="space-y-4 text-gray-600 font-medium leading-relaxed uppercase tracking-tight">
                  <h3 className="text-black font-black">Legal Requirements</h3>
                  <p>CodeKang may disclose your Personal Data in the good faith belief that such action is necessary to:</p>
                  <ul className="list-disc ml-6 space-y-2">
                    <li>To comply with a legal obligation</li>
                    <li>To protect and defend the rights or property of CodeKang</li>
                    <li>To prevent or investigate possible wrongdoing in connection with the Service</li>
                    <li>To protect the personal safety of users of the Service or the public</li>
                    <li>To protect against legal liability</li>
                  </ul>
                </div>
              </div>

              {/* Security of Data */}
              <div className="p-10 border-2 border-black bg-white shadow-[8px_8px_0px_0px_rgba(249,115,22,1)]">
                <h2 className="text-3xl font-black uppercase mb-6 flex items-center gap-4">
                  <span className="w-10 h-10 bg-[#f97316] text-white flex items-center justify-center text-sm">06</span>
                  Security Of Data
                </h2>
                <div className="space-y-4 text-gray-600 font-medium leading-relaxed uppercase tracking-tight">
                  <p>
                    The security of your data is important to us, but remember that no method of transmission over the Internet, or method of electronic storage is 100% secure. While we strive to use commercially acceptable means to protect your Personal Data, we cannot guarantee its absolute security.
                  </p>
                  <div className="p-6 bg-black text-white border-l-8 border-[#f97316] mt-4">
                     <p className="font-black italic">"We treat your code like our own. Zero-trust by design, encrypted at every layer."</p>
                  </div>
                </div>
              </div>

              {/* Service Providers */}
              <div className="p-10 border-2 border-black bg-white shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]">
                <h2 className="text-3xl font-black uppercase mb-6 flex items-center gap-4">
                  <span className="w-10 h-10 bg-black text-white flex items-center justify-center text-sm">07</span>
                  Service Providers
                </h2>
                <div className="space-y-4 text-gray-600 font-medium leading-relaxed uppercase tracking-tight">
                  <p>
                    We may employ third party companies and individuals to facilitate our Service ("Service Providers"), to provide the Service on our behalf, to perform Service-related services or to assist us in analyzing how our Service is used.
                  </p>
                  <p>
                    These third parties have access to your Personal Data only to perform these tasks on our behalf and are obligated not to disclose or use it for any other purpose.
                  </p>
                </div>
              </div>

              {/* Your Rights */}
              <div className="p-10 border-2 border-black bg-white shadow-[8px_8px_0px_0px_rgba(249,115,22,1)]">
                <h2 className="text-3xl font-black uppercase mb-6 flex items-center gap-4">
                  <span className="w-10 h-10 bg-[#f97316] text-white flex items-center justify-center text-sm">08</span>
                  Your Rights & Choices
                </h2>
                <div className="space-y-4 text-gray-600 font-medium leading-relaxed uppercase tracking-tight">
                  <p>Depending on your location, you may have the following rights regarding your Personal Data:</p>
                  <ul className="list-disc ml-6 space-y-2">
                    <li>The right to access, update or delete the information we have on you.</li>
                    <li>The right of rectification.</li>
                    <li>The right to object.</li>
                    <li>The right of restriction.</li>
                    <li>The right to data portability.</li>
                    <li>The right to withdraw consent.</li>
                  </ul>
                </div>
              </div>

              {/* Changes to Policy */}
              <div className="p-10 border-2 border-black bg-white shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]">
                <h2 className="text-3xl font-black uppercase mb-6 flex items-center gap-4">
                  <span className="w-10 h-10 bg-black text-white flex items-center justify-center text-sm">09</span>
                  Changes To This Privacy Policy
                </h2>
                <div className="space-y-4 text-gray-600 font-medium leading-relaxed uppercase tracking-tight">
                  <p>
                    We may update our Privacy Policy from time to time. We will notify you of any changes by posting the new Privacy Policy on this page.
                  </p>
                  <p>
                    We will let you know via email and/or a prominent notice on our Service, prior to the change becoming effective and update the "last updated" date at the top of this Privacy Policy.
                  </p>
                </div>
              </div>

              {/* Contact Us */}
              <div className="p-10 border-2 border-black bg-white shadow-[8px_8px_0px_0px_rgba(249,115,22,1)]">
                <h2 className="text-3xl font-black uppercase mb-6 flex items-center gap-4">
                  <span className="w-10 h-10 bg-[#f97316] text-white flex items-center justify-center text-sm">10</span>
                  Contact Us
                </h2>
                <div className="space-y-4 text-gray-600 font-medium leading-relaxed uppercase tracking-tight">
                  <p>If you have any questions about this Privacy Policy, please contact us:</p>
                  <div className="flex flex-col gap-2 mt-4">
                    <div className="flex items-center gap-3 text-black font-black">
                      <RiMailLine className="text-[#f97316]" /> privacy@codekang.com
                    </div>
                    <div className="flex items-center gap-3 text-black font-black">
                      <RiGlobalLine className="text-[#f97316]" /> help.codekang.com
                    </div>
                  </div>
                </div>
              </div>

            </div>

            <div className="mt-20 p-12 border-4 border-black bg-white text-center shadow-[16px_16px_0px_0px_rgba(0,0,0,1)]">
              <RiLockLine size={48} className="mx-auto mb-6 text-[#f97316]" />
              <h3 className="text-2xl font-black uppercase mb-4">Privacy is our default</h3>
              <p className="text-gray-500 mb-8 uppercase tracking-widest text-sm">We believe your code is your business. We keep it that way.</p>
              <Link
                href="/in/security"
                className="inline-flex items-center gap-2 border-2 border-black bg-black text-white px-8 py-3 font-black uppercase tracking-widest hover:bg-[#f97316] hover:border-[#f97316] transition-all"
              >
                View Security Practices <RiArrowRightLine />
              </Link>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
