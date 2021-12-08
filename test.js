function generateRandomString() {
  let random = Math.random().toString(36).slice(6);
  console.log(random);
  return random;
}
console.log(generateRandomString('nba.com'));