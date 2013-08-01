
angular.module('HomeScoreModule', []).
filter('bool', function() {
	return function(input) {
		return input ? 'Yes' : 'No';
	}
});



function HomeScore($scope, $http) {
	$scope.answers = {
		'zip': null,
		'age': null,
		'age_group': null,
		'fever': false,
		'cough': false,
	};
	$scope.section = 1;
	$scope.locator = {
		'enabled': navigator.geolocation,
		'buttonText': "Locate Me",
		'reset': function() {
			$scope.locator.enabled = navigator.geolocation;
			$scope.locator.buttonText = "Locate Me";
		}
	}
	
	// only show the ZIP if it is 5 digits, placeholder otherwise
	$scope.zip = function() {
		return ($scope.answers.zip && 5 == $scope.answers.zip.length) ? $scope.answers.zip : "–";
	}
	
	// Step 1: user wants to be located
	$scope.locate = function() {
		$scope.error_msg = null;
		$scope.locator.enabled = false;
		$scope.locator.buttonText = "Locating...";
		
		// ask for for geolocation and translate to ZIP
		if ('geolocation' in navigator) {
			navigator.geolocation.getCurrentPosition(
				function (pos) {
					$http.jsonp("http://ws.geonames.org/findNearestAddressJSON?callback=JSON_CALLBACK&lat=" + pos.coords.latitude + "&lng=" + pos.coords.longitude)
					.success(function(data, status, headers, config) {
						$scope.locator.reset();
						
						// got the ZIP
						if (data.address.postalcode) {
							$scope.answers.zip = data.address.postalcode;
							$scope.section = 2;
						}
						else {
							$scope.error_msg = "No ZIP received, please try again or add it manually";
						}
					})
					.error(function(data, status, headers, config) {
						$scope.error_msg = '<b>' + status + '</b>: ' + data;
						$scope.locator.reset();
					});
				},
				function (error) {
					$scope.error_msg = (1 == error.code) ? null : "Could not determine location";		// 1 == user did not allow
					$scope.locator.reset();
				},
				{'timeout': 10000}
			);
		}
		
		// location services not available
		else {
			$scope.locator.buttonText = "Cannot Locate";
		}
	}
	
	// Step 2: user set age
	$scope.setAgeClass = function(group) {
		$scope.answers.age = null;
		$scope.answers.age_group = (group < 4 && group > 0) ? group : 1;
		$scope.section = 3;
	}
	
	// Step 3: user selected fever
	$scope.setFever = function(flag) {
		$scope.answers.fever = flag;
		$scope.section = 4;
	}
	
	$scope.toggleFever = function() {
		$scope.answers.fever = !$scope.answers.fever;
	}
	
	// Step 4: user selected cough
	$scope.setCough = function(flag) {
		$scope.answers.cough = flag;
		$scope.section = 0;
	}
	
	$scope.toggleCough = function() {
		$scope.answers.cough = !$scope.answers.cough;
	}
	
	// form was submitted
	$scope.submit = function() {
		return false;
	}
}

