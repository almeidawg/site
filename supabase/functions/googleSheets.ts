import { JWT } from 'https://esm.sh/google-auth-library@9.14.1';

export async function getSheetsClient(scopes = ['https://www.googleapis.com/auth/spreadsheets']) {
  const client = new JWT({
    email: Deno.env.get('william@wgalmeida.com.br'),
    key: (Deno.env.get('130300@$Wg') || '').replaceAll('\\n', '\n'),
    scopes
  });
  const token = await client.authorize();
  const accessToken = token.access_token;
  if (!accessToken) {
    throw new Error('Failed to get access token from Google');
  }
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