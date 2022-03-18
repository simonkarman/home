import fetch from 'node-fetch';const https = require('https');
import { networkInterfaces } from 'os';

const httpsAgent = new https.Agent({
  rejectUnauthorized: false,
});

interface NatObject {
  Enable: boolean,
  Protocol: string,
  Description: string,
  Interface: string,
  ExternalPortStart: number,
  ExternalPortEnd: number,
  InternalPortStart: number,
  InternalPortEnd: number,
  InternalClient: string,
  SetOriginatingIP: number,
  OriginatingIpAddress: string,
  Index: number,
  X_ZYXEL_AutoDetectWanStatus: boolean,
};
const natObjToString = (natObj: NatObject) => `[${natObj.Index}] ${natObj.ExternalPortStart} ${natObj.Description}`;

export const portForwarding = async (zyxelCredentials: string, enable: boolean) => {
  const nets = networkInterfaces();
  const localIP: string[] = [];
  for (const name of Object.keys(nets)) {
    for (const net of nets[name]!) {
    // Skip over non-IPv4 and internal (i.e. 127.0.0.1) addresses
      if (net.family === 'IPv4' && !net.internal) {
        localIP.push(net.address);
      }
    }
  }
  console.info('Local IP:', localIP);

  const [username, password] = zyxelCredentials.split(':', 2);
  const baseUrl = 'https://192.168.1.1';

  const basicInformation = await fetch(`${baseUrl}/getBasicInformation`, {
    agent: httpsAgent,
    'method': 'GET',
  }).then(response => response.json());
  if (basicInformation.result != 'ZCFG_SUCCESS') {
    console.error('[ERROR] Cannot get basic information of router.', basicInformation);
    return;
  }
  console.info('Found router:', basicInformation.ModelName);

  const loginPostData = JSON.stringify({
    Input_Account: username,
    Input_Passwd: Buffer.from(password).toString('base64'),
    currLang: 'en',
    RememberPassword: 0,
    SHA512_password: false,
  });
  const loginResponse = await fetch(`${baseUrl}/UserLogin`, {
    agent: httpsAgent,
    body: loginPostData,
    method: 'POST',
  }).then(async response => ({
    body: await response.json(),
    sessionToken: response.headers.get('set-cookie')!,
  }));
  if (loginResponse.body.result != 'ZCFG_SUCCESS') {
    console.error('[ERROR] Cannot login.', loginResponse.body);
    return;
  }
  const token = loginResponse.sessionToken.split(' ')[0].substring('Session='.length).split(';')[0];
  let sessionKey = loginResponse.body.sessionkey;

  const loginCheck = await fetch(`${baseUrl}/cgi-bin/UserLoginCheck`, {
    agent: httpsAgent,
    headers: {
      cookie: `Session=${token}`,
    },
  }).then(res => res.json());
  if (loginCheck.result !== 'ZCFG_SUCCESS') {
    console.error('Logging in failed...', loginCheck);
    return;
  }
  console.info('Successfully logged in as', username);

  try {
    const natResponse = await fetch('https://192.168.1.1/cgi-bin/DAL?oid=nat', {
      agent: httpsAgent,
      headers: {
        cookie: `Session=${token}`,
      },
    }).then(res => res.json());
    if (natResponse.result !== 'ZCFG_SUCCESS') {
      console.error('Could not get NAT information...', natResponse);
      return;
    }
    const natObjects: NatObject[] =
      natResponse.Object.filter((natObj: NatObject) => natObj.ExternalPortStart === 80 || natObj.ExternalPortStart === 443);
    if (natObjects.length !== 2) {
      console.error('ERROR! NAT for port 80 and/or 443 not found. Please add them manually...', natResponse.Object.map(natObjToString));
      return;
    }
    console.info('Found port 80 and 443 in NAT:', natObjects.map(natObjToString));
    for (const natObject of natObjects) {
      const response = await fetch(`${baseUrl}/cgi-bin/DAL?oid=nat&sessionkey=${sessionKey}`, {
        method: 'PUT',
        agent: httpsAgent,
        headers: {
          cookie: `Session=${token}`,
        },
        body: JSON.stringify({ ...natObject, Enable: enable, InternalClient: localIP[0] }),
      }).then(res => res.json());
      if (response.result !== 'ZCFG_SUCCESS') {
        console.error('Could not update', natObjToString(natObject), response);
        return;
      }
      console.info('Updating...', natObjToString(natObject), response.result);
      sessionKey = response.sessionkey;
    }

  } finally {
    const logoutResponse = await fetch(`${baseUrl}/cgi-bin/UserLogout?sessionkey=${sessionKey}`, {
      agent: httpsAgent,
      method: 'post',
      headers: {
        cookie: `Session=${token}`,
      },
    }).then(res => res.json());
    if (logoutResponse.result !== 'ZCFG_SUCCESS') {
      console.error(`Failed to logout (${token} ${sessionKey}):`, logoutResponse);
      return;
    }
    console.info('Successfully logged out.');
  }
};
