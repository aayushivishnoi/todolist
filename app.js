//jshint esversion:6

const express = require("express");
const bodyParser = require("body-parser");
const _ = require("lodash");
const atlasCluster = process.env.MONGODB_URI || "mongodb://localhost:27017/todolistDB";

const mongoose = require("mongoose");

const app = express();

app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static("public"));

mongoose.connect(atlasCluster, {useNewUrlParser: true} );

const itemsSchema = {
  name: String
};
const Item = mongoose.model("Item", itemsSchema);

const item1 = new Item({
  name : "Welcome to you todolist!"

});

const webdevelopment_course = new Item ({
  name : "webDevelopment"
});

const unacdemy = new Item ({
  name : "Unacdemy"
});


const defaultItems = [item1,webdevelopment_course,unacdemy];

const listSchema = {
  name: String,
  items: [itemsSchema]
};

const List = mongoose.model("List", listSchema);

app.get("/", function(req, res) {
  Item.find({},function(err, foundItems){
     if (foundItems.length === 0){
       Item.insertMany(defaultItems, function(err){
         if(err){
           console.log(err);
         }else{
         console.log("Successfully save the default items in database");
       }
       });
       res.redirect("/");
     }else{
    res.render("list", {listTitle:"Today", newListItems: foundItems});
  }
  });
});

 app.get("/:customListName",function(req,res){
   const customListName = _.capitalize(req.params.customListName );
List.findOne({name:customListName},function(err, foundList){
  if(!err){
    if(!foundList){
      const list = new List({
        name: customListName,
        items: defaultItems
      });
      list.save();
      res.redirect("/" + customListName);
      }else{
      res.render("list",{listTitle:foundList.name, newListItems: foundList.items});
    }
  }
})


 });

app.post("/", function(req, res){

  const itemName = req.body.newItem;
  const listName = req.body.list;

  const item = new Item({
    name:itemName
  });

  if (listName === "Today"){
    item.save();
    res.redirect("/");
  }else{
    List.findOne({name: listName},function(err,foundList){
      if(err){
        console.log(err);
      }else{
      foundList.items.push(item);
      foundList.save();
      res.redirect("/" + listName);
      console.log("Sucessfully added");
    }
    });
  }
});

app.post("/delete", function(req, res){
  const checkedItemId = req.body.checkbox;
  const listName = req.body.listName;
  if(listName=== "Today"){
    Item.findByIdAndRemove(checkedItemId, function(err){
      if(!err){
        console.log("Sucessfully deleted Checked Item");
        res.redirect("/");
  }
  });
} else{
   List.findOneAndUpdate({name :listName},{$pull: {items: {_id: checkedItemId}}},function(err,foundList){
     if(!err){
       res.redirect("/"+ listName);
     }
   })
}
});

// app.get("/work", function(req,res){
//   res.render("list", {listTitle: "Work List", newListItems: workItems});
// });

app.get("/about", function(req, res){
  res.render("about");
});

app.listen(process.env.PORT ||3000, function() {
  console.log("Server started on port 3000");
});
