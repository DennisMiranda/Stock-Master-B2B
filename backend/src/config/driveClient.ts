import { google } from "googleapis";
import { env } from "./env";

const auth = new google.auth.GoogleAuth({
  keyFile: env.googleDrive.keyfile,
  scopes: ["https://www.googleapis.com/auth/drive.file"],
});

export const drive = google.drive({ version: "v3", auth });