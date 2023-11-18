Flowchart
  = ws Layout ws items:(SubgraphStatement ws)* { return { type: 'Flowchart', edges:items.map(item => item[0]) } }
  
Layout
 = "graph" / "flowchart"
 
SubgraphStatement
  = Subgraph / Statement / Connection
  
Statement
  = LayoutDirective / Edge 

LayoutDirective
  = "direction"? ws direction:("TD" / "LR" / "TB" / "BT" / "RL")
    {
      return { type: 'Layout', direction };
    }
    
Subgraph
  = "subgraph" ws id:Identifier ws items:(Statement ws)* ws "end"
    {
      return { type: 'Subgraph', id, edges:items.map(item => item[0]) };
    }
    

Edge
  = from:Connection ws arrow:Arrow ws label:EdgeLabel? ws to:Connection ws
    {
      return { type: 'Edge', from, to, arrow, label: label? label : '' };
    }
    
StringLiteral 
  = "\"" text:$[^\"]+ "\""
    {
      return text.trim()
    }
    
Identifier
  = text:$[A-Za-z0-9_]+ { return text.trim() }

Connection
   = id:Identifier label:Label { return { type:'Node', id, label }}
   / id:Identifier { return { type: 'Node', id }}

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

RectangularText
  = $[^\]\"]+ 
  / StringLiteral 
  
RectangularLabel
  = "[" label:RectangularText "]" { return { type: 'rectangular', label }; }

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

EdgeLabel
  = "|" text:$[^|]+ "|"
    {
      return text.trim();
    }
Arrow
  = "-->" / "---" / "-.->" / "<--" / "<-.-" / "--" 

LineTerminator
  = [\n\r\u2028\u2029]
  
SingleLineComment
  = "%%" (!LineTerminator .)*
  
ws "whitespace"
  = ([ \t\n\r\;] / SingleLineComment)*

