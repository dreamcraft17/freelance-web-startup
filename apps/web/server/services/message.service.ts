import type { AuthActor } from "../domain/auth-actor";
import type { CreateMessageThreadDto, PostMessageDto } from "@acme/validators";

export class MessageService {
  async listThreadsForActor(_actor: AuthActor) {
    return { items: [] as const };
  }

  async createThread(actor: AuthActor, input: CreateMessageThreadDto) {
    return { threadId: "pending", createdBy: actor.userId, ...input };
  }

  async listMessagesForActor(_actor: AuthActor, threadId: string) {
    return { threadId, items: [] as const };
  }

  async postMessage(actor: AuthActor, threadId: string, input: PostMessageDto) {
    return { threadId, senderId: actor.userId, ...input };
  }
}
