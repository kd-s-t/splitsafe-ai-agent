import { idlFactory } from '@/declarations/split_dapp';
import { Actor, HttpAgent } from '@dfinity/agent';
import { ChatMessage, ICPActor, ProcessedChatMessage } from '../types';

export class ICPChatService {
  private static instance: ICPChatService;
  private actor: ICPActor | null = null;
  private isConnected: boolean = false;

  private constructor() {
    this.initializeActor();
  }

  public static getInstance(): ICPChatService {
    if (!ICPChatService.instance) {
      ICPChatService.instance = new ICPChatService();
    }
    return ICPChatService.instance;
  }

  private async initializeActor() {
    try {
      const canisterId = process.env.VITE_CANISTER_ID_SPLIT_DAPP;
      const host = process.env.VITE_DFX_HOST;
      
      if (!canisterId) {
        throw new Error('VITE_CANISTER_ID_SPLIT_DAPP environment variable is required');
      }
      if (!host) {
        throw new Error('VITE_DFX_HOST environment variable is required');
      }
      
      this.actor = Actor.createActor(idlFactory, {
        agent: await HttpAgent.create({ host }),
        canisterId,
      });
      
      this.isConnected = true;
    } catch {
      this.isConnected = false;
    }
  }

  public async sendMessage(
    escrowId: string, 
    message: string, 
    senderName: string, 
    sender: string
  ): Promise<{ success: boolean; messageId?: string; error?: string }> {
    if (!this.isConnected) {
      return { success: false, error: 'ICP service not connected' };
    }
    if (!this.actor) {
      return { success: false, error: 'ICP service not connected' };
    }

    try {
      const result = await this.actor.sendMessage(escrowId, message, senderName, sender);
      return {
        success: result.success,
        messageId: result.messageId,
        error: result.error
      };
    } catch (error) {
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown error' 
      };
    }
  }

  public async getMessages(
    escrowId: string, 
    caller: string,
    limit?: number
  ): Promise<{ success: boolean; messages?: ProcessedChatMessage[]; error?: string }> {
    if (!this.isConnected) {
      return { success: false, error: 'ICP service not connected' };
    }
    if (!this.actor) {
      return { success: false, error: 'ICP service not connected' };
    }

    try {
      const messages = await this.actor.getMessages(escrowId, limit ? [limit] : [], caller);
      return {
        success: true,
        messages: messages.map((msg: ChatMessage) => ({
          id: msg.id,
          sender: msg.senderPrincipalId.toString(),
          senderName: msg.senderName,
          name: msg.senderName,
          message: msg.message,
          timestamp: new Date(Number(msg.senderAt) / 1000000), // Convert nanoseconds to milliseconds
          escrowId: msg.chatId
        }))
      };
    } catch (error) {
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown error' 
      };
    }
  }

  public async getMessageCount(escrowId: string): Promise<{ success: boolean; count?: number; error?: string }> {
    if (!this.isConnected) {
      return { success: false, error: 'ICP service not connected' };
    }
    if (!this.actor) {
      return { success: false, error: 'ICP service not connected' };
    }

    try {
      const count = await this.actor.getMessageCount(escrowId);
      return { success: true, count: Number(count) };
    } catch (error) {
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown error' 
      };
    }
  }

  public async searchMessages(
    escrowId: string, 
    searchQuery: string
  ): Promise<{ success: boolean; messages?: ProcessedChatMessage[]; error?: string }> {
    if (!this.isConnected) {
      return { success: false, error: 'ICP service not connected' };
    }
    if (!this.actor) {
      return { success: false, error: 'ICP service not connected' };
    }

    try {
      const messages = await this.actor.searchMessages(escrowId, searchQuery);
      return {
        success: true,
        messages: messages.map((msg: ChatMessage) => ({
          id: msg.id,
          sender: msg.senderPrincipalId.toString(),
          senderName: msg.senderName,
          name: msg.senderName,
          message: msg.message,
          timestamp: new Date(Number(msg.senderAt) / 1000000),
          escrowId: msg.chatId
        }))
      };
    } catch (error) {
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown error' 
      };
    }
  }

  public isServiceConnected(): boolean {
    return this.isConnected;
  }

  public reconnect(): void {
    this.initializeActor();
  }
}

export const icpChatService = ICPChatService.getInstance();
