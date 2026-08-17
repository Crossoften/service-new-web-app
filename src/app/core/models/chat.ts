/** Contexto de negócio de um chat. */
export type ChatContextType =
  | 'Budget'
  | 'Work'
  | 'CommercialTransaction'
  | 'Rental'
  | 'TransportRequest'
  | 'Booking'
  | 'FoodOrder'
  | 'Job';

export interface ChatMessageSenderDto {
  id: number;
  name: string;
  fileUrl?: string;
}

export interface ChatMessageDto {
  id: number;
  message?: string;
  fileName?: string;
  fileUrl?: string;
  fileKey?: string;
  sender: ChatMessageSenderDto;
  createdAt: string;
  updatedAt: string;
}

export interface ChatOtherUserDto {
  id: number;
  name: string;
  fileUrl?: string;
}

/** Cabeçalho do chat (ResponseChatInfoDto). */
export interface ChatInfoDto {
  id: number;
  contextType: ChatContextType;
  referenceId: number;
  lastMessageAt?: string;
  otherUser?: ChatOtherUserDto;
  createdAt: string;
  updatedAt: string;
}

/** `GET /v1/chats/{id}/messages` (ResponseFindChatMessagesDto). */
export interface ResponseFindChatMessagesDto {
  chat: ChatInfoDto;
  messages: ChatMessageDto[];
  currentPage: number;
  totalPages: number;
  totalRecords: number;
}

/** Corpo de `POST /v1/chats/{id}/messages` (CreateChatMessageDto). */
export interface CreateChatMessageDto {
  message?: string;
  fileName?: string;
  fileUrl?: string;
  fileKey?: string;
}
