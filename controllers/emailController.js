require("dotenv").config();
const sgMail = require("@sendgrid/mail");
sgMail.setApiKey(process.env.SENDGRID_API_KEY);
const EmailTemplate = require("../schema/emailtemplateSchema");

const sendEmail = async ({ to, subject, html, from }) => {
  try {
    const msg = { to, from, subject, html };
    await sgMail.send(msg);
    return true;
  } catch (error) {
    return false;
  }
};

const createEmailTemplate = async (req, res) => {
  try {
    const forgotPasswordEmail = `<!DOCTYPE html><html lang="en"><head><meta charset="UTF-8" /><meta name="viewport" content="width=device-width, initial-scale=1.0" /><title>Order Submission Email</title></head><body style="margin: 0; padding: 0; background-color: #ffffff; font-family: Arial, Helvetica, sans-serif; color: #203b54;"><table cellpadding="0" cellspacing="0" border="0" width="100%"><tr><td align="center" style="padding: 20px"><table cellpadding="0" cellspacing="0" border="0" width="769" style="background-color: #ffffff; border-radius: 5px; border-top: 1px solid #e6e6e6; box-shadow: 0px 31.729px 63.458px 0px rgba(138, 149, 158, 0.2);"><tr><td style="padding: 32px"><table cellpadding="0" cellspacing="0" border="0" width="100%"><tr><td><table cellpadding="0" cellspacing="0" border="0" width="100%"><tr><td style="font-family: Arial, sans-serif; font-size: 20px; font-weight: 500; color: #203b54;">Forgot Password Email</td><td align="right"><a href="#" style="margin-left: auto"><img src="https://craxinno.s3.amazonaws.com/ERPLogo.png" alt="ERP Logo" style="max-width: 80px; height: auto" /></a></td></tr></table></td></tr></table><table cellpadding="0" cellspacing="0" border="0" width="100%" style="margin-top: 50px"><tr><td style="color: #203b54; font-size: 16px; line-height: 22px"><p style="margin: 0 0 20px 0">Hello [username],</p><p>You recently requested to reset the password for your account.<br />Click the below button to proceed.<br /></p><table cellpadding="0" cellspacing="0" border="0" style="margin: 30px 0"><tr><td style="background-color: #10172e; border-radius: 4px;"><a href="[RESETPASSWORDLINK]" style="display: inline-block; padding: 8px 24px; color: #ffffff; text-decoration: none; font-family: Arial, sans-serif; font-size: 14px;">Reset Password</a></td></tr></table><p style="margin: 0 0 20px 0"> If you did not request a password reset, please ignore this email</p><p style="margin: 0">Regards,<br />ERP Team.</p></td></tr></table><table cellpadding="0" cellspacing="0" border="0" width="100%" style="margin-top: 100px"><tr><td><table cellpadding="0" cellspacing="0" border="0" width="100%"><tr><td><div style="height: 1px; background: #e6e6e6; background: radial-gradient(50% 50% at 50% 50%, #0075ff 0%, rgba(0, 117, 255, 0) 100%);"></div></td></tr><tr><td align="center" style="padding-top: 12px; font-size: 10px; color: #203b54;">Copyright 2025 ERP. All rights reserved.</td></tr></table></td></tr></table></td></tr></table></td></tr></table></body></html>`;

    const template = new EmailTemplate({
      type: req.body.type,
      body: forgotPasswordEmail,
      subject: req.body.subject,
      active: true,
    });
    const savedTemplate = await template.save();
    res.status(200).json({ savedTemplate });
  } catch (error) {
    res.status(500).json({ error: error.message || "Error creating template" });
  }
};

module.exports = { sendEmail, createEmailTemplate };
