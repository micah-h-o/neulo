import { User } from "@clerk/nextjs/server";

export async function hasActiveSubscription(user: User | null): Promise<boolean> {
  if (!user) return false;
  
  // Check if user has an active subscription
  // Clerk stores subscription info in publicMetadata or privateMetadata
  // Adjust this based on how you're storing subscription status
  const subscriptionStatus = user.publicMetadata?.subscriptionStatus as string | undefined;
  const subscriptionActive = user.publicMetadata?.subscriptionActive as boolean | undefined;
  
  // Return true if subscription is active
  // You can also check for specific subscription types here
  return subscriptionActive === true || subscriptionStatus === 'active';
}

