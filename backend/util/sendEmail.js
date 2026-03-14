const nodemailer = require('nodemailer');
const ejs = require('ejs');
const path = require('path');

// real test
// const transporter = nodemailer.createTransport({
//   service: "gmail",
//   auth: {
//     user: process.env.GMAILEMAIL,
//     pass: process.en.GMAILPASSWORDAPP,
//   },
// });

// test of mail hog
const transporter = nodemailer.createTransport({
  host: 'localhost',
  port: 1025,
  secure: false,
});

exports.otpSend = async (to,name,code) => {
     const html = await ejs.renderFile(
    path.join(__dirname, '../public/OtpMail.ejs'),
    { name, code }
  );

 await transporter.sendMail({
    from: '"Booking" <bookig@info.com>',
    to,
    subject: 'Code!',
    html,
  });
}
exports.partnerMail = async (to,name,reason,status) => {
     const html = await ejs.renderFile(
    path.join(__dirname, '../public/PartnerEmail.ejs'),
    { name, status,message:reason }
  );

 await transporter.sendMail({
    from: '"Booking" <bookig@info.com>',
    to,
    subject: 'Code!',
    html,
  });
}
