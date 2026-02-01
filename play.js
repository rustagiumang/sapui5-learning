const name = 'Max';
let age = 29;
const hasHobbies = true;

age = 30;

const summarizeUser = (userName, userAge, userHasHobby) => {
  return (
    'Name is ' +
    userName +
    ', age is ' +
    userAge +
    ' and the user has hobbies: ' +
    userHasHobby
  );
};

// const add = (a, b) => a + b;
// const addOne = a => a + 1;
const addRandom = () => 1 + 2;

// console.log(add(1, 2));
// console.log(addOne(1));
console.log(addRandom());

console.log(summarizeUser(name, age, hasHobbies));


const person = {
  name: 'Umang',
  age: 32,
  greeting() { console.log('My name is ' + this.name + ' (' + this.age + ')') }
}
person.greeting();

const hobbies = [ 'Dance', 'Sing', 'Plant'];
// for(let hobby of hobbies){
//   console.log(hobby);
// }
console.log(hobbies.map(hobby2 => 'Hobby :' + hobby2));

const newHobby = [...hobbies];
console.log(newHobby);

const restOperator = (...args) => {
  return args;  
}
console.log(restOperator(1,2,3,4));