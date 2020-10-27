var meApp = angular.module('meapp', ['ngResource','ngRoute']);


meApp.controller('mainController', function($scope, $location) {
    $scope.isActive = function(route) {
        return route === $location.path();
    }
});

meApp.factory('SecurityResource', function($resource) {
			return $resource('api/rest.php?path=/api/:id', {}, {
				signout: {method: 'GET'},
				signup: {method: 'POST'},
				signin: {method: 'POST'}
			});
		});

meApp.factory('APIResource', function($resource) {
			return $resource('api/rest.php?path=/api/:id', {}, {
				query: {method: 'GET', isArray: true},
				get: {method: 'GET'},
				remove: {method: 'DELETE'},
				edit: {method: 'PUT'},
				set: {method: 'PUT', isArray: true}
			});
		});
meApp.factory('PublishResource', function($resource) {
			return $resource('api/rest.php?path=/api/publish/:id', {}, {
				get: {method: 'GET'}
			});
		});

meApp.controller('SecurityCtrl', function($scope, $routeParams, $location, SecurityResource, $http) {
//username = g2@m.com and password is hi
	$scope.signin = function() {
		SecurityResource.signin({id:'login'}, $scope.credential, function(data) {
			$location.path('/dashboard');
		});
	};
	$scope.signout = function() {
        	SecurityResource.signout({id:'logout'}, function(data) {
            		$location.path('/');
        	});
	};
	$scope.signup = function() {
		SecurityResource.signup({id:'join'}, $scope.credential, function(data) {
			$location.path('/dashboard');
		});
    	};

});
meApp.factory('dataService', function() {
 var savedData = {}
 function set(data) {
   savedData = data;
 }
 function get() {
  return savedData;
 }

 return {
  set: set,
  get: get
 }

});
meApp.factory('collectionService', function() {
 var savedData = {}
 function set(data) {
   savedData = data;
 }
 function get() {
  return savedData;
 }

 return {
  set: set,
  get: get
 }

});
meApp.factory('everythingService', function() {
 var savedData = {}
 function set(data) {
   savedData = data;
 }
 function get() {
  return savedData;
 }

 return {
  set: set,
  get: get
 }

});
meApp.controller('ItemsCtrl', function($scope, $rootScope, $location, APIResource, dataService, collectionService, everythingService, PublishResource) {

	var tvaParts = $location.path().split("/");
	
	var tvsBaseType = tvaParts[1]; //eg. locations, or products, or whatever
	
	if (tvaParts.length < 3) {
	        $scope.items = APIResource.query({id:tvsBaseType});	        
	        everythingService.set($scope.items);	
	        $rootScope.everything = $scope.items;
	       
	}

	$scope.delete = function(item, items, title) {
		if (confirm('Confirm delete: ' + title)) {
			items.splice(items.indexOf(item), 1);
			APIResource.set({id:tvsBaseType}, $rootScope.everything, function(data) {        
				$location.path('/' + tvsBaseType);
			});
		}
		else {
			$location.path('/' + tvsBaseType);
		}
	};
	
	$scope.edit = function(item, items, url) {
		dataService.set(item);		
		collectionService.set(items);
		$location.path(url);
	}
	$scope.add = function(items, url) {
		dataService.set(null); //need to clear out the dataservice.		
		collectionService.set(items);	
		
		$location.path(url);		
	};
	
	$scope.list = function(items, url) {
		collectionService.set(items);
		
		$location.path(url);
	};

	if (tvaParts[2] === 'edit') {
		$scope.item = dataService.get();
	}

	if (tvaParts[2] === 'list') {
		$scope.items = collectionService.get();
	}

	$scope.save = function(revisedItem) {	
		$scope.items = collectionService.get(); //the collection we are adding or editing into.
		
		var editItem = dataService.get();
		if (editItem == null) //we are adding
		{
			$scope.items.push(revisedItem);
		}

		APIResource.set({id:tvsBaseType}, $rootScope.everything, function(data) {
			$location.path('/' + tvsBaseType);
		});
	};
	$scope.cancel = function() {
		$location.path('/' + tvsBaseType);
	};
	
	$scope.publish = function() {
		PublishResource.get({id: tvsBaseType}, function() {
			alert("Success");
			$location.path('/' + tvsBaseType);    
		});    	
	};
});


 meApp.config(function($httpProvider) {
		$httpProvider.responseInterceptors.push(function($q, $location) {
			function success(response) {
		                return response;
			}
			function error(response) {
				if (response.status == 401)
					$location.path('/login'); // could also have a modal popup here.
                		return $q.reject(response);
			}
			return function(promise) {
				// same as above
				return promise.then(success, error);
			}
		});
	});
	

meApp.config(['$routeProvider', function($routeProvider) {
        $routeProvider
		.when('/login', {templateUrl: 'lib/common/views/login.html', controller: 'SecurityCtrl'})
		.when('/join', {templateUrl: 'lib/common/views/join.html', controller: 'SecurityCtrl'})
                .when('/logout', {controller: 'SecurityCtrl'})
                
		.when('/recipes/add/ingredient', {templateUrl: 'lib/common/views/add_ingredient.html', controller: 'ItemsCtrl'})                
                .when('/recipes/list/ingredients', {templateUrl: 'lib/common/views/list_ingredient.html', controller: 'ItemsCtrl'})  
                .when('/recipes/edit/ingredient', {templateUrl: 'lib/common/views/edit_ingredient.html', controller: 'ItemsCtrl'})                                              
		.when('/recipes/add/recipe', {templateUrl: 'lib/common/views/add_recipe.html', controller: 'ItemsCtrl'})                
                .when('/recipes/list/recipes', {templateUrl: 'lib/common/views/list_recipe.html', controller: 'ItemsCtrl'})  
                .when('/recipes/edit/recipe', {templateUrl: 'lib/common/views/edit_recipe.html', controller: 'ItemsCtrl'})                                              
                .when('/recipes/edit/', {templateUrl: 'lib/common/views/edit_recipecategory.html', controller: 'ItemsCtrl'})
       		.when('/recipes/add', {templateUrl: 'lib/common/views/add_recipecategory.html', controller: 'ItemsCtrl'})                
                .when('/recipes', {templateUrl: 'lib/common/views/list_recipecategory.html', controller: 'ItemsCtrl'})

                ;
    }]);
   
