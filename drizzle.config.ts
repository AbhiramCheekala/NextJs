import "dotenv/config";
import { defineConfig } from "drizzle-kit";

export default defineConfig({
  schema: "./src/lib/drizzle/schema/*.ts",
  out: "./src/drizzle/migrations",
  dialect: "mysql",
  dbCredentials: {
    host: "127.0.0.1",
    user: "root",
    password: "kali",
    database: "whatsappDb",
    port: 3306,
  },
});
