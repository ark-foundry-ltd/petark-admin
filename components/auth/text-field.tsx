// components/auth/text-field.tsx
"use client";

import { useId, useState, type InputHTMLAttributes, type ReactNode } from "react";

import { Eye, EyeOff, Lock } from "lucide-react";

interface TextFieldProps extends InputHTMLAttributes<HTMLInputElement> {
  label: string;
  icon?: ReactNode;
  /** Element inside the input on the right (e.g. the show/hide button) */
  rightSlot?: ReactNode;
  /** Element on the label row, right-aligned (e.g. "Forgot password?") */
  labelRight?: ReactNode;
  error?: string;
}

export function TextField({
  label,
  icon,
  rightSlot,
  labelRight,
  error,
  id,
  className = "",
  readOnly,
  ...props
}: TextFieldProps) {
  const autoId = useId();
  const inputId = id ?? autoId;
  const errorId = `${inputId}-error`;

  return (
    <div>
      <div className="mb-1.5 flex items-center justify-between gap-3">
        <label htmlFor={inputId} className="text-xs font-semibold text-gray-700">
          {label}
        </label>
        {labelRight}
      </div>

      <div className="relative">
        {icon ? (
          <span className="pointer-events-none absolute inset-y-0 left-3.5 flex items-center text-gray-400">
            {icon}
          </span>
        ) : null}

        <input
          id={inputId}
          readOnly={readOnly}
          aria-invalid={error ? true : undefined}
          aria-describedby={error ? errorId : undefined}
          className={`h-12 w-full rounded-xl border text-sm text-gray-900 outline-none transition placeholder:text-gray-400 focus:border-green-500 focus:ring-2 focus:ring-green-500/20 ${
            icon ? "pl-11" : "pl-4"
          } ${rightSlot ? "pr-11" : "pr-4"} ${
            error ? "border-red-300" : "border-gray-200"
          } ${
            readOnly ? "cursor-not-allowed bg-gray-100 text-gray-600" : "bg-gray-50 focus:bg-white"
          } ${className}`}
          {...props}
        />

        {rightSlot ? (
          <span className="absolute inset-y-0 right-2 flex items-center">{rightSlot}</span>
        ) : null}
      </div>

      {error ? (
        <p id={errorId} className="mt-1.5 text-xs text-red-600">
          {error}
        </p>
      ) : null}
    </div>
  );
}

type PasswordFieldProps = Omit<TextFieldProps, "type" | "icon" | "rightSlot">;

export function PasswordField(props: PasswordFieldProps) {
  const [visible, setVisible] = useState(false);

  return (
    <TextField
      {...props}
      type={visible ? "text" : "password"}
      icon={<Lock className="h-4 w-4" />}
      rightSlot={
        <button
          type="button"
          onClick={() => setVisible((v) => !v)}
          aria-label={visible ? "Hide password" : "Show password"}
          className="rounded-lg p-2 text-gray-400 transition hover:text-gray-600"
        >
          {visible ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
        </button>
      }
    />
  );
}