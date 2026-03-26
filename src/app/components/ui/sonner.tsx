"use client";

import { useTheme } from "next-themes";
import { Toaster as Sonner, ToasterProps } from "sonner";

const Toaster = ({ ...props }: ToasterProps) => {
  const { theme = "system" } = useTheme();

  return (
    <Sonner
      theme={theme as ToasterProps["theme"]}
      className="toaster group"
      style={
        {
          "--normal-bg": "var(--popover)",
          "--normal-text": "#000000",
          "--normal-border": "var(--border)",
          "--success-text": "#000000",
          "--description-color": "#000000",
        } as React.CSSProperties
      }
      {...props}
    />
  );
};

export { Toaster };
