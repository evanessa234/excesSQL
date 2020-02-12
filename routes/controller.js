/* eslint-disable no-param-reassign */
const express = require('express');

const { database1, database2 } = require('../config');

const { conncn } = require('../dbConnection');

module.exports = {
  attendance: async (req, res) => {
    const { rollNo } = req.body;
    const conn = await conncn(database1);
    try {
      await conn.query('START TRANSACTION');
      const result = [];

      // fetching year, division, subject code, Lec_count
      const studAndTotalLect = await conn.query(`select coursemapping.Subject_code, coursemapping.Lec_count, stu_record.Year, stu_record.Division from \`coursemapping\` left join \`stu_record\` on coursemapping.Year=stu_record.Year AND coursemapping.Division=stu_record.Division WHERE stu_record.Roll_no ='${rollNo}'`);
      if (studAndTotalLect.length === 0) {
        res.status(200).json({
          result: 'rollNo not found!',
        });
      }

      const year = studAndTotalLect[0].Year;

      // eslint-disable-next-line no-unused-vars
      const div = studAndTotalLect[0].Division;

      // list of subject_code
      const subCodeStr = [];
      studAndTotalLect.forEach((element) => {
        subCodeStr.push(element.Subject_code);
      });

      // switches to master table containing attendance bifercated year wise
      const tableConcernedFinal = async (year1) => {
        switch (year1) {
          case 'FE': {
            const tableConcerned = 'master_atten_fe';
            return tableConcerned;
          }
          case 'SE': {
            const tableConcerned = 'master_atten_se';
            return tableConcerned;
          }
          case 'TE': {
            const tableConcerned = 'master_atten_te';
            return tableConcerned;
          }
          case 'BE': {
            const tableConcerned = 'master_atten_be';
            return tableConcerned;
          }
          default: {
            res.status(200).json({
              result: 'rollNo does not found in any of the table!',
            });
            return 1;
          }
        }
      };
      const tab = await tableConcernedFinal(year);
      // eslint-disable-next-line max-len
      // running a loop to calculate lect attended and lect name with the help of subject code and roll no
      const subNameAndAtten = [];
      for (let j = 0; j < subCodeStr.length; j += 1) {
        // eslint-disable-next-line no-await-in-loop
        const subName = await conn.query(`SELECT course.Subject_code, course.Subject_name, course.Subject_shortname, COUNT(${tab}.Roll_no) as lectAtten FROM course LEFT JOIN ${tab}  ON course.Subject_code=${tab}.Subject_code WHERE ${tab}.Roll_no='${rollNo}' AND course.Subject_code='${subCodeStr[j]}'`);
        subNameAndAtten.push(subName[0]);
      }

      // putting subject code, subject name, lect count, lect attended together
      let k = 0;
      subNameAndAtten.forEach((element) => {
        element.Lec_count = studAndTotalLect[k].Lec_count;
        k += 1;
      });

      result.push(subNameAndAtten);
      const result1 = result[0];

      res.status(200).json({
        result: result1,
      });
    } catch (err) {
      res.status(500).json({
        error: err,
      });
    } finally {
      await conn.release();
      await conn.destroy();
    }
  },
  bonofide: async (req, res) => {
    const { rollNo } = req.body;
    const conn = await conncn(database2);

    try {
      await conn.query('START TRANSACTION');

      const result1 = await conn.query(`select * from accepted_app where rollno='${rollNo}'`);
      const result2 = await conn.query(`select * from dropstudent where rollno='${rollNo}'`);
      const result3 = await conn.query(`select * from rejected_app where rollno='${rollNo}'`);
      const result4 = await conn.query(`select * from report where rollno='${rollNo}'`);
      const result5 = await conn.query(`select * from student where rollno='${rollNo}'`);
      const result6 = await conn.query(`select * from student_bkup_02_jul_18 where rollno='${rollNo}'`);
      const result7 = await conn.query(`select * from student_bkup_09_jan_18 where rollno='${rollNo}'`);
      const result8 = await conn.query(`select * from student_bkup_130819 where rollno='${rollNo}'`);
      const result9 = await conn.query(`select * from student_new where rollno='${rollNo}'`);
      const result10 = await conn.query(`select * from student_passout_be_2018 where rollno='${rollNo}'`);

      const result = [];
      if (result1[0]) {
        // console.log('result1');
        result.push(result1[0]);
      } else if (result2[0]) {
        // console.log('result2');
        result.push(result2[0]);
      } else if (result3[0]) {
        // console.log('result3');
        result.push(result3[0]);
      } else if (result4[0]) {
        // console.log('result4');
        result.push(result4[0]);
      } else if (result5[0]) {
        // console.log('result5');
        result.push(result5[0]);
      } else if (result6[0]) {
        // console.log('result6');
        result.push(result6[0]);
      } else if (result7[0]) {
        // console.log('result7');
        result.push(result7[0]);
      } else if (result8[0]) {
        // console.log('result8');
        result.push(result8[0]);
      } else if (result9[0]) {
        // console.log('result9');
        result.push(result9[0]);
      } else if (result10[0]) {
        // console.log('result10');
        result.push(result10[0]);
      } else {
        result[0] = 'invalid roll no';
      }

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
  },
  termtest: async (req, res) => {
    const conn = await conncn(database1);
    // const conn = await db();
    try {
      await conn.query('START TRANSACTION');
      const mapping = {};
      const temp = await conn.query('select Subject_code , Subject_name from `course` ');
      temp.forEach((element) => {
        mapping[element.Subject_code] = element.Subject_name;
      });
      // provide Roll_no in ['16CE1079', ...] object form
      const { rollNo } = req.body;

      const result = await conn.query(`SELECT tt_student_marks.roll_no , tt_test_identification_table.subject_code , tt_student_marks.marks_obtained , tt_student_marks.marks_total  FROM \`tt_student_marks\` JOIN \`tt_test_identification_table\` ON tt_student_marks.test_id=tt_test_identification_table.test_id  WHERE \`roll_no\` = '${rollNo}' `);
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
  },
  pretest: async (req, res) => {
    const conn = await await conncn(database1);
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
  },
};
