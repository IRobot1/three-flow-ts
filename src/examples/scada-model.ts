
export interface Alarm {
  alarm: boolean
  color: string
  priority: number
}

export interface TelemetryFlags {
  manual: boolean
  frozen: boolean
  warning: boolean
  lockout: boolean  
  safety: boolean
}

export interface AnalogTelemetry {
  name: string
  timestamp: Date
  value: number
  units: string
  alarm: Alarm
  zone: SecurityZone
}


export interface DigitalTelemetry {
  name: string
  timestamp: Date
  state: string
  color: string
  alarm: Alarm
  zone: SecurityZone
}

export interface StringTelemetry {
  name: string
  timestamp: Date
  value: string
  alarm: Alarm
  zone: SecurityZone
}

export type ApplicationType = 'gasmeter' | 'liquidmeter' | 'gaslift' | 'plungerlift' | 'compressor' | 'safety'

export type ProtocolType = 'modbus' | 'mqtt' | 'opcua' | 'contrologix' | 'totalflow'

export interface Application {
  name: string
  type: string
  analogs: Array<AnalogTelemetry>
  digitals: Array<DigitalTelemetry>
  strings: Array<StringTelemetry>
  zone: SecurityZone
}
export interface CommunicationDevice {
  name: string
  address: string
  status: CommunicationStatus
  failure?: string
  alarm: Alarm
  protocol: ProtocolType
  applications: Array<Application>
  zone: SecurityZone
}

export type CommunicationStatus = 'normal' | 'failed'

export interface CommunicationNetwork {
  name: string
  status: CommunicationStatus
  failure?: string
  alarm: Alarm
  devices: Array<CommunicationDevice>
  zone: SecurityZone
}

type LocationType = 'office' | 'travelling' | 'atsite'
type SiteType = 'gaswell' | 'oilwell' | 'solarfarm' | 'windfarm'

export interface SiteLocation {
  name: string
  type: SiteType
  zone: SecurityZone
}

export interface Operator {
  name: string
  email: string
  phone: string
  location: LocationType
  site?: SiteLocation
  zone: SecurityZone
}


export interface SecurityZone {
  name: string
}
export interface SecurityGroup {
  name: string
  zones: Array<SecurityZone>
}

export type HostType = 'onpremise' | 'azure' | 'google' | 'aws'
export type ResourceType = 'server' | 'blade' | 'vm' | 'container'
export type ResourcePurpose = 'primary' | 'standby' | 'warmstandby' | 'coldstandby' | 'engineering' | 'research' | 'operator' | 'lab'

export interface SystemProcess {
  name: string
  endpoint: string
  memory: string
  cpu: string
  started: Date
  alarm: Alarm
}

export interface SystemResource {
  name: string
  type: ResourceType
  state: ResourcePurpose
  ip: string
  timestamp: Date
  alarm: Alarm
}

export interface SCADASystem {
  name: string
  host: HostType
  securitygroups: Array<SecurityGroup>
  operators: Array<Operator>
  networks: Array<CommunicationNetwork>
  resources: Array<SystemResource>

}
