// temp-add-template.ts
import { db } from "./src/lib/db";
import { templates } from "./src/lib/drizzle/schema/templates";

async function addTemplate() {
  try {
    const newTemplate = {
      name: "sent_for_client_approvals",
      category: "UTILITY",
      language: "en",
      body: "Hello {{1}},\\n\\nPlease send the following for client approval. \\n\\n{{2}} - {{3}} - {{4}}",
      status: "LOCAL", // Default status
    };

    await db.insert(templates).values(newTemplate);
    console.log("Template 'sent_for_client_approvals' added successfully!");
  } catch (error) {
    console.error("Failed to add template:", error);
  }
}

addTemplate();
