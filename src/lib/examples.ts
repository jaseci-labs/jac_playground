
export const exampleCodes = [
  {
    name: "Hello World",
    code: `
# A simple Hello World program in Jaclang
print("Hello, World!");
`,
  },
  {
    name: "Variables",
    code: `
# Variables in Jaclang
name = "Jac";
age = 1;
is_programming_language = true;

print("Name:", name);
print("Age:", age);
print("Is a programming language?", is_programming_language);
`,
  },
  {
    name: "Conditional Statements",
    code: `
# Conditional statements in Jaclang
temperature = 25;

if temperature > 30:
    print("It's hot outside!");
elif temperature > 20:
    print("It's a nice day!");
else:
    print("It's cold outside!");
`,
  },
  {
    name: "Loops",
    code: `
# Loops in Jaclang
print("For loop example:");
for i in range(5):
    print("Count:", i);

print("\\nWhile loop example:");
count = 0;
while count < 3:
    print("Count:", count);
    count = count + 1;
`,
  },
  {
    name: "Functions",
    code: `
# Functions in Jaclang
function add(a, b) {
    return a + b;
}

function greet(name) {
    return "Hello, " + name + "!";
}

sum = add(5, 3);
greeting = greet("Jaclang");

print("Sum:", sum);
print(greeting);
`,
  },
  {
    name: "Arrays",
    code: `
# Arrays in Jaclang
numbers = [1, 2, 3, 4, 5];
fruits = ["apple", "banana", "orange"];

print("Numbers:", numbers);
print("First number:", numbers[0]);
print("Fruits:", fruits);
print("Last fruit:", fruits[2]);

# Adding elements
numbers.append(6);
fruits.append("grape");

print("Updated numbers:", numbers);
print("Updated fruits:", fruits);
`,
  },
  {
    name: "Object-oriented",
    code: `
# Object-oriented programming in Jaclang
class Person {
    constructor(name, age) {
        this.name = name;
        this.age = age;
    }

    introduce() {
        return "Hi, I'm " + this.name + " and I'm " + this.age + " years old.";
    }

    birthday() {
        this.age += 1;
        return "Happy Birthday! Now I'm " + this.age + " years old.";
    }
}

alice = new Person("Alice", 25);
print(alice.introduce());
print(alice.birthday());
`,
  },
];

export const defaultCode = `with entry {
    print("Welcome to Jac!");
}
`;
