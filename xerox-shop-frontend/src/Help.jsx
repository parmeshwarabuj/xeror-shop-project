
// eslint-disable-next-line no-unused-vars
import React, { useState } from "react";
import "./Help.css";

const faqs = [
  {
    question: "How can I place a print order?",
    answer:
      "Choose a print shop, upload your document, select the required print options and quantity, then place your order.",
  },
  {
    question: "Which file formats can I upload?",
    answer:
      "PDF is recommended for printing. Other formats are supported only if the upload feature in your application allows them.",
  },
  {
    question: "How can I check my order status?",
    answer:
      "Sign in to your account and open your orders section to view the latest status available for your order.",
  },
  {
    question: "How do I know the printing cost?",
    answer:
      "The cost depends on the shop's pricing, number of pages, copies, colour selection and other selected print options.",
  },
  {
    question: "What if my order has a problem?",
    answer:
      "Contact the shop handling your order or email our support team with your order details and a description of the issue.",
  },
  {
    question: "What should I do if payment fails?",
    answer:
      "Check your payment status before trying again. If money was deducted, keep the transaction reference and contact support.",
  },
];

export default function Help({ onNavigate }) {
  const [search, setSearch] = useState("");
  const [openFaq, setOpenFaq] = useState(0);

  const filteredFaqs = faqs.filter((faq) =>
    `${faq.question} ${faq.answer}`
      .toLowerCase()
      .includes(search.toLowerCase())
  );

  return (
    <main className="help-page">
      <section className="help-hero">
        <button
  type="button"
  onClick={() => onNavigate?.('order')}
  className="help-back-button"
>
  ← Back to Home
</button>
        <span className="help-tag">XERoxWALA SUPPORT</span>
        <h1>How can we help you?</h1>
        <p>
          Find answers about printing, orders, payments and using XeroxWala.
        </p>

        <div className="help-search">
          <span aria-hidden="true">⌕</span>
          <input
            type="search"
            placeholder="Search your question..."
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setOpenFaq(0);
            }}
            aria-label="Search frequently asked questions"
          />
        </div>
      </section>

      <section className="help-content">
        <div className="help-section-heading">
          <span>QUICK SUPPORT</span>
          <h2>What do you need help with?</h2>
        </div>

        <div className="help-cards">
          <a className="help-card" href="/orders">
            <div className="help-icon">📦</div>
            <h3>My Orders</h3>
            <p>Check your order history and available status updates.</p>
            <span>View orders →</span>
          </a>

          <a className="help-card" href="/shops">
            <div className="help-icon">🖨️</div>
            <h3>Printing Services</h3>
            <p>Explore available shops and printing options.</p>
            <span>Find a shop →</span>
          </a>

          <a className="help-card" href="mailto:parmeshwarabuj219@gmail.com?subject=XeroxWala%20Support">
            <div className="help-icon">💬</div>
            <h3>Contact Support</h3>
            <p>Send us your question or report a problem.</p>
            <span>Email support →</span>
          </a>
        </div>

        <div className="faq-section">
          <div className="help-section-heading">
            <span>GOT QUESTIONS?</span>
            <h2>Frequently asked questions</h2>
            <p>Find quick answers to common questions.</p>
          </div>

          <div className="faq-list">
            {filteredFaqs.length > 0 ? (
              filteredFaqs.map((faq, index) => (
                <div className="faq-item" key={faq.question}>
                  <button
                    className="faq-question"
                    onClick={() =>
                      setOpenFaq(openFaq === index ? -1 : index)
                    }
                    aria-expanded={openFaq === index}
                  >
                    <span>{faq.question}</span>
                    <span className="faq-plus">
                      {openFaq === index ? "−" : "+"}
                    </span>
                  </button>

                  {openFaq === index && (
                    <p className="faq-answer">{faq.answer}</p>
                  )}
                </div>
              ))
            ) : (
              <p className="faq-empty">
                No matching questions found. Try another search.
              </p>
            )}
          </div>
        </div>

        <div className="help-contact-banner">
          <div>
            <h2>Still need help?</h2>
            <p>
              Send us an email and include your order details if relevant.
            </p>
          </div>
          <a href="mailto:parmeshwarabuj219@gmail.com?subject=XeroxWala%20Help">
            Contact Us ↗
          </a>
        </div>
      </section>
    </main>
  );
}
