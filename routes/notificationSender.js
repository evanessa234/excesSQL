const admin = require('firebase-admin');
const db = require('../dbConnection');

const serviceAccount = require('./firebaseConfig.json');

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: 'https://notification-69420.firebaseio.com',
});

class Sender {
  constructor() {
    this.admin = admin;
  }

  async sendIndividual(to, from, message) {
    const conn = await db();
    try {
      await conn.query('START TRANSACTION');
      const result = await conn.query('select * from `users` where `id` = ?', [to]);
      if (result[0]) {
        const { token } = result[0];
        const payload = {
          notification: {
            title: `Message from ${from}`,
            body: message,
          },
        };
        return this.admin.messaging().sendToDevice(token, payload).then((response) => {
          if (response.failureCount > 0) {
            return {
              error: 'FCM error, message not sent',
            };
          }
          return true;
        }).catch((err) => err);
      }
      return {
        reason: "User doesnt exist, check 'to' parameter",
      };
    } catch (err) {
      return err;
    }
  }

  async sendMultiple(to, from, message) {
    const conn = await db();
    try {
      await conn.query('START TRANSACTION');

      let query = 'select * from `users` where `id` in (';
      for (let i = 0; i < to.length; i += 1) {
        if (i === to.length - 1) query += `'${to[i]}'`;
        else query += `'${to[i]}',`;
      }
      query += ')';

      const result = await conn.query(query);
      const tokens = [];

      const failedTargets = to.filter((ID) => {
        for (let i = 0; i < result.length; i += 1) {
          if (result[i].id === ID) return false;
        }
        return true;
      });

      if (result) {
        for (let i = 0; i < result.length; i += 1) {
          tokens.push(result[i].token);
        }

        const payload = {
          notification: {
            title: `Message from ${from}`,
            body: message,
          },
        };

        return this.admin.messaging().sendToDevice(tokens, payload).then((response) => {
          if (response.successCount !== to.length) {
            return {
              error: 'Message not sent to all targets',
              failedTargets,
            };
          }
          return true;
        }).catch((err) => err);
      }
      return {
        reason: "Users dont exist, check 'to' parameter",
      };
    } catch (err) {
      return err;
    }
  }
}

module.exports = Sender;
