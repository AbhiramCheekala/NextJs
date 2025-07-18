'use server';

/**
 * @fileOverview This file defines a Genkit flow for suggesting WhatsApp message copy variations using AI.
 *
 * - suggestWhatsAppCopy - A function that generates WhatsApp message copy suggestions based on a given topic or product description.
 * - SuggestWhatsAppCopyInput - The input type for the suggestWhatsAppCopy function.
 * - SuggestWhatsAppCopyOutput - The return type for the suggestWhatsAppCopy function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const SuggestWhatsAppCopyInputSchema = z.object({
  topic: z
    .string()
    .describe(
      'The general topic or product description for which to generate WhatsApp message copy suggestions.'
    ),
});
export type SuggestWhatsAppCopyInput = z.infer<typeof SuggestWhatsAppCopyInputSchema>;

const SuggestWhatsAppCopyOutputSchema = z.object({
  suggestions: z
    .array(z.string())
    .describe('An array of suggested WhatsApp message copy variations.'),
});
export type SuggestWhatsAppCopyOutput = z.infer<typeof SuggestWhatsAppCopyOutputSchema>;

export async function suggestWhatsAppCopy(input: SuggestWhatsAppCopyInput): Promise<SuggestWhatsAppCopyOutput> {
  return suggestWhatsAppCopyFlow(input);
}

const prompt = ai.definePrompt({
  name: 'suggestWhatsAppCopyPrompt',
  input: {schema: SuggestWhatsAppCopyInputSchema},
  output: {schema: SuggestWhatsAppCopyOutputSchema},
  prompt: `You are an expert marketing copywriter specializing in creating engaging WhatsApp message copy.

  Based on the following topic or product description, generate three distinct and compelling WhatsApp message copy variations. These variations should be suitable for A/B testing and should adhere to WhatsApp's template guidelines.

  Topic/Product Description: {{{topic}}}

  Provide the suggestions as a JSON array of strings.
  `,
  config: {
    safetySettings: [
      {
        category: 'HARM_CATEGORY_HATE_SPEECH',
        threshold: 'BLOCK_ONLY_HIGH',
      },
      {
        category: 'HARM_CATEGORY_DANGEROUS_CONTENT',
        threshold: 'BLOCK_NONE',
      },
      {
        category: 'HARM_CATEGORY_HARASSMENT',
        threshold: 'BLOCK_MEDIUM_AND_ABOVE',
      },
      {
        category: 'HARM_CATEGORY_SEXUALLY_EXPLICIT',
        threshold: 'BLOCK_LOW_AND_ABOVE',
      },
    ],
  },
});

const suggestWhatsAppCopyFlow = ai.defineFlow(
  {
    name: 'suggestWhatsAppCopyFlow',
    inputSchema: SuggestWhatsAppCopyInputSchema,
    outputSchema: SuggestWhatsAppCopyOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
