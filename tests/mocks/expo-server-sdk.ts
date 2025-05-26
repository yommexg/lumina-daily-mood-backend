export class Expo {
  constructor(_: any) {}

  static isExpoPushToken(token: string): boolean {
    return token.startsWith("ExponentPushToken");
  }

  chunkPushNotifications(messages: any[]) {
    return [messages];
  }

  async sendPushNotificationsAsync(chunk: any[]) {
    return chunk.map(() => ({
      status: "ok",
      id: "mock-ticket-id",
    }));
  }

  chunkPushNotificationReceiptIds(ids: string[]) {
    return [ids];
  }

  async getPushNotificationReceiptsAsync(ids: string[]) {
    return ids.reduce((acc, id) => {
      acc[id] = { status: "ok" };
      return acc;
    }, {} as Record<string, { status: string }>);
  }
}
