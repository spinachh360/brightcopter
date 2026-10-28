// Plain-text validation shared with the optional Node 24 API template.
// React escapes these strings on output. Never render them as raw HTML.
export function plainText(value: unknown, max: number, multiline = false): string {
  if (typeof value !== 'string') throw new Error('Please enter text in this field.');
  const text = value.normalize('NFC').replace(/\r\n?/g, '\n')
    .replace(/[\u0000-\u0008\u000b\u000c\u000e-\u001f\u007f-\u009f\u202a-\u202e\u2066-\u2069]/g, '')
    .trim();
  if (text.length > max) throw new Error(`Please keep this field to ${max} characters or fewer.`);
  return multiline ? text : text.replace(/[\n\t]+/g, ' ');
}
export function phoneNumber(value: unknown): string {
  const text = plainText(value, 18);
  if (!/^[+0-9 ()-]+$/.test(text) || !/^\d{10,15}$/.test(text.replace(/\D/g, '')))
    throw new Error('Please enter a valid mobile number with 10–15 digits.');
  return text;
}
export type OrderDetails = {
  name: string; phone: string; email: string; address: string; landmark: string;
  city: string; state: string; pin: string; note: string;
};
export function validateOrder(input: OrderDetails): OrderDetails {
  const result = {
    name: plainText(input.name, 100), phone: phoneNumber(input.phone),
    email: plainText(input.email, 254), address: plainText(input.address, 400, true),
    landmark: plainText(input.landmark, 150), city: plainText(input.city, 80),
    state: plainText(input.state, 80), pin: plainText(input.pin, 6), note: plainText(input.note, 500, true),
  };
  if (!result.name || !result.address || !result.city || !result.state)
    throw new Error('Please complete your name and delivery address.');
  if (!/^\d{6}$/.test(result.pin)) throw new Error('Please enter a valid 6-digit PIN code.');
  if (result.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(result.email))
    throw new Error('Please enter a valid email address.');
  return result;
}
export function validateEnquiry(input: unknown) {
  if (!input || typeof input !== 'object' || Array.isArray(input)) throw new Error('A JSON object is required.');
  const data = input as Record<string, unknown>;
  if (Object.keys(data).some(key => !['name', 'phone', 'details'].includes(key))) throw new Error('Unexpected field.');
  const result = { name: plainText(data.name, 100), phone: phoneNumber(data.phone), details: plainText(data.details, 1500, true) };
  if (!result.name || !result.details) throw new Error('Name and enquiry details are required.');
  return result;
}
