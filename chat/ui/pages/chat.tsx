import React, { useState } from 'react';
import Box from '@mui/material/Box';
import { CircularProgress, Typography, Button, Divider, Chip, Avatar, List, ListItem, TextField } from '@mui/material';
import { useAsync } from '../utility/useAsync';
import { User } from './index';

const karmanChatApi = process.env.NEXT_PUBLIC_KARMAN_CHAT_API;

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
  const [isLoading, messageResponse] = useAsync<MessageResponse>(async () => {
    return fetch(`${karmanChatApi}/messages?pageNumber=0&pageSize=10`, { credentials: 'include' }).then((res) => {
      return res.json();
    });
  }, []);
  const [isSending, setIsSending] = useState(false);
  const [message, setMessage] = useState('');

  const sendMessage = () => {
    setIsSending(true);
    fetch(`${karmanChatApi}/messages`, {
      method: 'POST',
      credentials: 'include',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ content: message }),
    }).then((res) => {
      return res.json();
    }).then((message: Message) => {
      setMessage('');
      if (messageResponse !== undefined) {
        messageResponse.messages.unshift(message);
      }
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
    <TextField
      label='Message'
      variant='filled'
      margin='normal'
      fullWidth
      value={message}
      onChange={(e) => setMessage(e.target.value)}
      InputProps={{ endAdornment: <Button disabled={isSending} onClick={sendMessage}>Send</Button> }}/>
    <Divider />
    <List>
      {messageResponse.messages.map(message => <MessageItem key={message.id} message={message} user={props.user} />)}
    </List>
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
      .then(() => {
        setIsDeleted(true);
      })
      .finally(() => {
        setIsDeleting(false);
      });
  };

  if (isDeleted) {
    return <></>;
  }

  const isAdmin = user.scopes.includes('admin');
  return <ListItem>
    <Chip
      avatar={<Avatar>
        {message.sender.slice(0, 2).toUpperCase()}
      </Avatar>}
      label={isDeleting ? 'Deleting...' : message.content}
      color={message.sender === user.username ? 'primary' : undefined}
      onDelete={(isAdmin && !isDeleting) ? tryDelete : undefined}
    />
  </ListItem>;
}

