// lib/password.ts
// Keep these rules in sync with PASSWORD_RULES in the backend adminController.

export interface PasswordRule {
  id: string;
  label: string;
  test: (password: string) => boolean;
}

export const PASSWORD_RULES: PasswordRule[] = [
  { id: "length", label: "12+ characters", test: (p) => p.length >= 12 },
  {
    id: "case",
    label: "Upper & lowercase",
    test: (p) => /[a-z]/.test(p) && /[A-Z]/.test(p),
  },
  { id: "number", label: "A number (0-9)", test: (p) => /\d/.test(p) },
  {
    id: "symbol",
    label: "Special symbol (!@#$)",
    test: (p) => /[^A-Za-z0-9]/.test(p),
  },
];

export function passedRuleCount(password: string): number {
  return PASSWORD_RULES.filter((rule) => rule.test(password)).length;
}

export function isPasswordValid(password: string): boolean {
  return passedRuleCount(password) === PASSWORD_RULES.length;
}

export function strengthLabel(score: number): string {
  if (score <= 0) return "";
  if (score === 1) return "Weak";
  if (score === 2) return "Fair";
  if (score === 3) return "Good";
  return "Strong password";
}