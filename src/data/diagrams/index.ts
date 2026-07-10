export const overviewFlow = `flowchart LR
    subgraph dag1 [Dag 1 - Uge 37]
        A["Grundlæggende"] --> B["Cmdlets og hjælp"]
        B --> C[Pipeline]
        C --> D["Variabler og aliases"]
        D --> E["Quiz og øvelser"]
    end
    subgraph dag2 [Dag 2 - Uge 38]
        F["Sikker scripting"] --> G[WBEM/CIM]
        G --> H["Datahåndtering"]
        H --> I["Projekt-automatisering"]
        I --> J["Quiz og øvelser"]
    end
    dag1 --> dag2
    dag2 --> K["H1 Infrastrukturprojekt"]`;

export const projectOverview = `flowchart TB
    subgraph projekt [H1 Infrastrukturprojekt]
        AD[Active Directory]
        DNS[DNS]
        DHCP[DHCP]
        Backup[Backup]
        Net["Netværk og VLAN"]
        Sec["Netværkssikkerhed"]
    end
    subgraph ps [PowerShell Automatisering]
        Script["Scripts og cmdlets"]
        Remote[Fjernadministration]
        Monitor["Overvågning og rapporter"]
        Safe["Sikker test med WhatIf"]
    end
    Script --> AD
    Script --> DNS
    Script --> DHCP
    Remote --> Backup
    Monitor --> Net
    Safe --> Sec
    Krav[Kravspecifikation] --> Script
    Script --> Dok["Dokumentation i rapport"]`;

export const projectWorkflow = `flowchart LR
    A["Læs krav fra case"] --> B["Identificer gentagne opgaver"]
    B --> C["Skriv PowerShell-script"]
    C --> D["Test med WhatIf"]
    D --> E{Virker det?}
    E -->|Nej| C
    E -->|Ja| F["Kør i projektmiljø"]
    F --> G["Dokumenter i rapport"]
    G --> H["Præsenter i projektfremlæggelse"]`;

export const pipelineExample = `flowchart LR
    Input["Get-Service"] --> Pipe["|"]
    Pipe --> Filter["Where-Object Status -eq Stopped"]
    Filter --> Pipe2["|"]
    Pipe2 --> Output["Select-Object Name"]`;

export const intuneOverview = `flowchart TB
    subgraph cloud [Microsoft Intune - cloud]
        Portal[Intune admin center]
        Policies[Policies og compliance]
        Apps[App distribution]
        Devices[Enhedsstyring]
    end
    subgraph automation [PowerShell automatisering]
        Graph[Microsoft Graph PowerShell]
        Scripts[Bulk scripts og rapporter]
        Deploy[Script deployment til enheder]
    end
    subgraph onprem [Traditionel infrastruktur]
        AD[Active Directory / Entra ID]
        GPO[Gruppepolitik - on-prem]
    end
    AD --> Devices
    Portal --> Policies
    Graph --> Portal
    Scripts --> Graph
    Deploy --> Devices
    GPO -.->|"supplerer / erstatter delvist"| Policies`;
