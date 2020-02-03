/* eslint-disable linebreak-style */
const express = require('express');

// const mysql = require('mysql');

const router = express.Router();

const db = require('../dbConnection');

router.get('/termtest', async (req, res) => {
  const conn = await db();
  try {
    await conn.query('START TRANSACTION');
    const mapping = {};
    const temp = await conn.query('select Subject_code , Subject_name from `course` ');
    temp.forEach((element) => {
      mapping[element.Subject_code] = element.Subject_name;
    });
    // provide Roll_no in ['16CE1079', ...] object form
    const { rollNo } = req.body;

    const result = await conn.query('SELECT tt_student_marks.roll_no , tt_test_identification_table.subject_code , tt_student_marks.marks_obtained , tt_student_marks.marks_total  FROM `tt_student_marks` JOIN `tt_test_identification_table` ON tt_student_marks.test_id=tt_test_identification_table.test_id  WHERE `roll_no` =?  ', [rollNo]);
    // console.log(result);
    result.forEach((element) => {
      // eslint-disable-next-line no-param-reassign
      element.subject_name = mapping[element.subject_code];
    });
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


router.get('/pretest', async (req, res) => {
  const conn = await db();
  try {
    await conn.query('START TRANSACTION');
    const mapping = {};
    const temp = await conn.query('select Subject_code , Subject_name from `course` ');
    temp.forEach((element) => {
      mapping[element.Subject_code] = element.Subject_name;
    });
    // provide Roll_no in ['16CE1079', ...] object form
    const { rollNo } = req.body;

    const result = await conn.query('SELECT student_marks.roll_no , test_identification_table.subject_code , student_marks.marks_obtained , student_marks.marks_total FROM `student_marks` JOIN `test_identification_table` ON student_marks.test_id=test_identification_table.test_id WHERE `roll_no` =?  ', [rollNo]);
    // console.log(result);
    result.forEach((element) => {
      // eslint-disable-next-line no-param-reassign
      element.subject_name = mapping[element.subject_code];
    });
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
