import { Injectable, OnModuleInit, OnModuleDestroy, Logger } from '@nestjs/common';
import { Kafka, Producer } from 'kafkajs';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class RedpandaService implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(RedpandaService.name);
  private kafka: Kafka;
  private producer: Producer;

  constructor(private configService: ConfigService) {
    this.kafka = new Kafka({
      clientId: 'analytics-api',
      brokers: [this.configService.get<string>('REDPANDA_BROKERS') || 'localhost:9092'],
    });
    this.producer = this.kafka.producer();
  }

  async onModuleInit() {
    try {
      await this.producer.connect();
      this.logger.log('Connected to Redpanda');
    } catch (error) {
      this.logger.error('Failed to connect to Redpanda', error);
    }
  }

  async onModuleDestroy() {
    await this.producer.disconnect();
  }

  async sendEvent(topic: string, key: string, message: any) {
    try {
      await this.producer.send({
        topic,
        messages: [{ key, value: JSON.stringify(message) }],
      });
    } catch (error) {
      this.logger.error(`Error sending event to topic ${topic}`, error);
      throw error;
    }
  }
}
