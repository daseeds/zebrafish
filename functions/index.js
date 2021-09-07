'use strict';

const functions = require('firebase-functions');
const nodemailer = require('nodemailer');
// Configure the email transport using the default SMTP transport and a GMail account.
// For other types of transports such as Sendgrid see https://nodemailer.com/transports/
// TODO: Configure the `gmail.email` and `gmail.password` Google Cloud environment variables.
const gmailEmail = functions.config().gmail.email;
const gmailPassword = functions.config().gmail.password;
const mailTransport = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: gmailEmail,
    pass: gmailPassword,
  },
});

exports.sendEmail = functions.

// Sends an email confirmation when a user changes his mailing list subscription.
exports.sendEmailConfirmation = functions.database.ref('/users/{uid}').onWrite(async (change) => {
  // Early exit if the 'subscribedToMailingList' field has not changed
  if (change.after.child('subscribedToMailingList').val() === change.before.child('subscribedToMailingList').val()) {
    return null;
  }

  const val = change.after.val();

  const mailOptions = {
    from: '"Spammy Corp." <noreply@firebase.com>',
    to: val.email,
  };

  const subscribed = val.subscribedToMailingList;

  // Building Email message.
  mailOptions.subject = subscribed ? 'Thanks and Welcome!' : 'Sad to see you go :`(';
  mailOptions.text = subscribed ?
      'Thanks you for subscribing to our newsletter. You will receive our next weekly newsletter.' :
      'I hereby confirm that I will stop sending you the newsletter.';
  
  try {
    await mailTransport.sendMail(mailOptions);
    functions.logger.log(
      `New ${subscribed ? '' : 'un'}subscription confirmation email sent to:`,
      val.email
    );
  } catch(error) {
    functions.logger.error(
      'There was an error while sending the email:',
      error
    );
  }
  return null;
});