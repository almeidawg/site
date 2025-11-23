import "dotenv/config";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { Client } from "basic-ftp";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const distDir = path.resolve(__dirname, "..", "dist");

const {
  FTP_HOST,
  FTP_USER,
  FTP_PASSWORD,
  FTP_PORT = 21,
  FTP_SECURE = "false",
  FTP_REMOTE_DIR = "/public_html",
} = process.env;

if (!FTP_HOST || !FTP_USER || !FTP_PASSWORD) {
  console.error("Missing FTP_HOST / FTP_USER / FTP_PASSWORD in .env");
  process.exit(1);
}
if (!fs.existsSync(distDir)) {
  console.error(`Build not found at ${distDir}. Run npm run build first.`);
  process.exit(1);
}

const client = new Client();
client.ftp.verbose = true;
const toBool = (v) => ["1", "true", "yes"].includes(String(v).toLowerCase());

async function deploy() {
  try {
    await client.access({
      host: FTP_HOST,
      user: FTP_USER,
      password: FTP_PASSWORD,
      port: Number(FTP_PORT),
      secure: toBool(FTP_SECURE),
      secureOptions: { rejectUnauthorized: false },
    });

    await client.ensureDir(FTP_REMOTE_DIR);
    await client.clearWorkingDir();
    await client.uploadFromDir(distDir);
    console.log("Deploy via FTP finished successfully.");
  } catch (err) {
    console.error("FTP deploy failed:", err.message);
    process.exitCode = 1;
  } finally {
    client.close();
  }
}

deploy();
