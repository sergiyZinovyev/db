const fs = require("fs");
 
// отримання файлу 
exports.file = function(file, path, cb){
    fs.readFile(`server/users_data/${path}/${file}`, function(err,data){
        cb(err, data)
    });
}

// 
exports.writeFile = function(file, cb){
  fs.writeFile(`server/img`, file, function(err,data){
      cb(err, data)
  });
}

//-------------------------------------------------------------------------------------------------------------------------------------

//визначення current date
exports.curentDate = function(d){
    if(d){
      var now = new Date(d);
      var curr_date = ('0' + now.getDate()).slice(-2)
      var curr_month = ('0' + (now.getMonth() + 1)).slice(-2);
      var curr_year = now.getFullYear();
      var curr_hour = now.getHours();
      var curr_minute = now.getMinutes();
      var curr_second = now.getSeconds();
      var formated_date = curr_year + "-" + curr_month + "-" + curr_date + " " + curr_hour + ":" + curr_minute + ":" + curr_second;
    }
    else {return new Date()};
    return formated_date;
    //return new Date()
  }