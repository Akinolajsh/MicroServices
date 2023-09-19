import amqp from "amqplib";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const amqpServer = "amqps://cbsezxxv:jI-lwgKFBCGeNovYv0-18HK-G1hrY7Af@puffin.rmq2.cloudamqp.com/cbsezxxv";
// const amqpServer = "amqp://localhost:5672";

const myConnection = async (queue: string) => {
  try {
    const connect = await amqp.connect(amqpServer);
    const channel = await connect.createChannel();

    await channel.assertQueue(queue);

    await channel.consume(queue, async (message: any) => {
      let res = JSON.parse(message.content.toString());

      const user: any = await prisma.authModel.findUnique({
        where: { id: res?.userID },
      });
      user?.store?.push(res);

      // const product = await prisma.authModel.update({
      //   where: { id: res?.userID },
      //   data: {
      //     store: user?.store,
      //   },
      // });

      // console.log(product)

      const product = await prisma.authModel.update({
        where: { id: res?.userID },
        data: {
          store: user?.store,
        },
      });

      channel.ack(message);
    });
  } catch (error: any) {
    console.log("error connecting");
  }
};

export { myConnection };
