
export const basicflowchart = `graph LR
    A[Start] --> B{Big Decision}
    B -->|Yes| C[Do Something]
    B -->|No| D[Do Something Else]
    C --> E[End]
    D --> E`

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
