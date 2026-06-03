const TermsOfService = () => {
  return (
    <div className="max-w-3xl mx-auto px-6 py-12 text-gray-800">
      <h1 className="text-3xl font-bold mb-6">Terms of Service</h1>
      <p className="text-sm text-gray-500 mb-8">Last updated: June 3, 2026</p>

      <section className="mb-8">
        <h2 className="text-xl font-semibold mb-3">1. Acceptance of Terms</h2>
        <p>By accessing or using IntelliChat, you agree to be bound by these Terms of Service. If you do not agree to these terms, please do not use our service.</p>
      </section>

      <section className="mb-8">
        <h2 className="text-xl font-semibold mb-3">2. Description of Service</h2>
        <p>IntelliChat is an AI-powered knowledge base chatbot that allows users to:</p>
        <ul className="list-disc pl-6 mt-2 space-y-1">
          <li>Upload documents and ask questions about their content</li>
          <li>Have conversations powered by AI</li>
          <li>Send emails via their connected Gmail account</li>
        </ul>
      </section>

      <section className="mb-8">
        <h2 className="text-xl font-semibold mb-3">3. User Accounts</h2>
        <p>You are responsible for:</p>
        <ul className="list-disc pl-6 mt-2 space-y-1">
          <li>Maintaining the confidentiality of your account credentials</li>
          <li>All activities that occur under your account</li>
          <li>Ensuring the information you provide is accurate</li>
        </ul>
      </section>

      <section className="mb-8">
        <h2 className="text-xl font-semibold mb-3">4. Gmail Integration</h2>
        <p>When you connect your Gmail account to IntelliChat:</p>
        <ul className="list-disc pl-6 mt-2 space-y-1">
          <li>You grant us permission to send emails on your behalf only when you explicitly request it</li>
          <li>You are responsible for the content of emails sent through our service</li>
          <li>You can disconnect your Gmail account at any time</li>
          <li>We will never send emails without your explicit instruction</li>
        </ul>
      </section>

      <section className="mb-8">
        <h2 className="text-xl font-semibold mb-3">5. Acceptable Use</h2>
        <p>You agree NOT to use IntelliChat to:</p>
        <ul className="list-disc pl-6 mt-2 space-y-1">
          <li>Send spam or unsolicited emails</li>
          <li>Upload illegal or harmful content</li>
          <li>Violate any applicable laws or regulations</li>
          <li>Attempt to gain unauthorized access to our systems</li>
          <li>Harass or harm other users</li>
        </ul>
      </section>

      <section className="mb-8">
        <h2 className="text-xl font-semibold mb-3">6. Intellectual Property</h2>
        <p>Documents you upload remain your property. By uploading them, you grant us a limited license to process them solely for the purpose of providing our service to you.</p>
      </section>

      <section className="mb-8">
        <h2 className="text-xl font-semibold mb-3">7. Disclaimer of Warranties</h2>
        <p>IntelliChat is provided as is without any warranties of any kind. We do not guarantee that our service will be uninterrupted, error-free, or completely accurate. AI responses may sometimes be incorrect — always verify important information.</p>
      </section>

      <section className="mb-8">
        <h2 className="text-xl font-semibold mb-3">8. Limitation of Liability</h2>
        <p>We are not liable for any damages arising from your use of IntelliChat, including but not limited to emails sent through our service, AI-generated responses, or data loss.</p>
      </section>

      <section className="mb-8">
        <h2 className="text-xl font-semibold mb-3">9. Termination</h2>
        <p>We reserve the right to suspend or terminate your account if you violate these terms. You may also delete your account at any time by contacting us.</p>
      </section>

      <section className="mb-8">
        <h2 className="text-xl font-semibold mb-3">10. Changes to Terms</h2>
        <p>We may update these terms from time to time. Continued use of the service after changes means you accept the new terms.</p>
      </section>

      <section className="mb-8">
        <h2 className="text-xl font-semibold mb-3">11. Contact</h2>
        <p>For any questions about these Terms of Service, contact us at <strong>usmannadiry.dev@gmail.com</strong>.</p>
      </section>
    </div>
  );
};

export default TermsOfService;