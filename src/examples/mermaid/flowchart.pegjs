Flowchart
  = ws layout:LayoutDirective ws items:(Statement ws)* { return { layout: layout, edges:items.map(item => item[0]) } }

LayoutDirective
  = Layout ws direction:("LR" / "TB" / "BT" / "RL")
    {
      return { type: 'Layout', direction };
    }
    
Layout
 = "graph" / "flowchart"
 
Statement
  = Edge // NodeDeclaration / Subgraph 

NodeDeclaration
  = id:Identifier ws label:Label
    {
      return { type: 'Node', id, label };
    }

Edge
  = ws from:Connection ws arrow:Arrow ws label:LabelDescription? ws to:Connection ws
    {
      return { type: 'Edge', from, to, arrow };
    }

Identifier
  = text:$[A-Za-z0-9_]+ { return text.trim() }

Connection
 = id:Identifier label:Label? { return { id, label }}
 
Label
  = "[" l:$[^\]]+ "]"? { return { type: 'rectangular', label: l.trim() }; }
  / "(" l:$[^)]+ ")"? { return { type: 'round', label: l.trim() }; }
  / "{" l:$[^}]+ "}"? { return { type: 'curly', label: l.trim() }; }

LabelDescription
  = "|" text:$[^|]+ "|"
    {
      return text.trim();
    }
Arrow
  = "-->" / "---"

ws "whitespace"
  = [ \t\n\r]*
