import { twMerge } from "tailwind-merge";

type ButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: "primary" | "danger";
};

export function Button({ variant = "primary", ...buttonProps }: ButtonProps) {
  return (
    <button
      {...buttonProps}
      className={twMerge(
        "rounded-lg p-2 transition-colors",
        variant === "primary" && "border border-gray-200 active:bg-gray-200 disabled:bg-purple-100",
        variant === "danger" && "active:bg-red-200 text-red-600",
        buttonProps.className,
      )}
    />
  );
}
