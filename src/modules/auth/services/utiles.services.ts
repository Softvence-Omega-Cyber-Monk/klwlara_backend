// src/utils/otp.util.ts
export function generateOTP(length = 6): string {
  const digits = '0123456789';
  let otp = '';
  for (let i = 0; i < length; i++) {
    otp += digits[Math.floor(Math.random() * 10)];
  }
  return otp;
}

export function maskPhone(phone: string): string {
  if (!phone) return '';

  const visibleStart = 5;
  const visibleEnd = 1;

  if (phone.length <= visibleStart + visibleEnd) return phone;

  const start = phone.slice(0, visibleStart);
  const end = phone.slice(-visibleEnd);
  const masked = '*'.repeat(phone.length - visibleStart - visibleEnd);

  return `${start}${masked}${end}`;
}

export function maskEmail(email: string): string {
  if (!email) return '';
  const [user, domain] = email.split('@');
  if (!domain) return email;

  const visibleUser = user.slice(0, 3); // keep first 3 chars
  const hidden = '*'.repeat(user.length - 3); // mask the rest
  return `${visibleUser}${hidden}@${domain}`;
}
