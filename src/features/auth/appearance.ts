// Makes Clerk's forms use our design tokens, so they follow light and dark mode automatically.
export const authAppearance = {
  variables: {
    colorPrimary: "var(--primary)",
    colorTextOnPrimaryBackground: "var(--primary-foreground)",
    colorBackground: "var(--card)",
    colorText: "var(--foreground)",
    colorTextSecondary: "var(--muted-foreground)",
    colorInputBackground: "var(--background)",
    colorInputText: "var(--foreground)",
    colorDanger: "var(--destructive)",
    colorSuccess: "var(--success)",
    fontFamily: "var(--font-sans)",
    borderRadius: "0.375rem",
  },
  elements: {
    card: "shadow-none border border-border",
  },
};
