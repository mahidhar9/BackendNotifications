import express from "express";
import firebase from "firebase-admin";
import dotenv from "dotenv";

dotenv.config();

const app = express();
const port = process.env.PORT || 4000;

app.use(express.json());

if (!firebase.apps.length) {
  firebase.initializeApp({
    credential: firebase.credential.cert({
      type: process.env.TYPE,
      project_id: process.env.PROJECT_ID,
      private_key_id: process.env.PRIVATE_KEY_ID,
      private_key: process.env.PRIVATE_KEY.replace(/\\n/g, "\n"), // Replace escaped newlines
      client_email: process.env.CLIENT_EMAIL,
      client_id: process.env.CLIENT_ID,
      auth_uri: process.env.AUTH_URI,
      token_uri: process.env.TOKEN_URI,
      auth_provider_x509_cert_url: process.env.AUTH_PROVIDER_X509_CERT_URL,
      client_x509_cert_url: process.env.CLIENT_X509_CERT_URL,
    }),
  });
  console.log("Notification sent");
}

app.post("/send-notification/", async (req, res) => {
  const { token, title, body, data } = await req.body;
  console.log("send notification called");

  console.log("req body is ", req.body);
  console.log("data: ", data);

  if (!token || !title || !body) {
    return res
      .status(400)
      .send({ error: "Token, title, and body are required" });
  }

  console.log("backend is called");
  try {
    const response = await firebase.messaging().send({
      token,
      notification: {
        title,
        body,
      },
      data,
    });
    res.status(200).send({
      message: "Notification sent successfully",
      data: data,
      response,
    });
  } catch (err) {
    res
      .status(500)
      .send({ error: "Error sending notification", details: err.message });
    console.log("Error", err);
  }
});

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
