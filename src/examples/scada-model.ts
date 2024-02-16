
export interface SCADAData {
  name: string
}

export interface Alarm {
  alarm: boolean
  color: string
  priority: number
}

//export interface TelemetryFlags {
//  manual: boolean
//  frozen: boolean
//  warning: boolean
//  lockout: boolean
//  safety: boolean
//}

export interface SCADATelemtry extends SCADAData {
  timestamp?: Date
  value?: number | string
  alarm?: Alarm
  failure?: string
}
export interface AnalogTelemetry extends SCADATelemtry {
  units: string
}


export interface DigitalTelemetry extends SCADATelemtry {
}

export interface StringTelemetry extends SCADATelemtry {
}

export type ApplicationType = 'gasmeter' | 'liquidmeter' | 'gaslift' | 'plungerlift' | 'compressor' | 'esd'

export type ProtocolType = 'modbus' | 'mqtt' | 'opcua' | 'contrologix' | 'totalflow'

export interface Application extends SCADAData {
  type: ApplicationType
  analogs?: Array<AnalogTelemetry>
  digitals?: Array<DigitalTelemetry>
  strings?: Array<StringTelemetry>
}
export interface CommunicationDevice extends SCADAData {
  address: string
  status: CommunicationStatus
  failure?: string
  alarm?: Alarm
  protocol: ProtocolType
  applications: Array<Application>
}

export type CommunicationStatus = 'normal' | 'failed'

export interface CommunicationNetwork extends SCADAData {
  status: CommunicationStatus
  failure?: string
  alarm?: Alarm
  devices: Array<CommunicationDevice>
}

export interface SCADASystem extends SCADAData {
  networks: Array<CommunicationNetwork>
}
