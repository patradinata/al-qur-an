import { ButtonHTMLAttributes, ReactNode } from "react";

type ButtonProps = {
  children: ReactNode;
} & ButtonHTMLAttributes<HTMLButtonElement>;

export default function Button({ children, ...props }: ButtonProps) {
  return (
    <button
      {...props}
      className={`p-1 hover:glow flex items-center justify-center w-8 h-8 transition-all relative button hover:text-sec-color-light group active:scale-90 rounded-full disabled:opacity-50 disabled:cursor-not-allowed ${
        props.className ?? ""
      }`}
    >
      <div className="absolute opacity-30 w-full h-full transition-all rounded-full group-hover:bg-sec-color-light" />
      {children}
    </button>
  );
}
