const generateRandomId = () => {
  return Math.random().toString(36).substr(2, 9);
};

let id = 10;
const generateIncrementalId = () => {
  return id++;
}

module.exports = {
  generateRandomId,
  generateIncrementalId
};