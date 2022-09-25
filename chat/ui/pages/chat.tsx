import React, { useEffect, useRef, useState } from 'react';
import Box from '@mui/material/Box';
import { CircularProgress, Typography, Button, Divider, Chip, Avatar, List, ListItem, TextField } from '@mui/material';
import useWebSocket, { ReadyState } from 'react-use-websocket';
import { useAsync } from '../utility/useAsync';
import { User } from './index';

const karmanChatApi = process.env.NEXT_PUBLIC_KARMAN_CHAT_API;
const karmanChatStream = process.env.NEXT_PUBLIC_KARMAN_CHAT_STREAM;

interface ChatProps {
  user: User;
}

export default function Chat(props: ChatProps) {
  const [isLoading, data, error] = useAsync(async () => {
    return fetch(`${karmanChatApi}/health`, { credentials: 'include' }).then((res) => {
      return res.json();
    });
  }, []);

  if (isLoading) {
    return (
      <Box sx={{ mt: 10 }}>
        <CircularProgress/>
      </Box>
    );
  }

  if (error || data.api !== 'OK') {
    return (
      <Typography variant='body2' align='center' color='red'>
        Chat is currently offline.
      </Typography>
    );
  }

  return <Messages user={props.user} />;
}

interface Message {
  id: string;
  datetime: string;
  sender: string;
  content: string;
}

interface MessageResponse {
  total: number;
  messages: Message[];
}

interface MessagesProps {
  user: User;
}

function Messages(props: MessagesProps) {
  const [isLoading, messageResponse,, { setResult }] = useAsync<MessageResponse>(async () => {
    return fetch(`${karmanChatApi}/messages?pageNumber=0&pageSize=10`, { credentials: 'include' }).then((res) => {
      return res.json();
    });
  }, []);
  const [isSending, setIsSending] = useState(false);
  const [message, setMessage] = useState('');
  const { lastJsonMessage: wsMessage, readyState } = useWebSocket(`${karmanChatStream}/messages`);
  useEffect(() => {
    if (wsMessage === null || wsMessage.action === undefined) {
      return;
    }
    const mr = (messageResponse === undefined)
      ? { total: 0, messages: [] }
      : { total: messageResponse.total, messages: messageResponse.messages.slice(0, messageResponse.messages.length) };
    if (wsMessage.action === 'delete') {
      let mrIndex = mr.messages.findIndex(m => m.id === wsMessage.data);
      if (mrIndex !== -1) {
        mr.messages = mr.messages.filter(m => m.id !== wsMessage.data);
        setResult(mr);
      }
    } else if (wsMessage.action === 'create') {
      if (mr.messages.findIndex(m => m.id === wsMessage.data.id) === -1) {
        mr.messages.unshift(wsMessage.data);
        setResult(mr);
      }
    }
  }, [wsMessage, messageResponse]);

  const sendMessage = () => {
    setIsSending(true);
    fetch(`${karmanChatApi}/messages`, {
      method: 'POST',
      credentials: 'include',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ content: message }),
    }).then((res) => {
      if (!res.ok) { throw res; }
      return res.json();
    }).then((message: Message) => {
      setMessage('');
      if (messageResponse !== undefined) {
        messageResponse.messages.unshift(message);
      }
      setResult(messageResponse);
    }).finally(() => {
      setIsSending(false);
    });
  };

  if (isLoading || messageResponse === undefined) {
    return (
      <Box sx={{ mt: 10 }}>
        <CircularProgress/>
      </Box>
    );
  }

  return <Box paddingTop={3}>
    <Divider />
    <List style={{
      maxHeight: '50vh',
      overflow: 'auto',
      display: 'flex',
      flexDirection: 'column-reverse',
    }}>
      {messageResponse.messages.map(message => <MessageItem key={message.id} message={message} user={props.user} />)}
    </List>
    <Divider />
    <TextField
      label='Message'
      variant='filled'
      margin='normal'
      fullWidth
      value={message}
      onChange={(e) => setMessage(e.target.value)}
      InputProps={{ endAdornment: <Button disabled={isSending} onClick={sendMessage}>Send</Button> }}/>
    <Typography variant='body2' align='center' sx={{ mt: 2, mb: 2 }}>
      Realtime:
      {' '}
      <b>
        {{
          [ReadyState.CONNECTING]: 'Connecting',
          [ReadyState.OPEN]: 'Available',
          [ReadyState.CLOSING]: 'Stopping',
          [ReadyState.CLOSED]: 'Stopped',
          [ReadyState.UNINSTANTIATED]: 'Not Available',
        }[readyState]}
      </b>
    </Typography>
    <Divider />
  </Box>;
}

interface MessageItemProps {
  user: User;
  message: Message;
}

function MessageItem(props: MessageItemProps) {
  const { message, user } = props;
  const [isDeleting, setIsDeleting] = useState(false);
  const [isDeleted, setIsDeleted] = useState(false);
  const tryDelete = () => {
    setIsDeleting(true);
    fetch(`${karmanChatApi}/messages/${message.id}`, { method: 'DELETE', credentials: 'include' })
      .then((res) => {
        if (!res.ok) { throw res; }
        setIsDeleted(true);
      })
      .finally(() => {
        setIsDeleting(false);
      });
  };

  if (isDeleted) {
    return <></>;
  }

  const isSelf = message.sender === user.username;
  const canDelete = isSelf || user.scopes.includes('admin');
  return <ListItem style={{ justifyContent: isSelf ? 'flex-end' : 'flex-start' }}>
    <Chip
      avatar={<Avatar>
        {message.sender.slice(0, 2).toUpperCase()}
      </Avatar>}
      label={isDeleting ? 'Deleting...' : message.content}
      color={isSelf ? 'primary' : undefined}
      onDelete={(canDelete && !isDeleting) ? tryDelete : undefined}
    />
  </ListItem>;
}

