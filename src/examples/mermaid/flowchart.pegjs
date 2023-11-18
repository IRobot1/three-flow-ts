Flowchart
  = ws layout:LayoutDirective ws items:(Statement ws)* { return { layout: layout, edges:items.map(item => item[0]) } }

LayoutDirective
  = Layout ws direction:("TD" / "LR" / "TB" / "BT" / "RL")
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
  = from:Connection ws arrow:Arrow ws label:LabelDescription? ws to:Connection ws
    {
      return { type: 'Edge', from, to, arrow };
    }
  / from:Connection 
    {
      return { type: 'Edge', from };
    }


Identifier
  = text:$[A-Za-z0-9_]+ { return text.trim() }

Connection
   = id:Identifier label:Label { return { id, label }}
   / id:Identifier { return { id }}
 
Label
  = DoubleCircleLabel
  / CircleLabel
  / SubroutineLabel
  / DatabaseLabel
  / HexagonalLabel
  / StadiumLabel
  / RoundLabel
  / RhombusLabel
  / AsymmetricLabel
  / TrapezoidLabel
  / TrapezoidAltLabel
  / ParallelogramLabel
  / ParallelogramAltLabel
  / RectangularLabel

RectangularLabel
  = "[" l:$[^\]]+ "]" { return { type: 'rectangular', label: l.trim() }; }

RoundLabel
  = "(" l:$[^)]+ ")" { return { type: 'roundrectangle', label: l.trim() }; }

RhombusLabel
  = "{" l:$[^}]+ "}" { return { type: 'rhombus', label: l.trim() }; }

StadiumLabel
  = "([" l:$[^\]]+ "])" { return { type: 'stadium', label: l.trim() }; }

SubroutineLabel
  = "[[" l:$[^\]]* "]]" { return { type: 'subroutine', label: l.trim() }; }

DatabaseLabel
  = "[(" l:$[^)]+ ")]" { return { type: 'database', label: l.trim() }; }

CircleLabel
  = "((" l:$[^)]+ "))" { return { type: 'circle', label: l.trim() }; }

DoubleCircleLabel
  = "(((" l:$[^)]+ ")))" { return { type: 'doublecircle', label: l.trim() }; }

AsymmetricLabel
  = ">" l:$([^\]])+ "]" { return { type: 'asymmetric', label: l.trim() }; }

HexagonalLabel
  = "{{" l:$[^}]+ "}}" { return { type: 'hexagonal', label: l.trim() }; }

ParallelogramLabel
  = "[/" l:$[^/]+ "/]" { return { type: 'parallelogram', label: l.trim() }; }

ParallelogramAltLabel
  = "[\\" l:$[^\\]+ "\\]" { return { type: 'parallelogram_alt', label: l.trim() }; }

TrapezoidLabel
  = "[/" l:$[^\\]+ "\\]" { return { type: 'trapezoid', label: l.trim() }; }

TrapezoidAltLabel
  = "[\\" l:$[^/]+ "/]" { return { type: 'trapezoid_alt', label: l.trim() }; }

LabelDescription
  = "|" text:$[^|]+ "|"
    {
      return text.trim();
    }
Arrow
  = "-->" / "---" / "-.->" / "<--" / "<-.-" / "--" 

ws "whitespace"
  = [ \t\n\r\;]*
