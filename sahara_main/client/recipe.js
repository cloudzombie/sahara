Template.recipe.events({
	"click .ingredientCard": function(event) {
		if (this.status === "inactive"){
			Ingredients.update(this._id,{$set: {status: "active"}});
		}else{
			Ingredients.update(this._id,{$set: {status: "inactive"}});
		}
	},
	"click #removeIcon": function(event) {
		Ingredients.remove({_id: this._id});
	},
	"submit .findRecipe": function(event) {
      	event.preventDefault();

      	var selectedIngredients = new Array();
      	var ingredients = Ingredients.find({userId: Meteor.user()._id}).fetch();
      	for (x in ingredients) {
      		console.log(ingredients[x].status);
      		if(ingredients[x].status === "active") {
      			selectedIngredients.push(ingredients[x]['ingredient']);
      		}
      	}
		
      	var url = "http://food2fork.com/api/search?key=aa7a553fe63a54fd4a6e3f08c4204e5d&q=";
      	for (x in selectedIngredients) {
      		url += selectedIngredients[x] + "%20";
      	}
      	console.log(url);
      	httpGetRecipe(url);
    },
	"submit .addIngredient": function(event) {
		event.preventDefault();
		var ingredientInput = event.target.ingredient.value;
		ingredientInput = $.trim(ingredientInput);
		event.target.ingredient.value = "";

		var ingredients = Ingredients.find({userId: Meteor.user()._id}).fetch();
		var doesContainIngredient = false;
		for (x in ingredients) {
			if (ingredients[x]['ingredient'].toLowerCase() == ingredientInput.toLowerCase()) {
				return;
			}
		}
		Ingredients.insert({ingredient: ingredientInput, userId: Meteor.user()._id});
	},
	"click #recipeCreatePlan": function(){
		event.preventDefault();
		Session.set('title', this['title']);
		Router.go('/create');
	}
});

function httpGetRecipe (url){
	Meteor.call("findRecipes", url, function(err, data){
		if (err) console.log(err);
		var recipes = JSON.parse(data).recipes;
		var recipeIds = new Array();

		for (x in recipes) {
			recipeIds.push(recipes[x].recipe_id);
		}

		for (x in recipeIds) {
			url = "http://food2fork.com/api/get?key=aa7a553fe63a54fd4a6e3f08c4204e5d&rId=";
			url += recipeIds[x];

			var arr = new Array();
			Meteor.call("getRecipe", url, function(err, data){
				if (err) console.log(err);
				arr.push(data);
				Session.set("recipeData", arr);
			});
		}
	});
}

Template.recipe.helpers({
	recipes: function() {
		var recipeData = Session.get("recipeData");
		var recipeSummaries = new Array();

		for (x in recipeData) {
			var recipeSummary = new Array();
			var recipe = JSON.parse(recipeData[x]).recipe;
			recipeSummary['title'] = recipe.title;
			recipeSummary['ingredients'] = recipe.ingredients;
			recipeSummary['image_url'] = recipe.image_url;
			recipeSummaries.push(recipeSummary);
		}
		return recipeSummaries;
	},

	searchCompleted: function() {
		return typeof Session.get("recipeData") !== 'undefined';
	},

	ingredients: function() {
		return Ingredients.find({userId: Meteor.user()._id});
	},

	selectedClass: function() {
		if (this.status === 'active'){
			return 'selected';
		}else{
			return 'unselected';
		}
	}
});

decodeUtf8 = function(str) {
	console.log(str);
	var elem = document.createElement('textarea');
	elem.innerHTML = str;
	return elem.value;
};

Template.registerHelper('decodeUtf8', function(str) {
	var elem = document.createElement('textarea');
	elem.innerHTML = str;
	return elem.value;
});