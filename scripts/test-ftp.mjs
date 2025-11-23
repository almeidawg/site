import "dotenv/config";
import { Client } from "basic-ftp";

const {
  FTP_HOST,
  FTP_USER,
  FTP_PASSWORD,
  FTP_PORT = 21,
  FTP_SECURE = "false",
} = process.env;

if (!FTP_HOST || !FTP_USER || !FTP_PASSWORD) {
  console.error("Defina FTP_HOST / FTP_USER / FTP_PASSWORD no .env antes de testar.");
  process.exit(1);
}

const toBool = (value) =>
  ["1", "true", "yes"].includes(String(value).toLowerCase());

const client = new Client();
client.ftp.verbose = true;

async function main() {
  try {
    await client.access({
      host: FTP_HOST,
      user: FTP_USER,
      password: FTP_PASSWORD,
      port: Number(FTP_PORT),
      secure: toBool(FTP_SECURE),
      secureOptions: { rejectUnauthorized: false },
    });

    console.log(`Conectado em ${FTP_HOST}. Listando diretório atual:`);
    const listing = await client.list();
    listing.forEach((item) =>
      console.log(`${item.type === 1 ? "DIR " : "FILE"} ${item.name}`)
    );
  } catch (err) {
    console.error("Falha na conexão FTP:", err.message);
    process.exitCode = 1;
  } finally {
    client.close();
  }
}

main();
