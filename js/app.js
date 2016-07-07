angular.module('AlcoholApp', ['ngMaterial'])
.controller('AlcoholController', function($scope, $element) {
	/** Initialize chart here **/
	var mainChart = new RadialProgressChart('.container', {
	  diameter: 130,
	  series: [{
	    value: 0
	  }, {
	    value: 0
	  }, {
	    value: 0
	  }]
	});

	var permissible = 0.033;
	$scope.title = "Should I carry you home tonight?";
	$scope.volume = "";
    $scope.weight = "";
	var stats = {
		Beer : {density:1.01,percent:6},
		Whiskey: {density:0.939,percent:45},
		Vodka: {density:0.916,percent:40},
		Wine: {density:0.99,percent:13}
	}
	$scope.drinks = ["Beer","Whiskey","Vodka","Wine"];
	$scope.cart = [];
    $scope.searchTerm;
    $scope.ebac = 0;
    $scope.displayNum = 0;
    $scope.clearSearchTerm = function() {
        $scope.searchTerm = '';
      };
    // The md-select directive eats keydown events for some quick select
    // logic. Since we have a search input here, we don't need that logic.
    $element.find('._md-chip-input-container input').disabled = true;
     $element.find('input').on('keydown', function(ev) {
          ev.stopPropagation();
      });

     $scope.addDrink = function(){
     	if($scope.selectedDrink && $scope.volume){
     	//if input valid and doesn't exist in cart only then add
     		if($scope.cart.filter(function(e) { return e.name == $scope.selectedDrink; }).length == 0)
     			$scope.cart.push({name: $scope.selectedDrink, volume: $scope.volume});

     		updateViews();
     		

     	}
     };

     $scope.removeDrink = function(chip){
		$scope.cart = $scope.cart.filter(function(e) { return e.name !== chip.name; });
		updateViews();
     };

     function updateViews(){
     	$scope.ebac = calculate();
     	if($scope.ebac < 0)
     		$scope.ebac = 0;
     	var max = ($scope.ebac / permissible) > 100 ? 100 : ($scope.ebac / permissible)
     	var series1 =  $scope.ebac < 0.5*permissible ? ($scope.ebac)*100/(0.5*permissible) : 100;
     	var series2 =  $scope.ebac < permissible ? ($scope.ebac < 0.5*permissible ? 0 : ($scope.ebac - 0.5*permissible)*100/(0.5*permissible)) : 100;
     	var series3 = $scope.ebac > permissible ? max : 0;
     	mainChart.update([series1,series2,series3]);
     	$scope.displayNum = Math.ceil($scope.ebac * 1000);
     };

     function calculate(){
     	var sum = 0;
     	$scope.cart.forEach(function(drink){
     		sum += (stats[drink.name].percent/100 * drink.volume * (0.78924)); //0.78924 g/ml is the density of ethanol
     	});
     	var sd = sum/10;
     	var bw = 0.58; //BW is a body water constant (0.58 for men and 0.49 for women),
     	var mr = 0; //Females 0.017, males 0.015
     	var wt = $scope.weight > 0 ? $scope.weight : 70; //weight in kg
     	var dp = 3; //DP is the drinking period in hours.
     	var ebac = ((0.86 * sd * 1.2 / (bw * wt)) - (mr * dp)); //Widmark formula (https://en.wikipedia.org/wiki/Blood_alcohol_content)
     	return ebac;
     }

});