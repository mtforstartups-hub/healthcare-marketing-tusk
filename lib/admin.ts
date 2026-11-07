import { isOwner } from "./auth";

export async function canManageEnquiries() {
  // A valid signed owner session is the only way to reach the inbox.
  return isOwner();
}
