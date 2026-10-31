import { orderDisplay } from "./data";

// Single source of truth for the visible FAQ (src/components/Faq.tsx) and the
// FAQPage JSON-LD built in src/seo.ts, so the schema always matches the page.
// Every entry carries an English answer and a Malayalam translation.
// Prices, warranties, addresses and phone numbers below are the published
// Bright Copter facts only — no invented specifications.
export const faqItems: { q: string; a: string; qMl: string; aMl: string }[] = [
  {
    q: "How do I choose the right ceiling fan?",
    a: "Consider your room, preferred finish and the features you need. Our team can help compare current models, specifications and warranty options. Exact features vary by model.",
    qMl: "ശരിയായ സീലിംഗ് ഫാൻ എങ്ങനെ തിരഞ്ഞെടുക്കാം?",
    aMl: "മുറിയുടെ വലുപ്പം, ഇഷ്ടമുള്ള നിറം, ആവശ്യമുള്ള സവിശേഷതകൾ എന്നിവ പരിഗണിക്കൂ. മോഡലുകൾ താരതമ്യം ചെയ്യാൻ ഞങ്ങളുടെ ടീം സഹായിക്കും. സവിശേഷതകൾ മോഡലിനനുസരിച്ച് വ്യത്യാസപ്പെടും.",
  },
  {
    q: "What warranty options are available?",
    a: "Base model has 2-year and 3-year warranty choices. Jumbohead and Nanohead each have 3-year, 5-year and 7-year warranty choices. Their Wood versions are separate products with their own prices. Choose a product and warranty to see the price. Confirm covered parts, exclusions and service arrangements with Bright Copter before purchase.",
    qMl: "എന്ത് വാറന്റി ഓപ്ഷനുകൾ ലഭ്യമാണ്?",
    aMl: "Base മോഡലിന് 2 വർഷവും 3 വർഷവും വാറന്റി ഓപ്ഷനുകൾ ഉണ്ട്. Jumbohead, Nanohead മോഡലുകൾക്ക് 3, 5, 7 വർഷം വാറന്റി ഓപ്ഷനുകൾ ഉണ്ട്. Wood മോഡലുകൾ പ്രത്യേക ഉൽപ്പന്നങ്ങളാണ്. വാങ്ങുന്നതിന് മുമ്പ് നിബന്ധനകൾ സ്ഥിരീകരിക്കൂ.",
  },
  {
    q: "Can you deliver to my location?",
    a: "Share your delivery PIN code with our team. We will confirm current serviceability, delivery charges and estimated timing before accepting an order.",
    qMl: "എന്റെ സ്ഥലത്ത് ഡെലിവറി ലഭിക്കുമോ?",
    aMl: "ഡെലിവറി പിൻ കോഡ് ടീമിനോട് പറയൂ. സേവന ലഭ്യത, ചാർജ്, സമയം എന്നിവ ഓർഡർ സ്വീകരിക്കുന്നതിന് മുമ്പ് സ്ഥിരീകരിക്കും.",
  },
  {
    q: "Is installation included?",
    a: "Installation is not assumed to be included. Ask our team whether it is available for your location and what charges and arrangements apply.",
    qMl: "ഇൻസ്റ്റലേഷൻ ഉൾപ്പെടുത്തിയിട്ടുണ്ടോ?",
    aMl: "ഇൻസ്റ്റലേഷൻ ഉൾപ്പെട്ടിട്ടുണ്ടെന്ന് കരുതരുത്. നിങ്ങളുടെ സ്ഥലത്ത് ലഭ്യമാണോ, ചാർജ് എത്രയെന്ന് ടീമിനോട് ചോദിക്കൂ.",
  },
  {
    q: "How do I place an order?",
    a: `Add your selection to the bag, enter your delivery address and choose a payment preference. Review the details and select Place order via WhatsApp. A ready-to-send order message opens for ${orderDisplay}. Tap Send in WhatsApp; our staff then confirms the actual product, total, delivery and final payment mode. No payment is collected on the website.`,
    qMl: "എങ്ങനെ ഓർഡർ ചെയ്യാം?",
    aMl: "തിരഞ്ഞെടുപ്പ് ബാഗിൽ ചേർക്കൂ, വിലാസവും പേയ്മെന്റ് രീതിയും നൽകൂ, WhatsApp വഴി ഓർഡർ അയയ്ക്കൂ. സ്റ്റാഫ് വിശദാംശങ്ങൾ സ്ഥിരീകരിക്കും. വെബ്സൈറ്റിൽ പേയ്മെന്റ് വാങ്ങുന്നില്ല.",
  },
  {
    q: "What if my product needs care or repair?",
    a: "Use the service request form with your product and purchase information. The team will assess the issue and applicable warranty terms, then confirm the next step and any charges before paid work.",
    qMl: "ഫാനിന് സർവീസോ റിപ്പയറോ വേണമെങ്കിൽ എന്ത് ചെയ്യണം?",
    aMl: "സർവീസ് അപേക്ഷാ ഫോമിൽ ഉൽപ്പന്നവും വാങ്ങൽ വിവരങ്ങളും നൽകൂ. ടീം പ്രശ്നവും വാറന്റി നിബന്ധനകളും പരിശോധിച്ച് അടുത്ത നടപടിയും ചാർജും അറിയിക്കും.",
  },
  {
    q: "Does a BLDC ceiling fan use less electricity?",
    a: "Yes. A BLDC motor is more efficient than a conventional induction motor, so a BLDC fan needs less power to move the same air. How much you save depends on the model and how many hours a day the fan runs.",
    qMl: "BLDC സീലിംഗ് ഫാൻ കുറഞ്ഞ വൈദ്യുതി ഉപയോഗിക്കുമോ?",
    aMl: "അതെ. BLDC മോട്ടോർ സാധാരണ ഇൻഡക്ഷൻ മോട്ടോറിനേക്കാൾ കാര്യക്ഷമമാണ്, അതുകൊണ്ട് അതേ കാറ്റിന് കുറഞ്ഞ വൈദ്യുതി മതി. ലാഭം മോഡലിനെയും ഫാൻ ദിവസം എത്ര മണിക്കൂർ ഓടുന്നുവെന്നതിനെയും ആശ്രയിച്ചിരിക്കും.",
  },
  {
    q: "How much does a Bright Copter ceiling fan cost in Kerala?",
    a: "Ceiling fans are priced ₹2,350–₹4,700, depending on the model and warranty option: Base 2–3 years, Jumbohead and Nanohead 3, 5 or 7 years. Choose a model and warranty to see its price. Our team confirms the final total, delivery and payment on WhatsApp.",
    qMl: "കേരളത്തിൽ Bright Copter സീലിംഗ് ഫാനിന്റെ വില എത്രയാണ്?",
    aMl: "മോഡലും വാറന്റിയും അനുസരിച്ച് ₹2,350 മുതൽ ₹4,700 വരെ. Base മോഡലിന് 2–3 വർഷം, Jumbohead, Nanohead മോഡലുകൾക്ക് 3, 5, 7 വർഷം വാറന്റി. വില കാണാൻ മോഡലും വാറന്റിയും തിരഞ്ഞെടുക്കൂ. അന്തിമ തുക WhatsApp-ൽ സ്ഥിരീകരിക്കും.",
  },
  {
    q: "Where can I buy a Bright Copter fan in Thrissur, Kerala?",
    a: "Visit our store at ST.JOHN'S BUILDING, Parappur, Thrissur, Keralam 680552, or order on WhatsApp at 79073 44474. Our team confirms availability and delivery, and service technicians work across Kerala.",
    qMl: "തൃശൂരിൽ Bright Copter ഫാൻ എവിടെ നിന്ന് വാങ്ങാം?",
    aMl: "ഞങ്ങളുടെ സ്റ്റോർ: ST.JOHN'S BUILDING, Parappur, Thrissur, Keralam 680552. WhatsApp വഴിയും ഓർഡർ ചെയ്യാം: 79073 44474. ലഭ്യതയും ഡെലിവറിയും ടീം സ്ഥിരീകരിക്കും. കേരളത്തിലുടനീളം സർവീസ് ടെക്നീഷ്യന്മാർ ഉണ്ട്.",
  },
];
