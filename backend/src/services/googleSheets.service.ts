import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { google } from "googleapis";
import config from "../config/index.js";

let authClient: any = null;
let sheetsClient: any = null;
const __dirname = path.dirname(fileURLToPath(import.meta.url));

function normalizePrivateKey(value?: string) {
  if (!value) return value;
  return value.replace(/\\r\\n/g, "\n").replace(/\\n/g, "\n").replace(/\r/g, "\n");
}

function resolveCredentialPath(candidate?: string) {
  const trimmed = candidate?.trim();
  if (!trimmed) return undefined;

  if (path.isAbsolute(trimmed)) {
    return fs.existsSync(trimmed) ? trimmed : undefined;
  }

  const candidates = [
    trimmed,
    path.resolve(process.cwd(), trimmed),
    path.resolve(__dirname, "../../", trimmed),
    path.resolve(__dirname, "../../backend", trimmed),
  ];

  return candidates.find((candidatePath) => fs.existsSync(candidatePath));
}

function logAuthDiagnostics(credentials?: any) {
  const rawEmail = config.GOOGLE_CLIENT_EMAIL || process.env.GOOGLE_CLIENT_EMAIL;
  const rawKey = config.GOOGLE_PRIVATE_KEY || process.env.GOOGLE_PRIVATE_KEY;
  const keyValue = rawKey || "";

  console.debug("[google-auth] diagnostics", {
    hasProjectId: Boolean(config.GOOGLE_PROJECT_ID || process.env.GOOGLE_PROJECT_ID),
    hasClientEmail: Boolean(rawEmail),
    hasPrivateKey: Boolean(keyValue),
    privateKeyLength: keyValue.length,
    privateKeyStartsWithBoundary: keyValue.trim().startsWith("-----BEGIN PRIVATE KEY-----"),
    usingServiceAccountJson: Boolean(credentials?.private_key || credentials?.client_email),
  });
}

function loadCredentialsFromEnv() {
  const saJson = config.GOOGLE_SERVICE_ACCOUNT_JSON || config.GOOGLE_APPLICATION_CREDENTIALS || process.env.GOOGLE_SERVICE_ACCOUNT_JSON || process.env.GOOGLE_APPLICATION_CREDENTIALS;
  if (!saJson) {
    const email = config.GOOGLE_CLIENT_EMAIL || process.env.GOOGLE_CLIENT_EMAIL;
    const privateKey = config.GOOGLE_PRIVATE_KEY || process.env.GOOGLE_PRIVATE_KEY;
    if (email && privateKey) {
      return {
        type: "service_account",
        client_email: email,
        private_key: normalizePrivateKey(privateKey),
      };
    }
    return undefined;
  }

  try {
    const parsed = JSON.parse(saJson);
    if (parsed.private_key) {
      parsed.private_key = normalizePrivateKey(parsed.private_key);
    }
    return parsed;
  } catch {
    const resolvedPath = resolveCredentialPath(saJson);
    if (!resolvedPath) {
      throw new Error("Invalid GOOGLE_SERVICE_ACCOUNT_JSON or GOOGLE_APPLICATION_CREDENTIALS path");
    }

    try {
      const fileContents = fs.readFileSync(resolvedPath, "utf-8");
      const parsed = JSON.parse(fileContents);
      if (parsed.private_key) {
        parsed.private_key = normalizePrivateKey(parsed.private_key);
      }
      return parsed;
    } catch {
      throw new Error("Invalid GOOGLE_SERVICE_ACCOUNT_JSON or GOOGLE_APPLICATION_CREDENTIALS file contents");
    }
  }
}

function initAuth() {
  if (authClient) return authClient;

  let credentials: any = loadCredentialsFromEnv();
  if (!credentials && (config.GOOGLE_CLIENT_EMAIL || process.env.GOOGLE_CLIENT_EMAIL) && (config.GOOGLE_PRIVATE_KEY || process.env.GOOGLE_PRIVATE_KEY)) {
    credentials = {
      type: "service_account",
      client_email: config.GOOGLE_CLIENT_EMAIL || process.env.GOOGLE_CLIENT_EMAIL,
      private_key: normalizePrivateKey(config.GOOGLE_PRIVATE_KEY || process.env.GOOGLE_PRIVATE_KEY),
    };
  }

  if (!credentials) {
    throw new Error(
      "Google service account credentials not found in environment. Please set GOOGLE_SERVICE_ACCOUNT_JSON, GOOGLE_APPLICATION_CREDENTIALS, or GOOGLE_CLIENT_EMAIL and GOOGLE_PRIVATE_KEY."
    );
  }

  logAuthDiagnostics(credentials);

  authClient = new google.auth.GoogleAuth({
    credentials,
    scopes: ["https://www.googleapis.com/auth/spreadsheets"],
  });
  return authClient;
}

async function getSheetsClient() {
  if (sheetsClient) return sheetsClient;
  const auth = initAuth();
  const client = google.sheets({ version: "v4", auth });
  sheetsClient = client;
  return sheetsClient;
}

export async function getValues(spreadsheetId: string, range: string) {
  const client = await getSheetsClient();
  const res = await client.spreadsheets.values.get({ spreadsheetId, range });
  return res.data;
}

export async function updateValues(spreadsheetId: string, range: string, values: any[][], valueInputOption = "USER_ENTERED") {
  const client = await getSheetsClient();
  return client.spreadsheets.values.update({
    spreadsheetId,
    range,
    valueInputOption,
    requestBody: { values },
  });
}

export async function appendValues(spreadsheetId: string, range: string, values: any[][], valueInputOption = "USER_ENTERED", insertDataOption = "INSERT_ROWS") {
  const client = await getSheetsClient();
  return client.spreadsheets.values.append({
    spreadsheetId,
    range,
    valueInputOption,
    insertDataOption,
    requestBody: { values },
  });
}

export async function getSpreadsheet(spreadsheetId: string) {
  const client = await getSheetsClient();
  const res = await client.spreadsheets.get({ spreadsheetId });
  return res.data;
}

export async function batchUpdate(spreadsheetId: string, requestBody: any) {
  const client = await getSheetsClient();
  return client.spreadsheets.batchUpdate({ spreadsheetId, requestBody });
}
