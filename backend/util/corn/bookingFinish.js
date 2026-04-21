const cron = require("node-cron");

module.exports = () => {
cron.schedule("*/5 * * * *", async () => {
  console.log("check bookings...");
});
}