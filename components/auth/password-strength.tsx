// components/auth/PasswordStrength.tsx
import { PASSWORD_RULES, passedRuleCount, strengthLabel } from "@/lib/password";

import { CircleCheck } from "lucide-react";

const BAR_COLORS = ["bg-red-400", "bg-amber-400", "bg-lime-500", "bg-green-500"];

/** Title on the left, strength label on the right, four bars underneath */
export function StrengthMeter({ password, title }: Readonly<{ password: string; title: string }>) {
  const score = passedRuleCount(password);
  const label = strengthLabel(score);
  const activeColor = BAR_COLORS[Math.max(score - 1, 0)];

  return (
    <div>
      <div className="mb-2 flex items-center justify-between text-[11px] font-semibold uppercase tracking-wide text-sec-clr">
        <span>{title}</span>
        <span aria-live="polite" className={score === PASSWORD_RULES.length ? "text-acc-lr" : ""}>
          {label}
        </span>
      </div>
      <div className="flex gap-1.5" aria-hidden="true">
        {PASSWORD_RULES.map((rule, index) => (
          <span
            key={rule.id}
            className={`h-1.5 flex-1 rounded-full transition-colors ${
              index < score ? activeColor : "bg-gray-200"
            }`}
          />
        ))}
      </div>
    </div>
  );
}

export function RequirementsList({
  password,
  columns = 1,
}: {
  password: string;
  columns?: 1 | 2;
}) {
  return (
    <ul className={`grid gap-x-4 gap-y-2 ${columns === 2 ? "grid-cols-2" : "grid-cols-1"}`}>
      {PASSWORD_RULES.map((rule) => {
        const met = rule.test(password);
        return (
          <li
            key={rule.id}
            className={`flex items-center gap-2 text-xs ${
              met ? "text-gray-700" : "text-gray-400"
            }`}
          >
            <CircleCheck
              className={`h-4 w-4 shrink-0 ${met ? "text-green-500" : "text-gray-300"}`}
            />
            {rule.label}
          </li>
        );
      })}
    </ul>
  );
}