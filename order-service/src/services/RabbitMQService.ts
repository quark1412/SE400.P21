import { AMQPClient } from "@cloudamqp/amqp-client";
import config from "../config/config";
import { Order } from "../database";
import { ApiError } from "../utils/apiError";

class RabbitMQService {
  private requestQueue = "ORDER_DETAILS_REQUEST";
  private responseQueue = "ORDER_DETAILS_RESPONSE";
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
        const { orderId } = JSON.parse(msg.body.toString());
        const orderDetails = await getOrderDetails(orderId);

        const responseQueue = await this.channel.queue(this.responseQueue);
        await responseQueue.publish(JSON.stringify(orderDetails), {
          correlationId: msg.properties?.correlationId,
        });

        msg.ack();
      }
    });
  }
}

const getOrderDetails = async (orderId: string) => {
  const orderDetails = await Order.findById(orderId).select("");

  if (!orderDetails) {
    throw new ApiError(404, "Order not found");
  }

  return orderDetails;
};

export const rabbitMQService = new RabbitMQService();
