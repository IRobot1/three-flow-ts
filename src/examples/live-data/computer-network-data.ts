import { FlowEdgeParameters, FlowNodeParameters } from "three-flow";

export type ComputerStatus = 'online' | 'offline' | 'failure' | 'maintenance' | 'starting' | 'standby'

export interface ComputerParameters extends FlowNodeParameters {
  component_type: string;
  icon: string;
  status: ComputerStatus;
  cpu_usage?: number;
  memory_usage?: number;
  disk_usage?: number;
}

const internet: ComputerParameters = {
  id: "internet",
  icon:'cloud',
  component_type: "cloud",
  status:'online'
}

const router: ComputerParameters = {
  id: "router",
  icon:'router',
  component_type: "router",
  status: "online",
  cpu_usage: 48,
  memory_usage: 361,
}

const firewall1: ComputerParameters = {
  id: "firewall1",
  icon: 'list_alt',
  component_type: "firewall",
  status: "online",
  cpu_usage: 11,
  memory_usage: 513,
}


const switch1: ComputerParameters = {
  id: "switch1",
  icon:'developer_board',
  component_type: "switch",
  status: "online",
  cpu_usage: 1,
  memory_usage: 678,
}
const database: ComputerParameters = {
  id: "database",
  icon:'home_mini',
  component_type: "database",
  status: "starting",
  cpu_usage: 82,
  memory_usage: 3238,
  disk_usage: 2020
}
const appserver1: ComputerParameters = {
  id: "appserver1",
  icon:'dns',
  component_type: "appserver",
  status: "online",
  cpu_usage: 49,
  memory_usage: 3865,
  disk_usage: 1160
}
const appserver2: ComputerParameters = {
  id: "appserver2",
  icon: 'dns',
  component_type: "appserver",
  status: "standby",
  cpu_usage: 9,
  memory_usage: 1865,
  disk_usage: 870
}
const appserver3: ComputerParameters = {
  id: "appserver3",
  icon: 'dns',
  component_type: "appserver",
  status: "offline",
}

const firewall2: ComputerParameters = {
  id: "firewall2",
  icon: 'list_alt',
  component_type: "firewall",
  status: "online",
  cpu_usage: 35,
  memory_usage: 900,
}

const loadbalancer: ComputerParameters = {
  id: "loadbalancer",
  icon:'balance',
  component_type: "loadbalancer",
  status: "online",
  cpu_usage: 15,
  memory_usage: 333,
}

const webserver1: ComputerParameters = {
  id: "webserver1",
  icon:'https',
  component_type: "webserver",
  status: "online",
  cpu_usage: 45,
  memory_usage: 3551,
  disk_usage: 69
}

const webserver2: ComputerParameters = {
  id: "webserver2",
  icon: 'https',
  component_type: "webserver",
  status: "failure",
}

const webserver3: ComputerParameters = {
  id: "webserver3",
  icon: 'https',
  component_type: "webserver",
  status: "maintenance",
}



export const ComputerNetworkNodes: Array<ComputerParameters> = [
  internet,
  router,
  firewall1, switch1, database, appserver1, appserver2, appserver3,
  firewall2,loadbalancer, webserver1, webserver2, webserver3
]


export const ComputerNetworkEdges: Array<FlowEdgeParameters> = [
  { from: internet.id!, to: router.id! },
  { from: router.id!, to: firewall1.id! },
  { from: firewall1.id!, to: switch1.id! },
  { from: switch1.id!, to: database.id! },
  { from: switch1.id!, to: appserver1.id! },
  { from: switch1.id!, to: appserver2.id! },
  { from: switch1.id!, to: appserver3.id! },

  { from: router.id!, to: firewall2.id! },
  { from: firewall2.id!, to: loadbalancer.id! },
  { from: loadbalancer.id!, to: webserver1.id! },
  { from: loadbalancer.id!, to: webserver2.id! },
  { from: loadbalancer.id!, to: webserver3.id! },
];
