// emailService.ts

import { v4 as uuidv4 } from 'uuid';
import User from "./models/user";
import nodemailer, { Transporter } from 'nodemailer'; 
import { google } from 'googleapis';
import dotenv from 'dotenv';
dotenv.config();

const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID;
const GOOGLE_CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET;
const GOOGLE_REDIRECT_URL = process.env.GOOGLE_REDIRECT_URL;
const EMAIL_USER = process.env.EMAIL_USER;

const oAuth2Client = new google.auth.OAuth2(
  GOOGLE_CLIENT_ID,
  GOOGLE_CLIENT_SECRET,
  GOOGLE_REDIRECT_URL
);

// Set the credentials for OAuth2
oAuth2Client.setCredentials({
  refresh_token: process.env.REFRESH_TOKEN,
  // scope: 'https://mail.google.com/',
});

// // Function to get the access token
// const getAccessToken = async () => {
//   const accessToken = await oAuth2Client.getAccessToken();
//   return accessToken.token as string;
// };


/// Define the transporter with the appropriate type
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: <any> {
    type: 'OAuth2',
    user: EMAIL_USER,
    clientId: GOOGLE_CLIENT_ID,
    clientSecret: GOOGLE_CLIENT_SECRET,
    refreshToken: process.env.REFRESH_TOKEN,
    accessToken: oAuth2Client.getAccessToken(), // Automatically handles token refreshing
  },
});

const sendPasswordResetEmail = async (email: string, resetToken: string) => {
  try {
    // Send a reset link via email
    await transporter.sendMail({
      from: EMAIL_USER,
      to: email,
      subject: 'Password Reset',
      text: `Click on the following link to reset your password: http://localhost:5000/reset-password?token=${resetToken}`,
    });

    console.log('Reset link sent successfully');
  } catch (error) {
    console.error('Error sending reset link:', error);
    throw new Error('Failed to send reset link');
  }
};

// Function to send a reset notification (can be extended based on our needs)
const sendResetNotification = async (email: string, resetToken: string) => {
  try {
    await sendPasswordResetEmail(email, resetToken);
    console.log(`Notification sent to ${email}`);
  } catch (error) {
    console.error('Error sending reset notification:', error);
    throw new Error('Failed to send reset notification');
  }
};

export const requestPasswordReset = async (_:any, args:{email:any}) => {
  try {
    const { email } = args;

    // Find the user by email
    const user = await User.findOne({ where: { email } });

    if (!user) {
      throw new Error('User not found');
    }

    // Generate a unique token for password reset using uuid
    const resetToken = uuidv4();
    const resetTokenExpiry = new Date(Date.now() + 3600000); // 1 hour

    // Set the reset token and expiry in the user record
    user.resetToken = resetToken;
    user.resetTokenExpiry = resetTokenExpiry;

    await user.save();

    await sendPasswordResetEmail(user.email, resetToken);

    return 'Reset link sent successfully';
  } catch (error) {
    console.error('Error in requestPasswordReset resolver:', error);
    throw new Error('Failed to send reset link');
  }
};

export const forgetPassword = async (_:any, args: { email:any }) => {
  try {
    const {email} = args;
    const user = await User.findOne({ where: { email } });

    if (!user) {
      throw new Error('User not found');
    }

    // Send a notification to the user if resetToken is not null
    if (user.resetToken !== null) {
      await sendResetNotification(user.email, user.resetToken);
    }

    return 'Password forgotten successfully';
  } catch (error) {
    console.error('Error in forgetPassword:', error);
    throw new Error('Failed to forget password');
  }
};