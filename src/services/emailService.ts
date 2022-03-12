import nodemailer from "nodemailer";
import { google } from "googleapis";
import { OAuth2Client } from "google-auth-library";
import { GetAccessTokenResponse } from "google-auth-library/build/src/auth/oauth2client";
import log from "../utils/logger";

const emailService = () => {
  const oAuth2Client: OAuth2Client = new google.auth.OAuth2(
    process.env.CLIENT_ID,
    process.env.CLIENT_SECRET,
    process.env.REDIRECT_URI
  );
  oAuth2Client.setCredentials({ refresh_token: process.env.REFRESH_TOKEN });

  return {
    sendMail: async function (to: string, link: string) {
      const accessToken: GetAccessTokenResponse =
        await oAuth2Client.getAccessToken();

      const transport = nodemailer.createTransport({
        service: "gmail",
        auth: {
          type: "OAuth2",
          user: process.env.EMAIL,
          clientId: process.env.CLIENT_ID,
          clientSecret: process.env.CLIENT_SECRET,
          refreshToken: process.env.REFRESH_TOKEN,
          accessToken: accessToken as string,
        },
      });

      const mail = {
        from: `Athena Chat <${process.env.EMAIL}>`,
        to: to,
        subject: "Email Verification",
        text: "Click on the link to verify your account: " + link,
        html: `<p>Click on the link below to verify your account.</p></br><a href='${link}'>${link}</a>`,
      };

      transport
        .sendMail(mail)
        .then(() => {
          log.info("Email Sent Successfully");
        })
        .catch((err) => {
          log.error(err.message);
        });
    },
  };
};

export default emailService;
