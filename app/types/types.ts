// types/index.ts

// ✅ Runtime constant — actual values that exist in JS
export const USER_ROLES = {
    USER: "USER",
    LAWYER: "LAWYER",
    FIRM: "FIRM",
    ADMIN: "ADMIN",
  } as const;
  
  // ✅ Type derived from the constant — stays in sync automatically
  export type UserRole = typeof USER_ROLES[keyof typeof USER_ROLES];
  // → "USER" | "LAWYER" | "FIRM" | "ADMIN" 