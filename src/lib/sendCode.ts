export function sendCode() {
  const code = Math.floor(100000 + Math.random() * 900000).toString();
  // In real app: integrate with Twilio or email service
  return code;
}
