import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { QdrantClient } from '@qdrant/js-client-rest';
import * as dotenv from 'dotenv';

dotenv.config();

@Injectable()
export class QdrantService implements OnModuleInit {
  private client: QdrantClient;
  private readonly logger = new Logger(QdrantService.name);
  private readonly collectionName = 'bauchi_knowledge';
  private isConnected = false;

  constructor() {
    try {
      this.client = new QdrantClient({
        url: process.env.QDRANT_URL || 'http://localhost:6333',
      });
    } catch (error: any) {
      this.logger.warn(`Qdrant client init failed: ${error.message}`);
      this.isConnected = false;
    }
  }

  async onModuleInit() {
    try {
      await this.ensureCollection();
      this.isConnected = true;
    } catch (error: any) {
      this.logger.warn(`Qdrant not available: ${error.message}. RAG features will be limited.`);
      this.isConnected = false;
    }
  }

  private async ensureCollection() {
    if (!this.isConnected) return;
    
    try {
      const collections = await this.client.getCollections();
      const exists = collections.collections.some(
        (c: any) => c.name === this.collectionName
      );

      if (!exists) {
        await this.client.createCollection(this.collectionName, {
          vectors: {
            size: 768,
            distance: 'Cosine',
          },
        });
        this.logger.log(`Created collection: ${this.collectionName}`);
      }
    } catch (error: any) {
      this.logger.warn(`Could not ensure collection: ${error.message}`);
      this.isConnected = false;
    }
  }

  async upsertPoints(
    points: Array<{
      id: string;
      vector: number[];
      payload: Record<string, any>;
    }>
  ) {
    if (!this.isConnected) {
      this.logger.warn('Qdrant not connected, skipping upsert');
      return;
    }

    try {
      await this.client.upsert(this.collectionName, {
        points: points.map((p) => ({
          id: p.id,
          vector: p.vector,
          payload: p.payload,
        })),
      });
      this.logger.log(`Upserted ${points.length} points`);
    } catch (error: any) {
      this.logger.error(`Error upserting points: ${error.message}`);
      throw error;
    }
  }

  async search(
    vector: number[],
    limit: number = 5,
    filter?: Record<string, any>
  ): Promise<any[]> {
    if (!this.isConnected) {
      return [];
    }

    try {
      const result = await this.client.search(this.collectionName, {
        vector,
        limit,
        filter: filter || {},
        with_payload: true,
      });
      return result;
    } catch (error: any) {
      this.logger.error(`Error searching: ${error.message}`);
      return [];
    }
  }

  async deleteCollection() {
    if (!this.isConnected) return;
    
    try {
      await this.client.deleteCollection(this.collectionName);
      this.logger.log(`Deleted collection: ${this.collectionName}`);
    } catch (error: any) {
      this.logger.error(`Error deleting collection: ${error.message}`);
    }
  }

  async getCollectionInfo() {
    if (!this.isConnected) return null;
    
    try {
      const info = await this.client.getCollection(this.collectionName);
      return info;
    } catch (error: any) {
      this.logger.error(`Error getting collection info: ${error.message}`);
      return null;
    }
  }
}