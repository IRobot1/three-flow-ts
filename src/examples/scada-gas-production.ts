import { Application, CommunicationDevice, CommunicationNetwork, SCADASystem, } from "./scada-model";



const roadrunnerapps: Array<Application> = []
const waterapps: Array<Application> = []
const foodapps: Array<Application> = []

const gasmeterdevice: Array<CommunicationDevice> = [
  {
    name: 'Gas Meter', address: '1', status: 'normal', 
    protocol: 'modbus', applications: roadrunnerapps, 
  },
]

const networks: Array<CommunicationNetwork> = [
  {
    name: 'Primary Network', status: 'normal', 
    devices: gasmeterdevice, 
  },
]

export const AcmeGas: SCADASystem = {
  name: 'Acme Gas',
  networks,
}
