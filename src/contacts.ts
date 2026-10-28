import { formatContactNumber, resolveContactNumbers } from '../shared/contacts';

// This small module is safe to use in the error boundary and SEO/policy code.
export const { careNumber, orderNumber } = resolveContactNumbers({
  VITE_CUSTOMER_CARE_WHATSAPP: import.meta.env.VITE_CUSTOMER_CARE_WHATSAPP,
  VITE_ORDER_WHATSAPP: import.meta.env.VITE_ORDER_WHATSAPP,
});
export const careDisplay = formatContactNumber(careNumber);
export const orderDisplay = formatContactNumber(orderNumber);
export const whatsapp = (message = '') =>
  `https://wa.me/${careNumber}${message ? `?text=${encodeURIComponent(message)}` : ''}`;
export const orderWhatsapp = (message = '') =>
  `https://wa.me/${orderNumber}${message ? `?text=${encodeURIComponent(message)}` : ''}`;
