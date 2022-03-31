import Button from '@mui/material/Button';
import TextField from '@mui/material/TextField';
import Box from '@mui/material/Box';
import { CircularProgress, Typography } from '@mui/material';
import { useAsync } from '../utility/useAsync';

// eslint-disable-next-line no-process-env
const karmanIdentityApi = process.env.NEXT_PUBLIC_KARMAN_IDENTITY_API;

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

function Session() {
  const [isLoading, data] = useAsync(async () => {
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

  if (data && data.code !== 'UNAUTHORIZED') {
    return (
      <Typography variant='body2' align='center'>
        Welcome:
        {' '}
        <strong>
          {JSON.stringify(data)}
        </strong>
        <br/>
        You are already logged in. You can only logout.
      </Typography>
    );
  }

  return <Form />;
}

function Form() {
  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    const username = formData.get('username');
    const password = formData.get('password');
    fetch(`${karmanIdentityApi}/sessions`, {
      method: 'POST',
      headers: {
        Authorization: `Basic ${btoa(`${username}:${password}`)}`,
      },
    })
      .then(res => res.json())
      .then(console.info);
  };
  const error = undefined as { message: string } | undefined;
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
