import axios from 'axios';
import dotenv from 'dotenv';
import assert from 'assert';
import { db } from './db';

// Load environment variables from .env file
dotenv.config();

const BASE_URL = 'http://localhost:9002/api'; // Make sure your app is running on port 9002

// Generate a random phone number for testing to avoid conflicts
const TEST_PHONE_NUMBER = `1555${Math.floor(1000000 + Math.random() * 9000000)}`;
const TEST_CONTACT_NAME = 'Test Contact';

let chatId: string | null = null;

async function getChatIdByPhoneNumber(phone: string): Promise<string | null> {
    const contact = await db.query.contactsTable.findFirst({
        where: (contacts, { eq }) => eq(contacts.phone, phone),
    });

    if (!contact) {
        return null;
    }

    const chat = await db.query.chats.findFirst({
        where: (chats, { eq }) => eq(chats.contactId, contact.id),
    });

    return chat ? chat.id : null;
}

async function runTests() {
    console.log('--- Starting Feature Tests (with DB Verification) ---');

    try {
        // 1. Incoming Message
        console.log('\n--- Test Case 1: Incoming Message ---');
        const webhookPayload = {
            object: 'whatsapp_business_account',
            entry: [
              {
                id: 'WHATSAPP_BUSINESS_ACCOUNT_ID',
                changes: [
                  {
                    field: 'messages',
                    value: {
                      messaging_product: 'whatsapp',
                      metadata: {
                        display_phone_number: process.env.WHATSAPP_PHONE_NUMBER_ID,
                        phone_number_id: process.env.WHATSAPP_PHONE_NUMBER_ID,
                      },
                      contacts: [
                        {
                          profile: {
                            name: TEST_CONTACT_NAME,
                          },
                          wa_id: TEST_PHONE_NUMBER,
                        },
                      ],
                      messages: [
                        {
                          from: TEST_PHONE_NUMBER,
                          id: `wamid.${Date.now()}`,
                          timestamp: String(Math.floor(Date.now() / 1000)),
                          type: 'text',
                          text: {
                            body: 'Hello from test script!',
                          },
                        },
                      ],
                    },
                  },
                ],
              },
            ],
          };

        console.log('Simulating incoming WhatsApp message...');
        await axios.post(`${BASE_URL}/webhooks/whatsapp`, webhookPayload);
        console.log('Webhook sent.');


        console.log('Verifying message in database...');
        // It might take a moment for the webhook to be processed and the data to be in the DB.
        await new Promise(resolve => setTimeout(resolve, 2000)); // Wait for 2 seconds

        chatId = await getChatIdByPhoneNumber(TEST_PHONE_NUMBER);
        assert(chatId, `Chat ID for phone number ${TEST_PHONE_NUMBER} not found.`);
        console.log(`Chat created with ID: ${chatId}`);

        // 2. Outgoing Message
        console.log('\n--- Test Case 2: Outgoing Message ---');
        const outgoingMessageContent = 'This is an outgoing message.';
        console.log('Sending outgoing message...');
        // This test might fail if the /api/chats/:id/messages endpoint requires authentication.
        // If it fails with a 401 or 403, you need to handle authentication in this script,
        // for example by adding an Authorization header with a valid JWT token.
        const response = await axios.post(`${BASE_URL}/chats/${chatId}/messages`, {
            content: outgoingMessageContent,
        });
        assert.strictEqual(response.status, 200, 'Failed to send outgoing message.');
        console.log('Outgoing message sent.');

        // 3. Get Messages
        console.log('\n--- Test Case 3: Get Messages ---');
        console.log('Fetching messages for the chat...');
        // This test might also fail due to authentication.
        const messagesResponse = await axios.get(`${BASE_URL}/chats/${chatId}/messages`);
        const messages = messagesResponse.data;

        assert(Array.isArray(messages), 'Messages response is not an array.');
        assert.strictEqual(messages.length, 2, 'Expected 2 messages in the chat.');

        const incomingMessage = messages.find(m => m.direction === 'incoming');
        const outgoingMessage = messages.find(m => m.direction === 'outgoing');

        assert(incomingMessage, 'Incoming message not found.');
        assert.strictEqual(incomingMessage.content, 'Hello from test script!', 'Incoming message content mismatch.');
        assert(!('status' in incomingMessage), 'Incoming message should not have a status field.');

        assert(outgoingMessage, 'Outgoing message not found.');
        assert.strictEqual(outgoingMessage.content, outgoingMessageContent, 'Outgoing message content mismatch.');
        assert(!('status' in outgoingMessage), 'Outgoing message should not have a status field.');

        console.log('All messages verified.');

        console.log('\n--- All Tests Passed Successfully ---');
        // Close the database connection pool
        const { pool } = await import('./db');
        await pool.end();

    } catch (error) {
        if (error instanceof Error) {
            console.error('--- A Test Failed ---');
            console.error('Error:', error.message);
            if (axios.isAxiosError(error) && error.response) {
                console.error('Response Status:', error.response.status);
                console.error('Response Data:', error.response.data);
            }
        } else {
            console.error('An unknown error occurred:', error);
        }
        const { pool } = await import('./db');
        await pool.end();
        process.exit(1);
    }
}


// To run this test:
// 1. Make sure you have a .env file with the required database and WhatsApp variables.
// 2. Make sure your Next.js application is running on http://localhost:9002.
// 3. Run this file using ts-node: `npx ts-node src/lib/test-features.ts`

runTests();