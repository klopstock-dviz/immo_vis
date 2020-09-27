 //select distinct
 
function deduplicate_dict(dict, champ) {
  unique = [...new Set(dict.map(p => p[champ]))];
  return unique
}

function deduplicate_array(array) {
  unique = [...new Set(array)];
  return unique
}
 


function trier(key, order = 'asc') {
  return function innerSort(a, b) {
    if (!a.hasOwnProperty(key) || !b.hasOwnProperty(key)) {
      return 0;
    }

    const varA = (typeof a[key] === 'string')
      ? a[key].toUpperCase() : a[key];
    const varB = (typeof b[key] === 'string')
      ? b[key].toUpperCase() : b[key];

    let comparison = 0;
    if (varA > varB) {
      comparison = 1;
    } else if (varA < varB) {
      comparison = -1;
    }
    return (
      (order === 'desc') ? (comparison * -1) : comparison
    );
  };
}


function getRandomInt(max) {
  return Math.floor(Math.random() * Math.floor(max));
}
