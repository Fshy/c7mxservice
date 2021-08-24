require('dotenv').config();
const path        = require('path');
const express     = require('express');
const cors        = require('cors');
const SibApiV3Sdk = require('sib-api-v3-sdk');

const defaultClient = SibApiV3Sdk.ApiClient.instance;
const apiKey = defaultClient.authentications['api-key'];
apiKey.apiKey = process.env.mcAPIv3;
const apiInstance = new SibApiV3Sdk.TransactionalEmailsApi();

const app         = express();
const server      = require('http').createServer(app);

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');
app.use(express.static(path.join(__dirname, 'public')));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors({
  origin: '*',
  credentials: true,
}));

app.get('/', (req, res) => {
  res.send('C7MXSERVICE ONLINE');
});

app.post('/email', (req, res) => {
  let mcEmail = new SibApiV3Sdk.SendSmtpEmail();

  mcEmail = {
    sender: {
      name: 'M&C Website Alerts',
      email: 'mandcinsurance.alerts@gmail.com',
    },
    to: [{
      email: 'mcinsure@mandcgroup.com',
    }],
    cc: [
      { email: 'laverneg@mandcgroup.com' },
      { email: 'qchristophe@mandcgroup.com' },
      { email: 'emilym@mandcgroup.com' },
      { email: 'vernessac.hd@mandcgroup.com' },
    ],
    subject: 'New Quotation Generated',
    htmlContent: req.body.message || '',
  };

  apiInstance.sendTransacEmail(mcEmail).then((data) => {
    console.log(`API called successfully. Returned data: ${data.exports}`);
    res.send('OK');
  }, (error) => {
    console.error(error.message);
    res.send('ERROR');
  });
});

// const crewsInnTransporter = nodemailer.createTransport({
//   service: 'gmail',
//   auth: {
//     user: process.env.CREWSINN_USER,
//     pass: process.env.CREWSINN_PASS,
//   },
// });

// const crewsInnHotel = {
//   from: 'Crews Inn Website <crewsinn.alerts@gmail.com>',
//   to: 'inquiries@crewsinn.com',
//   cc: ['cdm@crewsinn.com'],
//   subject: 'New Reservation Request',
//   replyTo: '',
//   html: '', // plain text body
// };

// app.post('/crewsinn/hotel/email', (req, res) => {
//   crewsInnHotel.html = req.body.message;
//   crewsInnHotel.replyTo = req.body.email;
//   crewsInnTransporter.sendMail(crewsInnHotel, (err, info) => {
//     if (err) console.log(err);
//     else console.log(info);
//   });
//   res.json({ resp: 'OK' });
// });

// const crewsInnRest = {
//   from: 'Crews Inn Website <crewsinn.alerts@gmail.com>', // sender address
//   to: 'events@crewsinn.com',
//   cc: ['cdm@crewsinn.com'],
//   subject: 'New Reservation Request', // Subject line
//   replyTo: '',
//   html: '', // plain text body
// };

// app.post('/crewsinn/rest/email', (req, res) => {
//   crewsInnRest.html = req.body.message;
//   crewsInnRest.replyTo = req.body.email;
//   crewsInnTransporter.sendMail(crewsInnRest, (err, info) => {
//     if (err) console.log(err);
//     else console.log(info);
//   });
//   res.json({ resp: 'OK' });
// });

server.listen(process.env.PORT, () => {
  console.log(`[c7mxservice] Listening on *:${process.env.PORT}`);
});
