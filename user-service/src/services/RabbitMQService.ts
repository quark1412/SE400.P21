import { AMQPClient } from "@cloudamqp/amqp-client";
import config from "../config/config";
import { User } from "../database";
import { ApiError } from "../utils";

class RabbitMQService {
  private requestQueue = "USER_DETAILS_REQUEST";
  private responseQueue = "USER_DETAILS_RESPONSE";
  private connection!: any;
  private channel!: any;

  constructor() {
    this.init();
  }

  async init() {
    try {
      const amqp = new AMQPClient(config.msgBrokerURL!);
      this.connection = await amqp.connect();
      this.channel = await this.connection.channel();

      await this.channel.queue(this.requestQueue);
      await this.channel.queue(this.responseQueue);

      this.listenForRequests();
    } catch (error) {
      console.error(error);
    }
  }

  private async listenForRequests() {
    const queue = await this.channel.queue(this.requestQueue);

    await queue.subscribe({ noAck: false }, async (msg: any) => {
      if (msg && msg.body) {
        const { userId } = JSON.parse(msg.body.toString());
        const userDetails = await getUserDetails(userId);

        const responseQueue = await this.channel.queue(this.responseQueue);
        await responseQueue.publish(JSON.stringify(userDetails), {
          correlationId: msg.properties?.correlationId,
        });

        msg.ack();
      }
    });
  }
}

const getUserDetails = async (userId: string) => {
  const userDetails = await User.findById(userId).select("-password");

  if (!userDetails) {
    throw new ApiError(404, "User not found");
  }

  return userDetails;
};

export const rabbitMQService = new RabbitMQService();
