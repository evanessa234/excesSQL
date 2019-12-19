const express = require('express');
const db = require('../dbConnection');

const router = express.Router();

/* Fetching endpoints */

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

router.get('/message/fetch/student/:roll', async (req, res) => {
  const conn = await db();
  try {
    await conn.query('START TRANSACTION');
    let result;
    if (req.params.roll === 'all') {
      result = await conn.query(
        "select * from `recieved` where  `identification`='student'",
      );
    } else {
      result = await conn.query(
        `select * from \`recieved\` where \`to\` = '${req.params.roll}'`,
      );
    }

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

router.get('/message/fetch/faculty/:sdrn', async (req, res) => {
  const conn = await db();
  try {
    await conn.query('START TRANSACTION');
    let result;
    if (req.params.sdrn === 'all') {
      result = await conn.query(
        "select * from `recieved` where  `identification`='faculty'",
      );
    } else {
      result = await conn.query(
        `select * from \`recieved\` where \`to\` = '${req.params.sdrn}'`,
      );
    }

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


// sending endpoints
// id by to type message timestamp role

router.post('/message/send/student/individual', async (req, res) => {
  const conn = await db();
  try {
    await conn.query('START TRANSACTION');
    const result = await conn.query(
      'insert into `recieved` (`by`, `to`, `message`, `type`, `role`, `identification`) VALUES (?, ?, ?, ?, ?, ?)',
      [
        req.body.by,
        req.body.to,
        req.body.message,
        'individual',
        req.body.role,
        'student',
      ],
    );
    await conn.query('COMMIT');
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

router.post('/message/send/student/all', async (req, res) => {
  const conn = await db();
  try {
    await conn.query('START TRANSACTION');
    const result = await conn.query(
      'insert into `recieved` (`by`, `to`, `message`, `type`, `role`, `identification`) VALUES (?, ?, ?, ?, ?, ?)',
      [req.body.by, 'all', req.body.message, 'AS', req.body.role, 'student'],
    );
    await conn.query('COMMIT');
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

router.post('/message/send/student/multiple', async (req, res) => {
  const conn = await db();
  try {
    await conn.query('START TRANSACTION');
    let query = 'insert into `recieved` (`by`, `to`, `message`, `type`, `role`, `identification`) VALUES ';
    for (let i = 0; i < req.body.to.length; i += 1) {
      // eslint-disable-next-line no-template-curly-in-string
      query += `('${req.body.by}', '${req.body.to[i]}', '${req.body.message}','multiple', '${req.body.role}','student'), `;
    }
    query = query.replace(/,\s*$/, '');
    const result = await conn.query(query);
    await conn.query('COMMIT');
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


router.post('/message/send/faculty/individual', async (req, res) => {
  const conn = await db();
  try {
    await conn.query('START TRANSACTION');
    const result = await conn.query(
      'insert into `recieved` (`by`, `to`, `message`, `type`, `role`, `identification`) VALUES (?, ?, ?, ?, ?, ?)',
      [
        req.body.by,
        req.body.to,
        req.body.message,
        'individual',
        req.body.role,
        'faculty',
      ],
    );
    await conn.query('COMMIT');
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

router.post('/message/send/faculty/all', async (req, res) => {
  const conn = await db();
  try {
    await conn.query('START TRANSACTION');
    const result = await conn.query(
      'insert into `recieved` (`by`, `to`, `message`, `type`, `role`, `identification`) VALUES (?, ?, ?, ?, ?, ?)',
      [req.body.by, 'all', req.body.message, 'AF', req.body.role, 'faculty'],
    );
    await conn.query('COMMIT');
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
module.exports = router;
