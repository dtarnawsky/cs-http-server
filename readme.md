# HTTP Server

## The Server
The server is deployed as a Cloudflare Worker and available at `https://server.damiantarnawsky.workers.dev`

This accepts a request and returns what it received formatted as html including form data and headers. The idea is that what is send to the server should be the same regardless of whether it is web or ios or android.

You can deploy the server with the command `wrangler deploy` if you want to use your own server.

### Comparison
Multipart form data works with Capacitor http for string based data! (Hooray). If your multi-part form data includes files it does not work (Boo).
See these logs that were captured on the server:
- `ios.json` - This is when the app is running on iOS, note that the data received by the server has a content-length of 1063
- `web.json` - This is when the app is running on web, note that the data received by the server has a content-length of 18121 (the correct size of the file)

Gut feeling is that the code to handle file transfers is not copying all of the data in the same format:
https://github.com/ionic-team/capacitor/blob/87271e2671013ad35d13b22f2e96d4fe8f4eeaf0/ios/Capacitor/Capacitor/Plugins/CapacitorUrlRequest.swift#L124
