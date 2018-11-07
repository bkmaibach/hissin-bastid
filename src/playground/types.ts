// Implicit Any
let myRealAge;
myRealAge = 27;
myRealAge = 33;
myRealAge = "WOT?";

// Explicit string
let greeting: string;
greeting = "hello";

// Implicit string[]
let hobbies = ["biking", "cooking"];
hobbies[0] = "swimming";
// hobbies[1] = 44; // error - the array contents have implicit type

// Tuples - arrays with mixed types
// explicit
let address: [string, number] = ["Main st.", 99];

// enums
enum Colour {
    Gray, // 0
    Green = 100, // 100
    Blue // 101
}

let myColour: Colour = Colour.Green;

let car: any = "BMW";
car = {brand: "BMW", series: 3};
let myName = "Keith";

// functions
// Explicit return types
function getMyName(): string {
    return myName;
}
function sayHi(): void {
    console.log("Hi!");
}

// Explicit param types
function getProduct(val1: number, val2: number): number {
    return val1 * val2;
}

// Explicit function types
// Basically what you would use instead of ...: function
let myMultiply: (val1: number, val2: number) => number;
// The following does not satisfy
// myMultiply = sayHi;
// myMultiply();
// This does satisfy
myMultiply = getProduct;
console.log(myMultiply(3, 6));

// Objects - Inferred type
let userData = {
    name: "Max",
    age: 27
};
// Error - empty object is not assignable - the entire object is recognized as its own type upon assignment
// userData = {}
// userData = {}

// userData = {
//     a: "Right type?",
//     b: 777
// };
// Error - the names of the keys become a apart of the type itself - the value types being correct is not enough
// Note that unlike in an array, the order does NOT matter

// Explicit type - the key names and the required types are given upon declaration
let userObject: {name: string, age: number};



