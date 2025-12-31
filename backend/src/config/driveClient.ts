import { google } from "googleapis";
import { env } from "./env";

const OAuth2 = google.auth.OAuth2;
const auth = new OAuth2(
    env.googleDrive.clientId,
    env.googleDrive.clientSecret,
    "https://developers.google.com/oauthplayground"
);

auth.setCredentials({
    refresh_token: env.googleDrive.refreshToken

})

export const drive = google.drive({ version: "v3", auth });