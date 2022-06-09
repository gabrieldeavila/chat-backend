// helper/formatDate.js

const moment = require("moment");

function formatMessage(username, text, image) {
  return {
    username,
    text,
    time: moment().format("h:mm a"),
    image: `./patos/${image}.jpg`,
  };
}

module.exports = formatMessage;
