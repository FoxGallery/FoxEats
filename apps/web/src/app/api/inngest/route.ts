import { serve } from 'inngest/next';
import { inngest } from '@/lib/inngest';
import { functions } from '@/lib/inngest-functions';

/**
 * Endpoint Inngest. Inngest cloud (ou dev local via `npx inngest-cli dev`)
 * appelle cette route pour découvrir/exécuter les functions.
 */
export const { GET, POST, PUT } = serve({
  client: inngest,
  functions,
});
