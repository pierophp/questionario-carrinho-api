import sheets from "@googleapis/sheets";
import { Handler } from "@netlify/functions";

const handler: Handler = async (event, context) => {
  const body = event.body ? JSON.parse(event.body) : null;

  if (!body?.spreadsheet_id) {
    return {
      statusCode: 400,
      body: JSON.stringify({ message: "spreadsheet_id is required" }),
      headers: {
        "content-type": "application/json",
      },
    };
  }

  if (!body?.sheet_title) {
    return {
      statusCode: 400,
      body: JSON.stringify({ message: "sheet_title is required" }),
      headers: {
        "content-type": "application/json",
      },
    };
  }

  if (!context.clientContext?.GOOGLE_CREDENTIALS) {
    return {
      statusCode: 500,
      body: JSON.stringify({ message: "GOOGLE_CREDENTIALS not configured" }),
      headers: {
        "content-type": "application/json",
      },
    };
  }

  const auth = new sheets.auth.GoogleAuth({
    credentials: JSON.parse(context.clientContext.GOOGLE_CREDENTIALS),
    scopes: ["https://www.googleapis.com/auth/spreadsheets"],
  });

  const authClient = await auth.getClient();

  const client = sheets.sheets({
    version: "v4",
    auth: authClient,
  });

  await client.spreadsheets.values.append({
    spreadsheetId: body.spreadsheet_id,
    valueInputOption: "USER_ENTERED",
    range: `${body.sheet_title}!A1:M1`,
    requestBody: {
      values: body.values,
    },
  });

  return {
    statusCode: 200,
    body: JSON.stringify({}),
    headers: {
      "content-type": "application/json",
    },
  };
};

export { handler };
