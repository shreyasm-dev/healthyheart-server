const client = require('twilio')('ACc45c307e7a541663f867ba9d336e8214', 'd3fd494785656e2233a751fc7fc51595');

client.messages
  .create({
    body: 'This is the ship that made the Kessel Run in fourteen parsecs?',
    from: '+16505675385',
    to: '+16368914466',
  })
  .then((message) => console.log(message.sid));
