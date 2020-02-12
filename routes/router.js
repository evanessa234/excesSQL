const express = require('express');

const router = express.Router();

const {
  attendance,
  bonofide,
  termtest,
  pretest,
} = require('./controller');

router.get('/attendance', attendance);
router.get('/bonofide', bonofide);
router.get('/termtest', termtest);
router.get('/pretest', pretest);

module.exports = router;
