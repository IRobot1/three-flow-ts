import { Application, CommunicationDevice, CommunicationNetwork, Operator, SCADASystem, SecurityGroup, SecurityZone, SystemResource } from "./scada-model";

const gaszone: SecurityZone = { name: 'Gas' }
const oilzone: SecurityZone = { name: 'Oil' }
const waterzone: SecurityZone = { name: 'Water' }

const south: Array<SecurityZone> = [{ name: 'Texas' },{ name: 'New Mexico' }]
const north: Array<SecurityZone> = [{ name: 'Colorado' },{ name: 'North Dakota' }]

const securitygroups: Array<SecurityGroup> = [
  { name: 'South', zones: south },
  { name: 'North', zones: north },
]

const roadrunnerapps: Array<Application> = []
const waterapps: Array<Application> = []
const foodapps: Array<Application> = []

const TexasDevices: Array<CommunicationDevice> = [
  {
    name: 'Road Runner', address: '', status: 'normal', alarm: { alarm: false, color: 'green', priority: 4 },
    protocol: 'modbus', applications: roadrunnerapps, zone: gaszone,
  },
]

const networks: Array<CommunicationNetwork> = [
  {
    name: 'Texas Network', status: 'normal', alarm: { alarm: false, color: 'green', priority: 9 },
    devices: TexasDevices, zone: gaszone
  },
]

const operators: Array<Operator> = [
  { name: 'Bill H.', zone: gaszone, email: 'billh@acmegas.com', location: 'office', phone: '555-444-1234' },
]

const resources: Array<SystemResource> = [
  {
    name: 'Main Server', ip: '10.0.0.1', state: 'primary',
    alarm: { alarm: false, color: 'red', priority: 1 },
    timestamp: new Date(), type:'server'
  }
]

export const AcmeGas: SCADASystem = {
  name: 'Acme Gas',
  host: 'onpremise',
  securitygroups,
  networks,
  operators,
  resources,
}
