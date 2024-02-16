import { Application, CommunicationDevice, CommunicationNetwork, SCADASystem, } from "./scada-model";

const gasmeterapp: Application = {
  name: 'Gas Meter',
  analogs: [
    { name: 'Static Pressure', units: 'psia' },
    { name: 'Diff Pressure', units: 'psia' },
    { name: 'Flow Rate', units: 'MCF/D' },
    { name: 'Temperature', units: 'degF' },
    //{ name: 'Current Day Runtime', units: 'hr' },
    //{ name: 'Current Day Volume', units: 'MCF' },
    //{ name: 'Previous Day Runtime', units: 'hr' },
    //{ name: 'Previous Day Volume', units: 'MCF' },
    //{ name: 'Accumulated Volume', units: 'MCF' },
  ],
  type: 'gasmeter'
}

const gasliftapp: Application = {
  name: 'Gas Lift',
  analogs: [
    { name: 'Injection Valve Position', units: '%' },
    { name: 'Injection Flow Rate', units: 'MCF/D' },
    { name: 'Production Flow Rate', units: 'MCF/D' },
    { name: 'Tubing Pressure', units: 'psia' },
    {
      name: 'Casing Pressure', units: 'psia',
      alarm: { alarm: true, color: 'orange', priority: 2 },
      failure: 'Invalid address'
 },
  ],
  digitals: [
    { name: 'Gas Lift State' },
    { name: 'Gas Lift Mode' },
  ],
  type: 'gaslift'
}

const esdapp: Application = {
  name: 'Emergency Shutdown',
  digitals: [
    { name: 'Shutdown Command' },
    { name: 'Reset Command' },
  ],
  strings: [
    { name:'Shutdown ESD Status'},
    { name:'Shutdown Last Event'},
  ],
  type: 'esd'
}

const site1apps: Array<Application> = [
  gasmeterapp, gasliftapp, esdapp
]

const site1device: Array<CommunicationDevice> = [
  {
    name: 'Site RTU', address: '1', status: 'normal', 
    protocol: 'modbus', applications: site1apps, 
  },
]

const networks: Array<CommunicationNetwork> = [
  {
    name: 'Primary Network', status: 'normal', 
    devices: site1device,
    alarm: { alarm: true, color: 'gold', priority: 3 },
    failure: 'Communication error'
  },
]

export const AcmeGas: SCADASystem = {
  name: 'Acme Gas',
  networks,
}
