const express = require('express');

const db = require('../dbConnection');
const NotificationSender = require('./notificationSender');

const Sender = new NotificationSender();
const router = express.Router();

/*
  POSSIBLE VALUES FOR IDENTIFICATION

identification = student ||
                 faculty ||
                 `${department}_${student/faculty}_${year}_${division}_${batch}`
*/
/*
CREATE TABLE `users`
( `id` VARCHAR(20) NOT NULL ,
`password` VARCHAR(20) NOT NULL ,
`topics` VARCHAR(100) NOT NULL ,
`token` VARCHAR(200) NOT NULL ) ENGINE = InnoDB;
*/


/**
 * API module
 * @module routes/api
 * base URL: /api
 */


/**
 * Fetch all messages
 * type: GET
 * query params = []
 * URL: /message/fetch/all
 */
router.get('/message/fetch/all', async (req, res) => {
  const conn = await db();
  try {
    await conn.query('START TRANSACTION');
    const result = await conn.query('select * from `recieved`');
    res.status(200).json({
      result,
    });
  } catch (err) {
    res.status(500).json({
      error: err,
    });
  } finally {
    await conn.release();
    await conn.destroy();
  }
});


/**
 * Fetch all message history
 * type: GET
 * query params = []
 * URL: /message/history/:sdrn
 */
router.get('/message/history/:sdrn', async (req, res) => {
  const conn = await db();
  try {
    await conn.query('START TRANSACTION');
    const result = await conn.query('select * from `recieved` where `by` = ?', [req.params.sdrn]);
    res.status(200).json({
      result,
    });
  } catch (err) {
    res.status(500).json({
      error: err,
    });
  } finally {
    await conn.release();
    await conn.destroy();
  }
});

/**
 * Fetch all messages for respective `identification`
 * type: GET
 * query params = []
 * URL: /message/fetch/:identification/:(roll or sdrn)
 */
router.get('/message/fetch/:identification/all', async (req, res) => {
  const conn = await db();
  try {
    await conn.query('START TRANSACTION');
    const result = await conn.query(
      'select * from `recieved` where  `identification`= ?', [req.params.identification],
    );

    res.status(200).json({
      result,
    });
  } catch (err) {
    res.status(500).json({
      error: err,
    });
  } finally {
    await conn.release();
    await conn.destroy();
  }
});


/**
 * Fetch all messages for respective role(student or faculty) `id`
 * type: GET
 * query params = []
 * URL: /message/fetch/:(roll or sdrn)/all
 */
router.get('/message/fetch/:role/:id/all', async (req, res) => {
  const conn = await db();
  try {
    let who = '';
    if (req.params.role === 'student') who = 'AS';
    else if (req.params.role === 'faculty') who = 'AF';

    await conn.query('START TRANSACTION');
    const resp = await conn.query(
      'select `topics` from `users` where  `id` =  ? ', [req.params.id],
    );
    const topics = resp[0].topics.split('_');
    let val = '';
    let query = `select * from \`recieved\` where ( identification in ('${who}',`;
    for (let i = 0; i < topics.length; i += 1) {
      if (i === 0) val += `${topics[i]}`;
      else val += `_${topics[i]}`;

      if (i === topics.length - 1) query += `'${val}'))`;
      else query += `'${val}',`;
    }
    query += ` or (\`to\` like '${req.params.id}') ORDER by timestamp DESC`;

    const result = await conn.query(query);
    res.status(200).json({
      result,
    });
  } catch (err) {
    res.status(500).json({
      error: err,
    });
  } finally {
    await conn.release();
    await conn.destroy();
  }
});

/**
 * send message to respective `identification` and `roll number` || `sdrn`
 * type: POST
 * query params = {
 * by: 'by (SDRN)',
 * to: to (roll) or (sdrn)',
 * message: 'message to be sent',
 * role: 'role of the user that sent it, can be [faculty, admin, HOD]',
 * }
 *
 * URL: /message/send/:identification/individual
 */

router.post('/message/send/:identification/individual', async (req, res) => {
  const conn = await db();
  try {
    const sent = await Sender.sendIndividual(req.body.to, req.body.by, req.body.message);
    if (sent === true) {
      await conn.query('START TRANSACTION');
      const result = await conn.query(
        'insert into `recieved` (`by`, `to`, `message`, `type`, `role`, `identification`) VALUES (?, ?, ?, ?, ?, ?)',
        [
          req.body.by,
          req.body.to,
          req.body.message,
          'individual',
          req.body.role,
          req.params.identification,
        ],
      );
      await conn.query('COMMIT');
      res.status(200).json({
        result,
      });
    } else {
      res.status(500).send(sent);
    }
  } catch (err) {
    res.status(500).json({
      error: err,
    });
  } finally {
    await conn.release();
    await conn.destroy();
  }
});

/**
 * send message to all `identification`
 * type: POST
 * query params = {
 * by: 'by (SDRN)',
 * message: 'message to be sent',
 * role: 'role of the user that sent it, can be [faculty, admin, HOD]',
 * }
 *
 * URL: /message/send/:identification/all
 */

router.post('/message/send/:identification/all', async (req, res) => {
  const conn = await db();
  let type;
  if (req.params.identification === 'student') {
    type = 'AS';
  } else if (req.params.identification === 'faculty') {
    type = 'AF';
  } else {
    type = req.params.identification;
  }
  try {
    const sent = await Sender.sendBatch(req.params.identification, req.body.by, req.body.message);

    if (sent) {
      await conn.query('START TRANSACTION');
      const result = await conn.query(
        'insert into `recieved` (`by`, `to`, `message`, `type`, `role`, `identification`) VALUES (?, ?, ?, ?, ?, ?)',
        [req.body.by, `all_${req.params.identification}`, req.body.message, type, req.body.role, req.params.identification],
      );
      await conn.query('COMMIT');
      res.status(200).json({
        result,
      });
    } else {
      res.status(500).send(sent);
    }
  } catch (err) {
    res.status(500).json({
      error: err,
    });
  } finally {
    await conn.release();
    await conn.destroy();
  }
});


/**
 * send message to multiple `identification` and `roll number` || `sdrn`
 * type: POST
 * query params = {
 * by: 'by (SDRN)',
 * to: to [roll , sdrn] (LIST),
 * message: 'message to be sent',
 * role: 'role of the user that sent it, can be [faculty, admin, HOD]',
 * }
 *
 * URL: /message/send/:identification/multiple
 */
router.post('/message/send/:identification/multiple', async (req, res) => {
  const conn = await db();
  try {
    const to = JSON.parse(req.body.to);
    const sent = await Sender.sendMultiple(to, req.body.by, req.body.message);

    if (sent) {
      await conn.query('START TRANSACTION');
      let query = 'insert into `recieved` (`by`, `to`, `message`, `type`, `role`, `identification`) VALUES ';
      for (let i = 0; i < to.length; i += 1) {
      // eslint-disable-next-line no-template-curly-in-string
        query += `('${req.body.by}', '${to[i]}', '${req.body.message}','multiple', '${req.body.role}','${req.params.identification}'), `;
      }
      query = query.replace(/,\s*$/, '');

      const result = await conn.query(query);
      await conn.query('COMMIT');

      res.status(200).json({
        result,
      });
    } else {
      res.status(500).send(sent);
    }
  } catch (err) {
    res.status(500).json({
      error: err,
    });
  } finally {
    await conn.release();
    await conn.destroy();
  }
});

module.exports = router;
