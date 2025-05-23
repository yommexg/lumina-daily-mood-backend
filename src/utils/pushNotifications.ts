import { Expo } from "expo-server-sdk";

// Initialize the Expo SDK with the access token
let expo = new Expo({
  accessToken: process.env.EXPO_ACCESS_TOKEN,
  useFcmV1: true,
});

// Function to send push notifications
export const sendPushNotification = async ({
  pushTokens,
  body,
  data = {},
  title = "",
  subTitle = "",
}: {
  pushTokens: string[];
  body: string;
  data?: any;
  title?: string;
  subTitle?: string;
}): Promise<any> => {
  if (!pushTokens || pushTokens.length === 0) {
    throw new Error("No push tokens provided.");
  }

  if (!body) {
    throw new Error("Message Body is required.");
  }

  let messages = [];

  for (let pushToken of pushTokens) {
    // Validate if the push token is an Expo push token
    if (!Expo.isExpoPushToken(pushToken)) {
      console.error(`Push token ${pushToken} is not a valid Expo push token`);
      continue;
    }

    // Create the notification message object
    messages.push({
      to: pushToken,
      sound: "default",
      title,
      subTitle,
      body,
      data: {
        data,
      },
    });
  }

  // Chunk messages (Expo limits notifications to a certain size per request)
  let chunks = expo.chunkPushNotifications(messages);
  let tickets: any[] = [];

  try {
    // Send the push notifications in chunks
    for (let chunk of chunks) {
      let ticketChunk = await expo.sendPushNotificationsAsync(chunk);
      console.log("Notification Ticket Chunk:", ticketChunk);
      tickets.push(...ticketChunk);
    }
  } catch (error) {
    console.error("Error sending push notifications:", error);
    throw new Error("Error sending push notifications.");
  }

  // Extract receipt IDs from tickets that were successful
  let receiptIds = tickets
    .filter((ticket) => ticket.status === "ok")
    .map((ticket) => ticket.id);

  // Chunk receipt IDs (Expo limits the number of receipts you can retrieve in one request)
  let receiptIdChunks = expo.chunkPushNotificationReceiptIds(receiptIds);

  try {
    // Retrieve receipts to check the status of each notification
    for (let chunk of receiptIdChunks) {
      let receipts = await expo.getPushNotificationReceiptsAsync(chunk);
      console.log("Receipts:", receipts);

      for (let receiptId in receipts) {
        const { status, details } = receipts[receiptId];
        if (status === "ok") continue;

        // Handle errors if the notification failed
        if (details && details.error) {
          console.error(`Error code: ${details.error}`);
        }
      }
    }
  } catch (error) {
    console.error("Error retrieving receipts:", error);
    throw new Error("Error retrieving receipts.");
  }

  // Return success message and the list of ticket objects
  return {
    message: "Push Notifications sent successfully.",
    tickets,
  };
};
