export type DemoAdminUser = {
  email: string;
  name: string;
  role: "Company Admin";
};

export const demoAdminAccounts = [
  {
    email: "admin@supportnote.ai",
    password: "milind",
    name: "SupportNote Admin",
    role: "Company Admin" as const
  },
  {
    email: "milind@supportnote.ai",
    password: "admin",
    name: "Milind Admin",
    role: "Company Admin" as const
  }
];

export const DEMO_ADMIN_STORAGE_KEY = "supportnote_demo_admin_user";

export function validateDemoAdminLogin(email: string, password: string) {
  const normalizedEmail = email.trim().toLowerCase();
  return demoAdminAccounts.find(
    (account) => account.email === normalizedEmail && account.password === password
  );
}
