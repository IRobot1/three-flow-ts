
export const basicflowchart = `graph LR
    A[Start] --> B{Big Decision}
    B -->|Yes| C[Do Something]
    B -->|No| D[Do Something Else]
    C --> E[End]
    D --> E
`

export const shapesflowchart = `graph LR
Start1 --- A(Rounded Rectangle)
A --- B([Stadium])
B --- C[[Subroutine]]
C --- D[(Database)]
D --- F>Asymmetric]
Start2 --- G{Rhombus}
G --- H{{Hexagon}}
H --- I[/Parallelogram/]
I --- J[\\Parallelogram Alt\\]
Start3 --- K[/Trapezoid\\]
K --- L[\\Trapezoid Alt/]
L --- M((Double Circle))
M --- N((Circle))
`

export const mediumflowchart = `graph TB
    Bat(fa-car-battery Batteries) -->|150a 50mm| ShutOff
    Bat -->|150a 50mm| Shunt

    ShutOff[Shut Off] -->|150a 50mm| BusPos[Bus Bar +]

    Shunt -->|150a 50mm| BusNeg[Bus Bar -]

    BusPos -->|40a| Fuse[Fuse Box]
    BusPos -->|?a| Old{Old Wiring}

    BusNeg -->|40a| Fuse

    Fuse -->|10a| USB(USB-C)
    Fuse -->|10a| USB
    Fuse -->|1.5a| Switch
    Switch -->|1.5a| Wifi

    Wifi -->|1.5a| Fuse

    Fuse -->|10a| Cig1[Cigarette Lighter]
    Fuse -->|10a| Cig1 

    Fuse -->|10a| Cig2[Cigarette Lighter Near Bed]
    Fuse -->|10a| Cig2 

    BusNeg -->|?a| Old

    Solar --> SolarCont[Solar Controller]
    Solar --> SolarCont

    SolarCont --> BusNeg
    SolarCont --> BusPos
`

export const complexflowchart = `
flowchart LR
    p1>bank_name]
    p2>seller_info]


    s1[[1-withdraw_money]]
    s2[[2-purchase_bike]]


    f1[go_to_bank]
    f2[withdraw_from_atm]
    f3[contact_seller]
    f4[trade_bike]


    d1[(reads: customer_identification)]
    d2[(reads/writes: customer_balance)]
    d3[(writes: e_document_sign)]


    s1-.->s2;


    p1-->|inputs|s1
    s1-->|calls|f1
    f1-->|calls|f2
    f2-->d1
    f2-->d2


    p2-->|inputs|s2
    s2-->f3
    f3-->f4
    f4-->d3
  `

export const subgraphflowchart = `
flowchart LR
subgraph import
  direction LR
 1X[import] --> 1A[*]
 1A --> 1B[as]
 1B --> 1C[THREE]
 1C --> 1D[from]
 1D --> 1E['three']
end
subgraph scene
  direction LR
  2X[const] --> 2A[scene]
  2A --> 2B[=]
  2B --> 2C[new]
  2C --> 2D["Scene()"]
end 
subgraph camera
  direction LR
  3X[const] --> 3A[camera]
  3A --> 3B[=]
  3B --> 3C[new]
  3C --> 3D["PerspectiveCamera("]
  3D --> 3E[75,]
  3E --> 3F[window.innerWith]
  3F --> 3G["/"]
  3G --> 3H[window.innerHeight,]
  3H --> 3I[0.1,]
  3I --> 3J["1000)"]
end 
subgraph renderer
  direction LR
  4X[const] --> 4A[renderer]
  4A --> 4B[=]
  4B --> 4C[new]
  4C --> 4D["WebGLRenderer()"]
end 
subgraph setSize
  direction LR
  5X["renderer.setSize("] --> 5A[window.innerWidth,]
  5A --> 5B["window.innerHeight)"]
end 
subgraph appendChild
  direction LR
  6X["document.body.appendChild"] --> 6A["("]
  6A --> 6B["render.domElement"]
  6B --> 6C[")"]
end 

xgraph[Creating the Scene]
xgraph --> import
xgraph --> scene
xgraph --> camera
xgraph --> renderer
xgraph --> setSize
xgraph --> appendChild
`

export const subgraph2flowchart = `flowchart TD
subgraph Wednesday
  T1[Make brine] --> T2[Brine turkey]
  P1[Mix pie crust] --> P2[Bake pie crust]
  R1[Cook sausage]
  B2[Make bread dough]
  B2 -- Let dough rise --> B4[Bake bread]
end

T2 -- Let turkey brine overnight --> T3[Roast turkey]
T3 --> D
P2 --> P3[Make pie filling]
P3 --> P4[Chill pie]
P4 --> D[Thanksgiving dinner]
R1 --> R2[Mix dressing]
R2 --> R3[Bake dressing]
R3 --> D
M1[Peel potatoes] --> M2[Boil potatoes]
M2 --> M3[Mash potatoes]
M3 --> D
B4 --> D
T3 --> S1[Make turkey stock]
S1 --> S2[Make soup]
D --> L[Leftovers!]
`

export const subgraph3flowchart = `graph TD
 
subgraph MobileClient
  A[Local Database] --> B[Index Controller]
  B --> C[Chunk Controller]
  C --> D[Watcher]
end
 
subgraph ServerSide
  E[Load Balancer] --> F[Controllers]
  E --> G[Watcher]
  F --> H[File Processing Server]
  H --> I[Cloud Storage]
  F --> J[Metadata Server]
  J --> K[Metadata Database]
  J --> L[Notification Server]
  L --> G
end
 
subgraph MessageQueue
  M[Kafka]
end
 
A -- Notify changes --> D
D -- Watch events --> G
G -- Notify events --> D
F -- Upload Download files --> H
H -- Store Retrieve chunks --> I
F -- Process metadata --> J
J -- Store metadata --> K
F -- Push notifications --> L
L -- Publish messages --> M
M -- Subscribe to messages --> G
`
