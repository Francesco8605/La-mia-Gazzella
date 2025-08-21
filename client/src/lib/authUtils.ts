export function isUnauthorizedError(error: Error): boolean {
  return /^401: .*Unauthorized/.test(error.message);
}

export function isSubscriptionRequiredError(error: Error): boolean {
  return error.message.includes("requiresSubscription") || 
         error.message.includes("Abbonamento scaduto") ||
         /^403: .*Abbonamento/.test(error.message);
}