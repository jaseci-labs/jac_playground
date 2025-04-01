
export const exampleCodes = [
  {
    name: "Hello World",
    code:
`# A simple Hello World program in Jaclang
with entry {
    print("Hello, World!");
}`,
  },
  {
    name: "Variables",
    code:
`# Variables in Jaclang
with entry {
    x:int = 5;
    y:str = "Tom";
    print(x);
    print(y);
}`,
  },
  {
    name: "Conditional Statements",
    code:
`# Conditional statements in Jaclang
with entry {
    a = 5;
    b = 20;
    if b > a {
        print("b is greater than a");
    } elif a == b {
        print("a and b are equal");
    }
}
`,
  },
  {
    name: "Loops",
    code:
`# Loops in Jaclang
with entry {
    size = ["small", "medium", "large"];
    colour = ["red", "green", "blue"];
    items = ["shirt", "pants", "jacket"];
    for x in size {
        for y in colour {
            for z in items {
                print(x, y, z);
            }
        }
    }
}
`,
  },
  {
    name: "Abilities",
    code:
`# Abilities in Jaclang
can add(a: int, b: int) -> int {
    return a + b;
}
with entry {
    print(add(2, 3));
}
`,
  },
  {
    name: "Lists",
    code:
`# Lists in Jaclang
with entry {
    fruits = ["apple", "banana", "cherry", "orange", "kiwi", "melon", "mango"];
    print(fruits[:4]);
}
`,
  },
  {
    name: "Data Spatial Programming",
    code:
`# Data Spatial programming in Jaclang
walker Creator {
    can create with \`root entry;
}

node node_a {
    has val: int;

    can make_something with Creator entry;
}

edge connector {
    has value: int = 10;
}

:walker:Creator:can:create {
    end = here;
    for i=0 to i<3 by i+=1  {
        end ++> (end := node_a(val=i));
    }
    end +:connector:value=i:+> (end := node_a(val=i + 10));
    root <+:connector:value=i:+ (end := node_a(val=i + 10));
    visit [-->];
}

:node:node_a:can:make_something {
    i = 0;
    while i < 5 {
        print(f"welcome to {self}");
        i+=1;
    }
}

with entry {
    root spawn Creator();
}

`,
  },
];

export const defaultCode = `with entry {
    print("Welcome to Jac!");
}
`;
