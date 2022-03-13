import axios from 'axios';
import { getEnvVar } from './environment';

interface Record { id: string, name: string, type: string, content: string }

export const dns = async (): Promise<void> => {
  const neostradaApiKey = getEnvVar('NEOSTRADA_API_KEY');
  const domainName = 'karman.dev';
  const assignedRecords = ['home', 'identity', 'elemental-arena'];

  const externalIp = await axios.get('https://ipv4.icanhazip.com/').then(response => {
    return response.data.trim();
  });
  console.info('External IP:', externalIp);

  const baseUrl = 'https://api.neostrada.com/api';
  const domainInformation = await axios.get(`${baseUrl}/domains`, {
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${neostradaApiKey}`,
    },
  }).then(response =>{
    const domains: { description: string, dns_id: number }[] = response.data.results;
    return domains.find(domain => domain.description === domainName);
  });
  if (domainInformation === undefined) {
    console.error(`Domain ${domainName} could not be found under your api key.`);
    return;
  }
  console.info(`DNS id of ${domainName}: ${domainInformation.dns_id}`);

  console.info('Checking:', assignedRecords);
  const [dnsRecords, toCreate] = await axios.get(`${baseUrl}/dns/${domainInformation?.dns_id}`, {
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${neostradaApiKey}`,
    },
  }).then((response): [Record[], string[]] => {
    const records: Record[] = response.data.results;
    const aRecords = records.filter(record => record.type === 'A');
    const aRecordsThatNeedUpdate = aRecords.filter(record =>
      record.content !== externalIp &&
      assignedRecords.includes(record.name.replace(`.${domainName}`, '')),
    );
    const allARecords = aRecords.map(aRecord => aRecord.name.replace(`.${domainName}`, ''));
    const aRecordsToCreate = assignedRecords.filter(ar => !allARecords.includes(ar));
    return [aRecordsThatNeedUpdate, aRecordsToCreate];
  });
  console.info('List of records to create:', toCreate);
  console.info('List of records to update:', dnsRecords.map(record => `${record.name} (now ${record.content})`));

  const created = await Promise.all(toCreate.map(async record => {
    const response = await axios(`${baseUrl}/dns/add/${domainInformation.dns_id}`, {
      validateStatus: () => true,
      method: 'post',
      data: `name=${record}.${domainName}&content=${externalIp}&type=A&prio=0&ttl=3600`,
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/x-www-form-urlencoded',
        Authorization: `Bearer ${neostradaApiKey}`,
      },
    });
    if (response.data.results !== undefined) {
      const updatedRecord = response.data.results.find(
        (otherRecord: Record) => otherRecord.name === `${record}.${domainName}`,
      );
      return `${record} -> ${updatedRecord.content}`;
    } else {
      return `${record} --FAILED--> ${JSON.stringify(response.data)}`;
    }
  }));
  if (created.length > 0) {
    console.info('Created', created);
  }

  const updated = await Promise.all(dnsRecords.map(async record => {
    const response = await axios(`${baseUrl}/dns/edit/${domainInformation.dns_id}`, {
      validateStatus: () => true,
      method: 'patch',
      data: `record_id=${record.id}&content=${externalIp}`,
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/x-www-form-urlencoded',
        Authorization: `Bearer ${neostradaApiKey}`,
      },
    });
    if (response.data.results !== undefined) {
      const updatedRecord = response.data.results.find(
        (otherRecord: Record) => otherRecord.id === record.id,
      );
      return `${record.name} -> ${updatedRecord.content}`;
    } else {
      return `${record.name} --FAILED--> ${JSON.stringify(response.data)}`;
    }
  }));
  if (updated.length > 0) {
    console.info('Updated', updated);
  }
};
