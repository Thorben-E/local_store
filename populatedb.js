#! /usr/bin/env node

// Get arguments passed on command line
var userArgs = process.argv.slice(2);
/*
if (!userArgs[0].startsWith('mongodb')) {
    console.log('ERROR: You need to specify a valid mongodb URL as the first argument');
    return
}
*/
var async = require('async')
var Item = require('./models/item')
var Category = require('./models/category')

var mongoose = require('mongoose');
var mongoDB = "mongodb+srv://admin:MO_f7VG3jY8!@cluster0.wpe41dh.mongodb.net/local_store?retryWrites=true&w=majority";
mongoose.connect(mongoDB, {useNewUrlParser: true, useUnifiedTopology: true});
mongoose.Promise = global.Promise;
var db = mongoose.connection;
db.on('error', console.error.bind(console, 'MongoDB connection error:'));

var genres = []
var items = []

function categoryCreate(name, cb) {
  var category = new Category({ name: name });
       
  category.save(function (err) {
    if (err) {
      cb(err, null);
      return;
    }
    console.log('New category: ' + category);
    genres.push(category)
    cb(null, category);
  }   );
}

function itemCreate(name, description, price, units, genre, url) {
  itemdetail = { 
    name: name,
    description: description,
    items: units,
    price: price
  }
  if (genre != false) itemdetail.genre = genre
    
  var item = new Item(itemdetail);    
  item.save(function (err) {
    if (err) {
      url(err, null)
      return
    }
    console.log('New Item: ' + item);
    items.push(item)
    url(null, item)
  }  );
}

function createCategory(cb) {
    async.series([
        function(callback) {
          categoryCreate("masculine", callback);
        },
        function(callback) {
          categoryCreate("feminine", callback);
        },
        function(callback) {
          categoryCreate("unisex", callback);
        },
        ],
        // optional callback
        cb);
}

function createItems(cb) {
    async.parallel([
        function(callback) {
          itemCreate('Creed Aventus', 'A woody and heady centre is complemented with notes of roses, Jasmine blossom and patchouli, while a rich base of oak moss, ambergris and a touch of vanilla provides a final flourish to this sophisticated scent.', '10', 300, [genres[0],], callback);
        },
        function(callback) {
          itemCreate("Chanel N5", 'This floral bouquet, composed around May rose and jasmine, features bright citrus top notes. Aldehydes create a unique presence, while the smooth touch of bourbon vanilla yields an incredibly sensual sillage.', '15', 140, [genres[1],], callback);
        },
        function(callback) {
          itemCreate("Molecule 01", 'Molecule 01 is an aroma chemical, which are used in virtually all modern fragrances to recreate scents like jasmine or cedar or a host of other familiar olfactory favorites.', '20', 70, [genres[2],], callback);
        }
        ],
        // optional callback
        cb);
}

async.series([
    createCategory,
    createItems,
],
// Optional callback
function(err, results) {
    if (err) {
        console.log('FINAL ERR: '+err);
    }
    else {
        console.log('BOOKInstances: ');
        
    }
    // All done, disconnect from database
    mongoose.connection.close();
});



