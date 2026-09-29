import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Terms of Service | Bharat News Bulletin",
  description: "Terms of Service and User Agreement for Bharat News Bulletin (BNB).",
};

export default function TermsPage() {
  return (
    <div className="bg-gray-50 dark:bg-[#111111] min-h-screen py-16 px-6 font-sans text-gray-900 dark:text-gray-100 transition-colors duration-300">
      <div className="max-w-4xl mx-auto bg-white dark:bg-[#161616] p-8 md:p-12 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-800">
        
        <div className="mb-10 border-b border-gray-200 dark:border-gray-800 pb-8">
          <h1 className="text-3xl md:text-4xl font-extrabold text-gray-900 dark:text-white tracking-tight mb-4">
            Terms of Service
          </h1>
          <p className="text-gray-500 dark:text-gray-400 text-sm">
            Last updated: {new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
          </p>
        </div>

        <div className="space-y-8 text-base leading-relaxed text-gray-700 dark:text-gray-300">
          
          <section>
            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">1. Acceptance of Terms</h2>
            <p>
              Welcome to Bharat News Bulletin (BNB). By accessing or using our website, mobile application, or any of our digital services (collectively, the "Services"), you agree to comply with and be bound by these Terms of Service. If you do not agree with any part of these terms, please do not use our Services.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">2. Use of Content</h2>
            <p className="mb-4">
              All content published on Bharat News Bulletin, including articles, photographs, videos, graphics, audio, and the overall design (collectively, the "Content"), is protected by copyright, trademark, and other intellectual property laws.
            </p>
            <ul className="list-disc pl-6 space-y-2">
              <li>You may use the Content for personal, non-commercial purposes only.</li>
              <li>You may not reproduce, distribute, modify, create derivative works of, publicly display, or commercially exploit any of the Content without our prior written consent.</li>
              <li>When sharing our Content on social media, you must provide proper attribution and link back to the original article on our website.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">3. User Contributions</h2>
            <p className="mb-4">
              Our Services may allow users to post comments, submit feedback, or otherwise contribute content ("User Contributions"). By submitting User Contributions, you grant Bharat News Bulletin a non-exclusive, royalty-free, perpetual, and worldwide license to use, reproduce, modify, adapt, publish, translate, and distribute your contributions.
            </p>
            <p>
              You agree not to post content that is:
            </p>
            <ul className="list-disc pl-6 space-y-2 mt-2">
              <li>Defamatory, abusive, harassing, threatening, or otherwise violates the legal rights of others.</li>
              <li>Hateful, discriminatory, or promotes violence.</li>
              <li>False, misleading, or constitutes spam or unauthorized advertising.</li>
            </ul>
            <p className="mt-2">
              We reserve the right to remove any User Contributions at our sole discretion, without notice.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">4. Accuracy of Information</h2>
            <p>
              While we strive to provide accurate, up-to-date, and reliable news, we do not warrant that all information is completely error-free or exhaustive. News is a developing entity, and information may change rapidly. We are not liable for any reliance placed on the information provided on our Services. If you notice a factual error, please contact our editorial team.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">5. Links to Third-Party Websites</h2>
            <p>
              Our Services may contain links to third-party websites or services that are not owned or controlled by Bharat News Bulletin. We have no control over, and assume no responsibility for, the content, privacy policies, or practices of any third-party websites. You acknowledge and agree that we shall not be responsible or liable, directly or indirectly, for any damage or loss caused by the use of such external sites.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">6. Disclaimer of Warranties</h2>
            <p>
              The Services are provided on an "AS IS" and "AS AVAILABLE" basis, without any warranties of any kind, either express or implied. Bharat News Bulletin does not warrant that the Services will be uninterrupted, secure, or free from viruses or other harmful components.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">7. Limitation of Liability</h2>
            <p>
              To the fullest extent permitted by applicable law, in no event shall Bharat News Bulletin, its affiliates, directors, employees, or agents be liable for any indirect, incidental, special, consequential, or punitive damages arising out of or related to your use of the Services.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">8. Changes to the Terms</h2>
            <p>
              We reserve the right, at our sole discretion, to modify or replace these Terms of Service at any time. We will provide notice of any material changes by posting the new Terms on this page. Your continued use of the Services following the posting of any changes constitutes acceptance of those changes.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">9. Contact Us</h2>
            <p>
              If you have any questions about these Terms of Service, please contact us at:
            </p>
            <div className="mt-4 p-4 bg-gray-50 dark:bg-gray-900 rounded-lg border border-gray-100 dark:border-gray-800">
              <p className="font-semibold text-gray-900 dark:text-white">Bharat News Bulletin Legal Team</p>
              <p>Email: <a href="mailto:legal@bharatnewsbulletin.com" className="text-blue-600 dark:text-blue-400 hover:underline">legal@bharatnewsbulletin.com</a></p>
              <p className="mt-2 text-sm text-gray-500">
                You can also reach us via our <Link href="/contact" className="text-blue-600 dark:text-blue-400 hover:underline">Contact Page</Link>.
              </p>
            </div>
          </section>

        </div>
      </div>
    </div>
  );
}
