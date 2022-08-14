import { useRouter } from 'next/router';
import React, { useContext, useState } from 'react';
import TextField from '@mui/material/TextField';
import Box from '@mui/material/Box';
import { CircularProgress, Typography, Button } from '@mui/material';
import { useAsync } from '../utility/useAsync';

// eslint-disable-next-line no-process-env
const karmanIdentityApi = process.env.NEXT_PUBLIC_KARMAN_IDENTITY_API;
const SessionContext = React.createContext<{
  value: number,
  setValue: (value: number) => void,
    }>({
      value: 0,
      setValue: () => {
      },
    });

export default function Health() {
  const [value, setValue] = useState<number>(0);
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

  return <SessionContext.Provider value={{ value, setValue }}>
    <Session />
  </SessionContext.Provider>;
}

function Session() {
  const session = useContext(SessionContext);
  const [isLoading, data] = useAsync(async () => {
    return fetch(`${karmanIdentityApi}/sessions`).then((res) => {
      return res.json();
    });
  }, [session.value]);

  if (isLoading) {
    return (
      <Box sx={{ mt: 10 }}>
        <CircularProgress/>
      </Box>
    );
  }

  if (data && data.code !== 'UNAUTHORIZED') {
    return (<>
      <Typography variant='body2' align='center' sx={{ mt: 5, mb: 3 }}>
        Welcome:
        {' '}
        <strong>
          {data.user.username}
        </strong>
        <br/>
        You are already logged in.
      </Typography>

      <Button
        variant='contained'
        fullWidth
        onClick={() => {
          fetch(`${karmanIdentityApi}/sessions`, { method: 'DELETE' })
            .then(() => session.setValue(session.value + 1))
            .catch(() => session.setValue(session.value + 1));
        }}
      >
        logout
      </Button>
    </>);
  }
  return <Login />;
}

function Login() {
  const session = useContext(SessionContext);
  const router = useRouter();
  const redirectTo = router.query?.t;
  const [error, setError] = useState<{ message: string } | undefined>(undefined);
  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    const username = formData.get('username');
    const password = formData.get('password');
    fetch(`${karmanIdentityApi}/sessions`, {
      method: 'POST',
      headers: {
        Authorization: `Basic ${new Buffer(`${username}:${password}`).toString('base64')}`,
      },
    })
      .then(res => res.json())
      .then(res => {
        if (res.iss !== undefined) {
          session.setValue(session.value + 1);
          if (redirectTo) {
            let url: URL | undefined;
            if (typeof redirectTo === 'string') {
              url = new URL(redirectTo);
            } else {
              url = new URL(redirectTo[0]);
            }
            if (url.hostname.endsWith('karman.dev')) {
              return router.push(url);
            }
          }
        } else {
          setError(res.body);
        }
      })
      .catch(err => setError(err));
  };
  return (
    <Box component='form' onSubmit={handleSubmit} noValidate sx={{ mt: 1 }}>
      <TextField
        margin='normal'
        required
        fullWidth
        id='username'
        label='Username'
        name='username'
        autoComplete='username'
        autoFocus
      />
      <TextField
        margin='normal'
        required
        fullWidth
        name='password'
        label='Password'
        type='password'
        id='password'
        autoComplete='current-password'
      />
      <Button
        type='submit'
        fullWidth
        variant='contained'
        sx={{ mt: 3, mb: 2 }}
      >
        Sign In
      </Button>
      {error &&
        <Typography variant='body2' color='red' align='center'>
          {error.message ? `${error.message} ` : ''}
          Oops! Something went wrong... Please try again later.
        </Typography>
      }
    </Box>
  );
}
