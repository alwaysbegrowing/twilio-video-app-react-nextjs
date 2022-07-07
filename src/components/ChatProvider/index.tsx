import React, { createContext, useCallback, useEffect, useRef, useState } from 'react'
import { Conversation, Client, Message } from '@twilio/conversations'
import useVideoContext from '../../hooks/useVideoContext/useVideoContext'

type ChatContextType = {
  isChatWindowOpen: boolean
  setIsChatWindowOpen: (isChatWindowOpen: boolean) => void
  connect: (token: string) => void
  hasUnreadMessages: boolean
  messages: Message[]
  conversation: Conversation | null
}

export const ChatContext = createContext<ChatContextType>(null!)

export const ChatProvider = ({ children }: { children: React.ReactNode }) => {
  const { room, onError } = useVideoContext()
  const isChatWindowOpenRef = useRef(false)
  const [isChatWindowOpen, setIsChatWindowOpen] = useState(false)
  const [conversation, setConversation] = useState<Conversation | null>(null)
  const [messages, setMessages] = useState<Message[]>([])
  const [hasUnreadMessages, setHasUnreadMessages] = useState(false)
  const [chatClient, setChatClient] = useState<Client>()

  const connect = useCallback(
    (token: string) => {
      Client.create(token)
        .then(client => {
          //@ts-ignore
          window.chatClient = client
          setChatClient(client)
        })
        .catch(e => {
          console.error(e)
          onError(new Error("There was a problem connecting to Twilio's conversation service."))
        })
    },
    [onError]
  )

  useEffect(() => {
    if (conversation) {
      const handleMessageAdded = (message: Message) =>
        setMessages(oldMessages => [...oldMessages, message])
      conversation.getMessages().then(newMessages => setMessages(newMessages.items))
      conversation.on('messageAdded', handleMessageAdded)
      return () => {
        conversation.off('messageAdded', handleMessageAdded)
      }
    }
  }, [conversation])

  useEffect(() => {
    // If the chat window is closed and there are new messages, set hasUnreadMessages to true
    if (!isChatWindowOpenRef.current && messages.length) {
      setHasUnreadMessages(true)
    }
  }, [messages])

  useEffect(() => {
    isChatWindowOpenRef.current = isChatWindowOpen
    if (isChatWindowOpen) setHasUnreadMessages(false)
  }, [isChatWindowOpen])

  useEffect(() => {
    if (room && chatClient) {
      chatClient
        .getConversationByUniqueName(room.sid)
        .then(newConversation => {
          //@ts-ignore
          window.chatConversation = newConversation
          setConversation(newConversation)
        })
        .catch(e => {
          console.error(e)
          onError(
            new Error('There was a problem getting the Conversation associated with this room.')
          )
        })
    }
  }, [room, chatClient, onError])

  return (
    <ChatContext.Provider
      value={{
        isChatWindowOpen,
        setIsChatWindowOpen,
        connect,
        hasUnreadMessages,
        messages,
        conversation,
      }}
    >
      {children}
    </ChatContext.Provider>
  )
}
