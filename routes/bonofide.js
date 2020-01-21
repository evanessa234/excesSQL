const express = require('express');

const db = require('../dbConnection');

const router = express.Router();

router.get('/bonofide', async (req, res) => {
  const { rollNo } = req.body;
  try {
    const conn = await db();
    await conn.query('START TRANSACTION');

    const result1 = await conn.query('select * from accepted_app where rollno=?', [rollNo]);
    const result2 = await conn.query('select * from dropstudent where rollno=?', [rollNo]);
    const result3 = await conn.query('select * from rejected_app where rollno=?', [rollNo]);
    const result4 = await conn.query('select * from report where rollno=?', [rollNo]);
    const result5 = await conn.query('select * from student where rollno=?', [rollNo]);
    const result6 = await conn.query('select * from student_bkup_02_jul_18 where rollno=?', [rollNo]);
    const result7 = await conn.query('select * from student_bkup_09_jan_18 where rollno=?', [rollNo]);
    const result8 = await conn.query('select * from student_bkup_130819 where rollno=?', [rollNo]);
    const result9 = await conn.query('select * from student_new where rollno=?', [rollNo]);
    const result10 = await conn.query('select * from student_passout_be_2018 where rollno=?', [rollNo]);

    const result = [];
    if (result1[0]) {
      console.log('result1');
      result.push(result1[0]);
    } else if (result2[0]) {
      console.log('result2');
      result.push(result2[0]);
    } else if (result3[0]) {
      console.log('result3');
      result.push(result3[0]);
    } else if (result4[0]) {
      console.log('result4');
      result.push(result4[0]);
    } else if (result5[0]) {
      console.log('result5');
      result.push(result5[0]);
    } else if (result6[0]) {
      console.log('result6');
      result.push(result6[0]);
    } else if (result7[0]) {
      console.log('result7');
      result.push(result7[0]);
    } else if (result8[0]) {
      console.log('result8');
      result.push(result8[0]);
    } else if (result9[0]) {
      console.log('result9');
      result.push(result9[0]);
    } else if (result10[0]) {
      console.log('result10');
      result.push(result10[0]);
    }

    await conn.query('COMMIT');
    res.status(200).json({
      success: 1,
      data: result,
    });
  } catch (err) {
    res.status(500).json({
      success: 0,
      error: err,
      message: 'Database connection error',
    });
  } finally {
    await conn.release();
    await conn.destroy();
  }
});

module.exports = router;
