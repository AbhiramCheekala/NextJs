// URL to ping to keep the server alive.
// Replace 'https://your-app-url.com' with your actual application URL.
const APP_URL = "https://watool.onrender.com/api/health";
const PING_INTERVAL = 5 * 60 * 1000; // 5 minutes in milliseconds

const job = async () => {
  try {
    const response = await fetch(APP_URL);
    if (response.ok) {
      console.log(`Keep-alive ping sent successfully to ${APP_URL}`);
    } else {
      console.error(
        `Keep-alive ping to ${APP_URL} failed with status: ${response.status}`
      );
    }
  } catch (error) {
    console.error(`Error sending keep-alive ping to ${APP_URL}:`, error);
  }
};

// Run the job immediately and then every PING_INTERVAL
job();
setInterval(job, PING_INTERVAL);
