import path from "path";
import { fileURLToPath } from "url";
import dotenv from "dotenv";

dotenv.config();
const __dirname = path.dirname(fileURLToPath(import.meta.url));
const rootEnv = path.resolve(__dirname, "../../.env");
dotenv.config({ path: rootEnv, override: false });

const get = (key: string, fallback?: string) => process.env[key] ?? fallback;

const config = {
  PORT: Number(get("PORT", "5000")),
  FRONTEND_ORIGIN: get("FRONTEND_ORIGIN", "http://localhost:5173"),
  SPREADSHEET_ID: get("SPREADSHEET_ID"),
  CNF_SPREADSHEET_ID: get("CNF_SPREADSHEET_ID"),
  ORING_SPREADSHEET_ID: get("ORING_SPREADSHEET_ID"),
  PELLETS_SPREADSHEET_ID: get("PELLETS_SPREADSHEET_ID"),
  STATION_SPREADSHEET_ID: get("STATION_SPREADSHEET_ID"),
  MATERIAL_SPREADSHEET_ID: get("MATERIAL_SPREADSHEET_ID"),
  GOOGLE_PROJECT_ID: get("GOOGLE_PROJECT_ID"),
  GOOGLE_CLIENT_EMAIL: get("GOOGLE_CLIENT_EMAIL"),
  GOOGLE_PRIVATE_KEY: get("GOOGLE_PRIVATE_KEY"),
  GOOGLE_SERVICE_ACCOUNT_JSON: get("GOOGLE_SERVICE_ACCOUNT_JSON"),
  GOOGLE_APPLICATION_CREDENTIALS: get("GOOGLE_APPLICATION_CREDENTIALS"),
  NODE_ENV: get("NODE_ENV", "development"),
};

export default config;
