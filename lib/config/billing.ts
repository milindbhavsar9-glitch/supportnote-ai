export function isBillingEnabled() {
  const value = process.env.BILLING_ENABLED ?? process.env.NEXT_PUBLIC_BILLING_ENABLED ?? "false";
  return value.toLowerCase() === "true";
}

export const INTERNAL_TESTING_MESSAGE =
  "Internal testing version. This tool is currently being tested before public launch.";
