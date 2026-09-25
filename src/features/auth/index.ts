// Feature: login, signup, profile and session helpers (Clerk), plus copying users into our database.
// Public API of this feature. Other code may import only from here.
export { authAppearance } from "./appearance";
export { requireUserId } from "./services/require-user";
export { getCurrentUser } from "./services/get-current-user";
export { deleteUserByClerkId, upsertUser } from "./services/user-sync";
export type { ClerkUserSnapshot } from "./services/user-sync";
