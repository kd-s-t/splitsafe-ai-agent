// This file configures the initialization of Sentry on the client.
// The added config here will be used whenever a users loads a page in their browser.
// https://docs.sentry.io/platforms/javascript/guides/react/

import * as Sentry from "@sentry/react";

Sentry.init({
  dsn: process.env.SENTRY_DSN_CLIENT || "https://16059806896aba2f8dcc9153ab97ebe2@o4509961933946880.ingest.de.sentry.io/4509962020192336",
  
  integrations: [
    // Only add replay integration on client side
    ...(typeof window !== 'undefined' ? [Sentry.replayIntegration()] : []),
  ],
  
  tracePropagationTargets: ["localhost", /^https:\/\/yourserver\.io\/api/],
  
  // Set tracesSampleRate to 1.0 to capture 100%
  // of transactions for performance monitoring.
  // We recommend adjusting this value in production
  tracesSampleRate: 1.0,
  
  // Enable logs to be sent to Sentry
  enableLogs: true,

  // Define how likely Replay events are sampled.
  // This sets the sample rate to be 10%. You may want this to be 100% while
  // in development and sample at a lower rate in production
  replaysSessionSampleRate: 0.1,

  // Define how likely Replay events are sampled when an error occurs.
  replaysOnErrorSampleRate: 1.0,

  // Setting this option to true will print useful information to the console while you're setting up Sentry.
  debug: false,
});
