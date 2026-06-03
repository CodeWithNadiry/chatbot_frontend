const PrivacyPolicy = () => {
  return (
    <div className="max-w-3xl mx-auto px-6 py-12 text-gray-800">
      <h1 className="text-3xl font-bold mb-6">Privacy Policy</h1>
      <p className="text-sm text-gray-500 mb-8">Last updated: June 3, 2026</p>

      <section className="mb-8">
        <h2 className="text-xl font-semibold mb-3">1. Introduction</h2>
        <p>IntelliChat is committed to protecting your privacy. This Privacy Policy explains how we collect, use, and safeguard your information when you use our AI-powered knowledge base chatbot.</p>
      </section>

      <section className="mb-8">
        <h2 className="text-xl font-semibold mb-3">2. Information We Collect</h2>
        <p>We collect the following information:</p>
        <ul className="list-disc pl-6 mt-2 space-y-1">
          <li>Email address and account information when you register</li>
          <li>Documents you upload to the platform</li>
          <li>Chat messages and conversation history</li>
          <li>Gmail OAuth tokens when you connect your Gmail account</li>
        </ul>
      </section>

      <section className="mb-8">
        <h2 className="text-xl font-semibold mb-3">3. How We Use Gmail Access</h2>
        <p>When you connect your Gmail account, we request permission only to <strong>send emails on your behalf</strong>. We do NOT:</p>
        <ul className="list-disc pl-6 mt-2 space-y-1">
          <li>Read your emails</li>
          <li>Store your email contents</li>
          <li>Share your Gmail data with any third party</li>
          <li>Send emails without your explicit instruction</li>
        </ul>
        <p className="mt-2">Gmail access tokens are stored securely and used only when you explicitly ask the chatbot to send an email.</p>
      </section>

      <section className="mb-8">
        <h2 className="text-xl font-semibold mb-3">4. Data Storage</h2>
        <p>Your data is stored securely in our database. We do not sell or share your personal information with third parties.</p>
      </section>

      <section className="mb-8">
        <h2 className="text-xl font-semibold mb-3">5. Data Deletion</h2>
        <p>You can request deletion of your account and all associated data at any time by contacting us at <strong>usmannadiry.dev@gmail.com</strong>.</p>
      </section>

      <section className="mb-8">
        <h2 className="text-xl font-semibold mb-3">6. Third Party Services</h2>
        <p>We use the following third party services:</p>
        <ul className="list-disc pl-6 mt-2 space-y-1">
          <li>Google Gmail API — for sending emails</li>
          <li>HuggingFace — for AI language model processing</li>
          <li>Groq — for AI tool detection</li>
        </ul>
      </section>

      <section className="mb-8">
        <h2 className="text-xl font-semibold mb-3">7. Contact</h2>
        <p>If you have any questions about this Privacy Policy, contact us at <strong>usmannadiry.dev@gmail.com</strong>.</p>
      </section>
    </div>
  );
};

export default PrivacyPolicy;