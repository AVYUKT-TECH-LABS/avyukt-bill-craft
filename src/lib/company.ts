// Single-company constant — this tool bills for one company only.
// ponytail: move to a `company_settings` table if these details ever need to be editable without a deploy.
export const COMPANY = {
  companyName: "AVYUKT TECH LABS PRIVATE LIMITED",
  companyAddress: "A-7, Flat no. 8, 2nd Floor, Jawahar Park, Khapnur",
  companyCity: "New Delhi",
  companyState: "Delhi",
  companyZip: "110062",
  companyPhone: "8178392040",
  companyEmail: "divyansh@avyuktlabs.in",
} as const;
