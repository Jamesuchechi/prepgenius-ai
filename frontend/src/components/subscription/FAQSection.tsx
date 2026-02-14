'use client';

import React from 'react';

interface FAQItem {
  question: string;
  answer: string;
}

interface FAQSectionProps {
  faqs: FAQItem[];
}

const FAQSection: React.FC<FAQSectionProps> = ({ faqs }) => {
  return (
    <div className="animate-fadeInUp" style={{ animationDelay: '0.8s' }}>
      <h2 className="font-display text-3xl font-bold text-black mb-8">Frequently Asked Questions</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {faqs.map((faq, index) => (
          <div
            key={index}
            className="bg-white rounded-2xl p-6 border-2 border-transparent hover:border-orange transition-all"
          >
            <h4 className="font-semibold text-black mb-2 text-base">{faq.question}</h4>
            <p className="text-gray-600 text-sm leading-relaxed">{faq.answer}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default FAQSection;
