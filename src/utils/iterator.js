module.exports = {
    build: function(logs) {

        // Iteration Variables
        let start = 0;
        let nextIndex = start;
        let end = logs.length;
        
        // Underlying data
        let data = logs;
        let val = null;
    
        const iterator = {
           next: function() {
               if (nextIndex < end) {
                   val = data[nextIndex];
                   nextIndex++;
                   return val.replace('\r', '').trim();
               }
               val = null;
               return val
               
           },
    
           current: function() {
               return val.replace('\r', '').trim();
           }
        };
        return iterator;
    }
}