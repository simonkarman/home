import { useRouter } from 'next/router';
import React from 'react';
import Box from '@mui/material/Box';
import { CircularProgress, Typography, Button } from '@mui/material';
import { useAsync } from '../utility/useAsync';

const domain = process.env.NEXT_PUBLIC_DOMAIN;
const karmanIdentityApi = process.env.NEXT_PUBLIC_KARMAN_IDENTITY_API;
const karmanChatApi = process.env.NEXT_PUBLIC_KARMAN_CHAT_API;

export default function Health() {
  const [isLoading, data, error] = useAsync(async () => {
    return fetch(`${karmanIdentityApi}/health`).then((res) => {
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
        is currently offline.
      </Typography>
    );
  }

  return <Session />;
}

interface User {
  username: string;
  scopes: string[];
}
interface SessionSuccessResponse {
  iss: string;
  user: User;
}
interface SessionFailureResponse {
  code: string;
  message: string;
}
type SessionResponse = SessionSuccessResponse | SessionFailureResponse;

function Session() {
  const router = useRouter();
  const [isLoading, session] = useAsync<SessionResponse>(async () => {
    return fetch(`${karmanIdentityApi}/sessions`).then((res) => {
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

  if (session && !('code' in session)) {
    return <Landing user={session.user} />;
  }

  return (<>
    <Typography variant='body2' align='center' sx={{ mt: 5, mb: 3 }}>
      You&apos;re not logged in.
      {' '}
      {session?.message ?? ''}
    </Typography>
    {/* eslint-disable-next-line no-process-env */}
    <Button onClick={() => router.push(`${karmanIdentityApi}?t=${domain}`)}>
      Click here to log in.
    </Button>
  </>);
}

function Landing(props: { user: User }) {
  return (<>
    <Typography variant='body2' align='center' sx={{ mt: 5, mb: 3 }}>
      Welcome:
      {' '}
      <strong>
        {props.user.username}
      </strong>
      <br/>
      In the future, your chat messages will be shown below.
    </Typography>
  </>);
}
