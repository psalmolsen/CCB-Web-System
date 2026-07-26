import dotenv from "dotenv";
import { google } from "googleapis";

dotenv.config();

function normalizePrivateKey(value?: string) {
  if (!value) return value;
  return value.replace(/\\r\\n/g, "\n").replace(/\\n/g, "\n").replace(/\r/g, "\n");
}

function getAuthConfig() {
  const email = process.env.GOOGLE_CLIENT_EMAIL;
  const privateKey = normalizePrivateKey(process.env.GOOGLE_PRIVATE_KEY);

  return {
    email,
    key: privateKey,
    scopes: ["https://www.googleapis.com/auth/spreadsheets"],
  };
}

export function getSheetsClient() {
  const authConfig = getAuthConfig();

  return new google.auth.JWT(authConfig);
}

export function getSheets() {
  const auth = getSheetsClient();
  return google.sheets({ version: "v4", auth });
}
