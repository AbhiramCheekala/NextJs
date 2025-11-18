# How to Set Up the Keep-Alive Script

This document explains how the keep-alive script is integrated to run automatically when your Next.js server starts. This is useful for free hosting plans that shut down servers due to inactivity.

## 1. Update the Application URL

Before starting your server, you need to update the `APP_URL` variable in `cron/keep-alive.js` with your application's public URL.

```javascript
// cron/keep-alive.js

// URL to ping to keep the server alive.
// Replace 'https://your-app-url.com' with your actual application URL.
const APP_URL = 'https://your-app-url.com/api/health';
```

## 2. Running the Keep-Alive Script with Your Server

The `keep-alive.js` script is now configured to start automatically when you run your Next.js server using the `npm start` command. This is achieved by modifying the `start` script in your `package.json` to use `concurrently`.

**No additional setup is required beyond updating the `APP_URL` and running `npm start`.**

### How it works:

When you execute `npm start`:
1.  The `concurrently` package runs two commands in parallel:
    *   `next start`: Starts your Next.js production server.
    *   `node cron/keep-alive.js`: Starts the keep-alive script.
2.  The `keep-alive.js` script then periodically pings your `/api/health` endpoint (every 5 minutes) to simulate activity and prevent your hosting provider from idling your server.

## 3. Verify the Keep-Alive Script

After starting your server with `npm start`, you should see console output from both your Next.js server and the `keep-alive.js` script. The keep-alive script will log messages like:

```
Keep-alive ping sent successfully to https://your-app-url.com/api/health
```

You can also monitor your server logs to ensure that the `/api/health` endpoint is being hit at regular intervals.