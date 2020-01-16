const express = require('express');

const app = express();

app.use(require('./authRoutes'));
app.use(require('./fetchMessageRoutes'));
app.use(require('./sendMessageRoutes'));

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


module.exports = router;
