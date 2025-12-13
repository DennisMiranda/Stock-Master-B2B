import dotenv from "dotenv";
dotenv.config();

export const env = {
  firebase: {
    projectId: process.env.PROJECT_ID!,
    clientEmail: process.env.CLIENT_EMAIL!,
    privateKey: process.env.PRIVATE_KEY?.replace(/\\n/g, "\n")!,
  }
};