
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

export const complexflowchart = `graph TB
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
