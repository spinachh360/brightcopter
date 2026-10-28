// Public defaults: change each number here once, or override it at build time.
export const defaultContactNumbers = {
  careNumber: "919400885633",
  orderNumber: "917907344474",
} as const;

export function resolveContactNumbers(env: {
  VITE_CUSTOMER_CARE_WHATSAPP?: string;
  VITE_ORDER_WHATSAPP?: string;
} = {}) {
  const numbers = {
    careNumber: env.VITE_CUSTOMER_CARE_WHATSAPP || defaultContactNumbers.careNumber,
    orderNumber: env.VITE_ORDER_WHATSAPP || defaultContactNumbers.orderNumber,
  };
  for (const number of Object.values(numbers)) {
    if (!/^\d{10,15}$/.test(number)) throw new Error('Public WhatsApp numbers must contain 10–15 digits.');
  }
  return numbers;
}

export function formatContactNumber(number: string) {
  return /^91\d{10}$/.test(number)
    ? `+91 ${number.slice(2, 7)} ${number.slice(7)}`
    : `+${number}`;
}
