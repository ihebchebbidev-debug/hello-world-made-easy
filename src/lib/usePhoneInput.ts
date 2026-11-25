/**
 * Normalize a raw phone string the same way the back-end does:
 *  1. Strip all non-digit characters.
 *  2. Remove a leading zero.
 *  3. Keep the result if it is exactly 9 digits, otherwise return "".
 *
 * Usage:
 *   const [phone, handlePhone] = usePhoneInput("");
 *   <Input value={phone} onChange={handlePhone} />
 */
export function normalizePhone(raw: string): string {
  const digits = raw.replace(/\D+/g, "");
  const noLeadingZero = digits.replace(/^0+/, "");
  return /^\d{9}$/.test(noLeadingZero) ? noLeadingZero : noLeadingZero.slice(0, 9);
}

import { useState, ChangeEvent } from "react";

export function usePhoneInput(
  initial: string
): [string, (e: ChangeEvent<HTMLInputElement>) => void, (v: string) => void] {
  const [value, setValue] = useState<string>(initial);

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    // Allow only digits while typing; strip everything else instantly
    const stripped = e.target.value.replace(/\D+/g, "").replace(/^0+/, "").slice(0, 9);
    setValue(stripped);
  };

  const set = (v: string) => setValue(normalizePhone(v));

  return [value, handleChange, set];
}
