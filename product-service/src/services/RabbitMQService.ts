import { AMQPClient } from "@cloudamqp/amqp-client";
import config from "../config/config";
import { Product } from "../database";
import { ApiError } from "../utils/apiError";

class RabbitMQService {
  private requestQueue = "PRODUCT_DETAILS_REQUEST";
  private responseQueue = "PRODUCT_DETAILS_RESPONSE";
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
        const { productId } = JSON.parse(msg.body.toString());
        const productDetails = await getProductDetails(productId);

        const responseQueue = await this.channel.queue(this.responseQueue);
        await responseQueue.publish(JSON.stringify(productDetails), {
          correlationId: msg.properties?.correlationId,
        });

        msg.ack();
      }
    });
  }
}

const getProductDetails = async (productId: string) => {
  const productDetails = await Product.findById(productId).select("");

  if (!productDetails) {
    throw new ApiError(404, "Product not found");
  }

  return productDetails;
};

export const rabbitMQService = new RabbitMQService();
