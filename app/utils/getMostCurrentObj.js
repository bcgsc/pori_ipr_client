function getMostCurrentObj(array) {
  let mostRecentObject = array[0];
  for (let i = 1; i < array.length; i++) {
    if (new Date(array[i].createdAt) > new Date(mostRecentObject.createdAt)) {
      mostRecentObject = array[i];
    }
  }
  return mostRecentObject;
}

export default getMostCurrentObj;