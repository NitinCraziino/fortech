import type React from "react";
import { cn } from "@/lib/utils";
import { type VariantProps, cva } from "class-variance-authority";
import { Loader } from "lucide-react";

const spinnerVariants = cva("flex-col items-center justify-center", {
  variants: {
    show: {
      true: "flex",
      false: "hidden",
    },
  },
  defaultVariants: {
    show: true,
  },
});

const loaderVariants = cva("animate-spin text-primary", {
  variants: {
    size: {
      small: "size-6",
      medium: "size-8",
      large: "size-14",
    },
  },
  defaultVariants: {
    size: "medium",
  },
});

const overlayVariants = cva(
  "fixed inset-0 bg-background/50 backdrop-blur-sm flex items-center justify-center z-50",
  {
    variants: {
      show: {
        true: "flex",
        false: "hidden",
      },
    },
    defaultVariants: {
      show: true,
    },
  }
);

interface SpinnerContentProps
  extends VariantProps<typeof spinnerVariants>,
    VariantProps<typeof loaderVariants> {
  className?: string;
  children?: React.ReactNode;
  fullScreen?: boolean;
}

export function Spinner({
  size,
  show,
  children,
  className,
  fullScreen = false,
}: SpinnerContentProps) {
  const spinnerContent = (
    <span className={spinnerVariants({ show })}>
      <Loader className={cn(loaderVariants({ size }), className)} />
      {children}
    </span>
  );

  if (fullScreen) {
    return <div className={overlayVariants({ show })}><div className="animate-pulse">{spinnerContent}</div></div>;
  }

  return spinnerContent;
}
