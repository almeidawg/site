import { JWT } from 'https://esm.sh/google-auth-library@9.14.1';

export async function getSheetsClient(scopes = ['https://www.googleapis.com/auth/spreadsheets']) {
  const client = new JWT({
    email: Deno.env.get('GOOGLE_SERVICE_EMAIL'),
    key: (Deno.env.get('GOOGLE_SERVICE_KEY') || '').replaceAll('\\n', '\n'),
    scopes
  });
  const token = await client.authorize();
  const accessToken = token.access_token;
  return { accessToken };
}

export async function sheetsFetch(path, init) {
  const { accessToken } = await getSheetsClient();
  const url = `https://sheets.googleapis.com/v4/${path}`;
  return fetch(url, {
    ...(init || {}),
    headers: {
      'Authorization': `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
      ...(init?.headers || {})
    }
  });
}