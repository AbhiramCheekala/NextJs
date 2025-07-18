// src/ai/flows/segment-whatsapp-audience.ts
'use server';
/**
 * @fileOverview AI-powered contact list segmentation for WhatsApp campaigns.
 *
 * - segmentWhatsAppAudience - Segments a contact list based on campaign goals.
 * - SegmentWhatsAppAudienceInput - Input type for segmentation.
 * - SegmentWhatsAppAudienceOutput - Output type for segmentation.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const SegmentWhatsAppAudienceInputSchema = z.object({
  campaignGoal: z
    .string()
    .describe('The primary goal of the WhatsApp campaign, e.g., lead generation, sales, awareness.'),
  contactListDescription: z
    .string()
    .describe('A description of the available contacts, including their demographics, interests, and past interactions.'),
  segmentationCriteria: z
    .string()
    .describe(
      'Specific criteria to use for segmentation, e.g., location, purchase history, engagement level.'
    ),
});
export type SegmentWhatsAppAudienceInput = z.infer<typeof SegmentWhatsAppAudienceInputSchema>;

const SegmentWhatsAppAudienceOutputSchema = z.object({
  contactIds: z
    .array(z.string())
    .describe('An array of contact IDs that match the specified segmentation criteria.'),
  rationale: z
    .string()
    .describe('A detailed explanation of why these contacts were selected for this segment.'),
});
export type SegmentWhatsAppAudienceOutput = z.infer<typeof SegmentWhatsAppAudienceOutputSchema>;

export async function segmentWhatsAppAudience(
  input: SegmentWhatsAppAudienceInput
): Promise<SegmentWhatsAppAudienceOutput> {
  return segmentWhatsAppAudienceFlow(input);
}

const prompt = ai.definePrompt({
  name: 'segmentWhatsAppAudiencePrompt',
  input: {schema: SegmentWhatsAppAudienceInputSchema},
  output: {schema: SegmentWhatsAppAudienceOutputSchema},
  prompt: `You are an expert marketing specialist. Your task is to segment a WhatsApp contact list based on specific campaign goals and criteria.

Campaign Goal: {{{campaignGoal}}}
Contact List Description: {{{contactListDescription}}}
Segmentation Criteria: {{{segmentationCriteria}}}

Based on the above information, identify the contacts that best fit the campaign and provide a rationale for your choices. Return contact IDs and rationale in JSON format.

Your response should contain two keys: contactIds (an array of contact IDs) and rationale (a string explaining the segmentation).
`,
});

const segmentWhatsAppAudienceFlow = ai.defineFlow(
  {
    name: 'segmentWhatsAppAudienceFlow',
    inputSchema: SegmentWhatsAppAudienceInputSchema,
    outputSchema: SegmentWhatsAppAudienceOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
