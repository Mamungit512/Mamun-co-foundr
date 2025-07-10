import { useState } from "react";
import { FaMinus, FaPlus } from "react-icons/fa6";

function FAQ() {
  const [openFaqId, setOpenFaqId] = useState<number | null>(null);

  const faqList = [
    {
      id: 1,
      question: "What is the Mamun Co-founder Match service?",
      answer:
        "Mamun Co-founder Match is a platform that connects aspiring Muslim entrepreneurs with complementary skills and a shared commitment to social impact.",
    },
    {
      id: 2,
      question: "What are the benefits of using Mamun Co-founder Match?",
      answer: [
        "Save time and effort compared to traditional networking methods.",
        "Increase your chances of finding a compatible co-founder who shares your values and vision.",
        "Gain access to a network of experienced Muslim entrepreneurs for mentorship and guidance.",
        "Become part of a supportive community of Muslim entrepreneurs.",
      ],
    },
    {
      id: 3,
      question: "Is this service only for Muslims living in a specific region?",
      answer:
        "No, Mamun Co-founder Matching is a global platform open to Muslim and people from all walks of life  worldwide.",
    },
    {
      id: 4,
      question: "What is the Matching process like ?",
      answer:
        "The algorithm considers factors like your skills, experience, desired venture focus, and  Islamic values to connect you with compatible co-founders.",
    },
    {
      id: 5,
      question: "Can I influence who I get matched with?",
      answer:
        "Yes, you can set preferences based on specific skills, experience, and venture type  you're interested in.",
    },
    {
      id: 6,
      question: "What happens if I don't get matched with anyone?",
      answer:
        "Mamun is constantly growing its user base. You can refine your profile or preferences  and keep an eye out for new matches as they become available.",
    },
    {
      id: 7,
      question:
        "How does Mamun ensure the safety and security of my information?",
      answer:
        "Mamun employs robust security measures to protect user data. We recommend you review our privacy policy for detailed information.",
    },
    {
      id: 8,
      question: "How do I know the person I'm matched with is trustworthy?",
      answer:
        "Mamun uses background checks (where applicable) and encourages transparent  communication between potential co-founders. However, it's ultimately your responsibility  to assess your comfort level with any potential partner.",
    },
    {
      id: 9,
      question:
        "How does Mamun consider Islamic values in the matching process?",
      answer:
        "The matching algorithm may consider factors like preferred work styles and communication styles, work industry and location.",
    },
    {
      id: 10,
      question:
        "Can I connect with co-founders who want to launch Sharia-compliant ventures?",
      answer:
        "Yes, you can specify your interest in Sharia-compliant ventures in your profile and  preferences. Mamun might also explore integrating with Islamic financial institutions in  the future to facilitate access to Sharia-compliant funding.",
    },
  ];

  return (
    <section className="mt-50 w-full">
      <h2 className="heading-5 mb-10">Frequently Asked Questions</h2>
      <hr className="mb-10 border-gray-400" />
      {faqList.map((faq) => {
        const isOpen = openFaqId === faq.id;
        return (
          <div
            key={faq.id + "-" + faq.question.substring(0, 4)}
            className="mb-10"
          >
            {/* - Question - */}
            <div className="flex items-center justify-between">
              <p className="text-left text-xl font-semibold">{faq.question}</p>
              <button
                className="cursor-pointer"
                onClick={() => setOpenFaqId(isOpen ? null : faq.id)}
              >
                {isOpen ? <FaMinus /> : <FaPlus />}
              </button>
            </div>

            {/* - Answer - */}
            {isOpen && (
              <div className="mt-6 text-left">
                <p>{faq.answer}</p>
              </div>
            )}

            <hr className="mt-10 border-gray-400" />
          </div>
        );
      })}
    </section>
  );
}

export default FAQ;
