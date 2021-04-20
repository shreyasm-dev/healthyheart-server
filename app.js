// Import all modules
const express = require('express');
const {
  writeFileSync,
  unlinkSync,
  opendirSync,
  readFileSync,
} = require('fs');
const { join } = require('path');
const twilio = require('twilio');

const auth = readFileSync('./twilio_auth.txt').toString().split(' '); // Get SID and key for auth
const client = twilio(auth[0], auth[1]); // Authenticate Twilio

const app = express();
app.use(express.json());
app.use(express.urlencoded({
  extended: true,
}));

app.get('/', (req, res) => {
  res.sendFile(join(__dirname, 'public/index.html'));
});

app.get('/favicon.ico', (req, res) => {
  res.sendFile(join(__dirname, 'public/favicon.png'));
});

app.get('/app', (req, res) => {
  res.sendFile(join(__dirname, 'public/app/index.html'));
});

app.get('/app/*', (req, res) => {
  res.sendFile(join(__dirname, 'public', req.path));
});

app.post('/reminder', (req, res) => {
  writeFileSync(`./reminders/${req.body.name}${req.body.number}`, JSON.stringify(req.body));
});

app.post('/delete-reminder', (req, res) => {
  unlinkSync(`./reminders/${req.body.name}${req.body.number}`);
});

const time12to24 = (hours, mins, pm) => {
  if (hours === 12) {
    hours = 0;
  }

  if (pm) {
    hours += 12;
  }

  return [hours, mins];
};

setInterval(() => {
  const reminders = opendirSync('./reminders');
  let reminder = reminders.readSync();
  while (reminder) {
    const json = JSON.parse(readFileSync(join('reminders', reminder.name)).toString());
    const now = new Date();
    const hours = now.getUTCHours().toString();
    const mins = now.getUTCMinutes().toString();
    const utcTime = new Date(2021, 4, 1, json.hours, json.mins).toUTCString();
    const nowTime = `Sun, 02 May 2021 ${hours.length !== 1 ? hours : `0${hours}`}:${mins.length !== 1 ? mins : `0${mins}`}:00 GMT`;
    // console.log(now.getHours(), now.getUTCHours());

    if (utcTime === nowTime && json.days[now.getUTCDay()]) {
      try {
        client.messages.create({
          body: `Healthy Heart reminder "${json.name}"`,
          from: '+16505675385',
          to: json.number,
        });
      } catch {} // eslint-disable-line no-empty
    }

    reminder = reminders.readSync();
  }

  reminders.closeSync();
}, 60000);

app.listen(80);
