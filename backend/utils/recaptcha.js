import fetch from 'node-fetch';
import 'dotenv/config';

export async function verifyRecaptcha(token, action) {
  const secret = process.env.RECAPTCHA_SECRET_KEY;

  const res = await fetch(`https://www.google.com/recaptcha/api/siteverify`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: `secret=${secret}&response=${token}`,
  });

  const data = await res.json();

  if (data.action !== action) return 0;
  return data.score ?? 0;
}
