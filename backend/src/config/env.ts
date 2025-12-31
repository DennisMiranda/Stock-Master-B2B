import dotenv from "dotenv";
dotenv.config();

export const env = {
  firebase: {
    projectId: process.env.PROJECT_ID!,
    clientEmail: process.env.CLIENT_EMAIL!,
    privateKey: process.env.PRIVATE_KEY?.replace(/\\n/g, "\n")!,
  },
  googleDrive: {
    clientId: process.env.GOOGLE_CLIENTE_ID!,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    refreshToken: process.env.GOOGLE_REFRESH_TOKEN!,
    foldeFactura: process.env.GOOGLE_DRIVE_FOLDER_FACTURA_ID!,
    folderGuia: process.env.GOOGLE_DRIVE_FOLDER_GUIA_ID!,
  }
};