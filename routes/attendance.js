const express = require('express');

const db = require('../dbConnection');

const router = express.Router();

router.get('/attendance', async (req, res) => {
  const { rollNo } = req.body;
  const conn = await db();

  try {
    await conn.query('START TRANSACTION');
    const result = [];

    // fetching year, division, subject code, Lec_count
    const studAndTotalLect = await conn.query('select coursemapping.Subject_code, coursemapping.Lec_count, stu_record.Year, stu_record.Division from coursemapping left join stu_record on coursemapping.Year=stu_record.Year AND coursemapping.Division=stu_record.Division WHERE stu_record.Roll_no =?', [rollNo]);
    // console.log(studAndTotalLect[0].Year);
    if (studAndTotalLect.length === 0) {
      res.status(200).json({
        result: 'rollNo not found!',
      });
    }

    const year = studAndTotalLect[0].Year;

    const div = studAndTotalLect[0].Division;

    // list of subject_code
    const subCodeStr = [];
    for (let i = 0; i < studAndTotalLect.length; i += 1) {
      subCodeStr.push(studAndTotalLect[i].Subject_code);
    }
    // console.log(subCodeStr);

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
    // console.log(tab);
    // eslint-disable-next-line max-len
    // running a loop to calculate lect attended and lect name with the help of subject code and roll no
    const subNameAndAtten = [];
    for (let j = 0; j < subCodeStr.length; j += 1) {
      // eslint-disable-next-line no-await-in-loop
      const subName = await conn.query(`SELECT course.Subject_code, course.Subject_name, course.Subject_shortname, COUNT(${tab}.Roll_no) as lectAtten FROM course LEFT JOIN ${tab}  ON course.Subject_code=${tab}.Subject_code WHERE ${tab}.Roll_no=? AND course.Subject_code=?`, [rollNo, subCodeStr[j]]);
      subNameAndAtten.push(subName[0]);
    }
    //  console.log(subNameAndAtten);

    // putting subject code, subject name, lect count, lect attended together
    for (let k = 0; k < subCodeStr.length; k += 1) {
    //  console.log(studAndTotalLect[k]["Lec_count"]);
      subNameAndAtten[k].Lec_count = studAndTotalLect[k].Lec_count;
    }

    result.push(subNameAndAtten);
    const result1 = result[0];

    res.status(200).json({
      result: result1,
    });


    // //////////////////////////////////////
    // await conn.query('START TRANSACTION');
    // const result = [];

    // // fetching year, division, subject code, Lec_count
    // const studAndTotalLect = await conn.query('select coursemapping.Subject_code, coursemapping.Lec_count, stu_record.Year, stu_record.Division from coursemapping left join stu_record on coursemapping.Year=stu_record.Year AND coursemapping.Division=stu_record.Division WHERE stu_record.Roll_no =?', [rollNo]);
    // const year = studAndTotalLect[0].Year;
    // // eslint-disable-next-line no-unused-vars
    // const div = studAndTotalLect[0].Division;
    // console.log(year);////////////////////////
    // // list of subject_code
    // const subCodeStr = [];
    // for (let i = 0; i < studAndTotalLect.length; i += 1) {
    //   subCodeStr.push(studAndTotalLect[i].Subject_code);
    // }
    // console.log(subCodeStr);

    // // switches to master table containing attendance bifercated year wise
    // const tableConcernedFinal = async (yearConcerned) => {
    //   switch (yearConcerned) {
    //     case 'FE': {
    //       const tableConcerned = 'master_atten_fe';
    //       return tableConcerned;
    //     }
    //     case 'SE': {
    //       const tableConcerned = 'master_atten_se';
    //       return tableConcerned;
    //     }
    //     case 'TE': {
    //       const tableConcerned = 'master_atten_te';
    //       return tableConcerned;
    //     }
    //     case 'BE': {
    //       const tableConcerned = 'master_atten_be';
    //       return tableConcerned;
    //     }
    //     default: {
    //       return 0;
    //     }
    //   }
    // };
    // const tab = await tableConcernedFinal(year);
    // console.log(tab);
    // const subWiseAttenCalcu = async (table, subCodeStr1, rollNo1) => {
    //   console.log(table);
    //   console.log(subCodeStr1);
    //   console.log(rollNo1);
    //   // running a loop to calculate lect attended and lect name with the help of subject code
    //   const conn1 = await db();
    //   const subNameAndAtten = [];
    //   console.log(subNameAndAtten);
    //   const a = subCodeStr1.forEach(async (item) => {
    //     const subName = await conn1.query(`SELECT course.Subject_code, course.Subject_name, course.Subject_shortname, COUNT(${table}.Roll_no) as lectAtten FROM course LEFT JOIN ${table}  ON course.Subject_code=${table}.Subject_code WHERE ${table}.Roll_no=? AND course.Subject_code=?`, [rollNo1, item]);
    //     // console.log(subName[0]);
    //     console.log(item);
    //     subNameAndAtten.push(subName[0]);
    //     // console.log(subNameAndAtten);
    //   });
    //   await a();
    //   console.log("hieeelo");
    //   console.log(subNameAndAtten);

    //   const finalRecordOfLectAtten = subNameAndAtten;
    //   // console.log(finalRecordOfLectAtten);
    //   return finalRecordOfLectAtten;
    // };
    // //  console.log(subNameAndAtten);
    // const lectAtten = subWiseAttenCalcu(tab, subCodeStr, rollNo);

    // // putting subject code, subject name, lect count, lect attended together
    // for (let k = 0; k < subCodeStr.length; k += 1) {
    // //  console.log(studAndTotalLect[k]["Lec_count"]);
    //   lectAtten[k]["Lec_count"] = studAndTotalLect[k]["Lec_count"];
    // }

    // result.push(lectAtten);
    // const result1 = result[0];

    // res.status(200).json({
    //   result: result1,
    // });
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
