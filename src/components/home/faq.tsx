import { useState } from "react";
import { FaMinus, FaPlus } from "react-icons/fa6";
import { motion } from "motion/react";

function FAQ() {
  const [openFaqId, setOpenFaqId] = useState<number | null>(null);

  const faqList = [
    {
      id: 1,
      question: "Can I apply for funding ?",
      answer:
        "Founders will soon become eligible for Mamun ECC funding by actively building and demonstrating progress. Being clear about what they aim to create. Consistently engaging with other builders on the platform. Building trust over time through action.",
    },
    {
      id: 2,
      question: "What is the Mamun Co-founder Match service?",
      answer:
        "Mamun Co-founder Match is a platform that connects aspiring Muslim entrepreneurs with complementary skills and a shared commitment to social impact.",
    },
    {
      id: 3,
      question: "What are the benefits of using Mamun Co-founder Match?",
      answer: [
        "Save time and effort compared to traditional networking methods.",
        "Increase your chances of finding a compatible co-founder who shares your values and vision.",
        "Gain access to a network of experienced Muslim entrepreneurs for mentorship and guidance.",
        "Become part of a supportive community of Muslim entrepreneurs.",
      ],
    },
    {
      id: 4,
      question: "Is this service only for Muslims living in a specific region?",
      answer:
        "No, Mamun Co-founder Matching is a global platform open to Muslim and people from all walks of life  worldwide.",
    },
    {
      id: 5,
      question: "What is the Matching process like ?",
      answer:
        "The algorithm considers factors like your skills, experience, desired venture focus, and  Islamic values to connect you with compatible co-founders.",
    },
    {
      id: 6,
      question: "Can I influence who I get matched with?",
      answer:
        "Yes, you can set preferences based on specific skills, experience, and venture type  you're interested in.",
    },
    {
      id: 7,
      question: "What happens if I don't get matched with anyone?",
      answer:
        "Mamun is constantly growing its user base. You can refine your profile or preferences  and keep an eye out for new matches as they become available.",
    },
    {
      id: 8,
      question:
        "How does Mamun ensure the safety and security of my information?",
      answer:
        "Mamun employs robust security measures to protect user data. We recommend you review our privacy policy for detailed information.",
    },
    {
      id: 9,
      question: "How do I know the person I'm matched with is trustworthy?",
      answer:
        "Mamun uses background checks (where applicable) and encourages transparent  communication between potential co-founders. However, it's ultimately your responsibility  to assess your comfort level with any potential partner.",
    },
    {
      id: 10,
      question:
        "How does Mamun consider Islamic values in the matching process?",
      answer:
        "The matching algorithm may consider factors like preferred work styles and communication styles, work industry and location.",
    },
    {
      id: 11,
      question:
        "Can I connect with co-founders who want to launch Sharia-compliant ventures?",
      answer:
        "Yes, you can specify your interest in Sharia-compliant ventures in your profile and  preferences. Mamun might also explore integrating with Islamic financial institutions in  the future to facilitate access to Sharia-compliant funding.",
    },
  ];

  const toggleFaq = (faqId: number) => {
    setOpenFaqId(openFaqId === faqId ? null : faqId);
  };

  return (
    <section className="mt-20 w-full px-6 py-20 sm:px-8 lg:px-12">
      <div className="mx-auto max-w-4xl">
        <div className="mb-16 text-center">
          <h2 className="heading-5 mb-4">Frequently Asked Questions</h2>
          <p className="text-lg text-gray-300">
            Everything you need to know about Mamun
          </p>
        </div>
      </div>
      <hr className="mb-10 border-gray-400" />
      {faqList.map((faq) => {
        const isOpen = openFaqId === faq.id;
        return (
          <div
            key={faq.id + "-" + faq.question.substring(0, 4)}
            className="mb-10"
          >
            {/* - Question Block (Clickable) - */}
            <div
              className="flex cursor-pointer items-center justify-between rounded-lg p-4 transition-all duration-200 hover:bg-gray-800/30"
              onClick={() => toggleFaq(faq.id)}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") {
                  e.preventDefault();
                  toggleFaq(faq.id);
                }
              }}
            >
              <p className="pr-4 text-left text-xl font-semibold">
                {faq.question}
              </p>
              <div className="flex-shrink-0">
                {isOpen ? (
                  <FaMinus className="text-yellow-300" />
                ) : (
                  <FaPlus className="text-yellow-300" />
                )}
              </div>
            </div>

            {/* - Answer - */}
            {isOpen && (
              <motion.div
                className="mt-4 ml-4 text-left text-gray-300"
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.3, ease: "easeOut" }}
              >
                {Array.isArray(faq.answer) ? (
                  <ul className="list-inside list-disc space-y-2">
                    {faq.answer.map((item, index) => (
                      <li key={index}>{item}</li>
                    ))}
                  </ul>
                ) : (
                  <p>{faq.answer}</p>
                )}
              </motion.div>
            )}

            <hr className="mt-10 border-gray-400" />
          </div>
        );
      })}
    </section>
  );
}

export default FAQ;
