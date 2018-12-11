module.exports = {
    to: function(promise) {
     return promise.then(data => {
        return [null, data];
     })
     .catch(err => [err]);
    },
    getNestedProperty(path, obj) {
      return path.reduce((acc, current) => {
        return (acc && acc[current]) ? acc[current] : null;
      }, obj);
    },
    isEmptyObject(obj) {
      return Object.keys(obj).length === 0; 
    }
}