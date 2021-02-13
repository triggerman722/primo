var meApp = angular.module('meapp', ['ngResource','ngRoute']);

// RESOURCES

meApp.factory('SecurityResource', function($resource) {
    return $resource('api/rest.php?path=/api/:id', {}, {
        logout: {method: 'GET'},
        join: {method: 'POST'},
        login: {method: 'POST'}
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

meApp.controller('SecurityCtrl', function($scope, SecurityResource) {
    $scope.showlogin = function() {
        angular.element('#loginmodal').modal({backdrop: 'static', show: 'true'});
        angular.element('#joinmodal').modal('hide');
    }
    $scope.login = function() {
        SecurityResource.login({id:'login'}, $scope.credential, function(data) {
            angular.element('#loginmodal').modal('hide');
        });
    };
    $scope.logout = function() {
        SecurityResource.logout({id:'logout'}, function(data) {
            angular.element('#loginmodal').modal({backdrop: 'static', show: 'true'});
        });
    };
    $scope.showjoin = function() {
        angular.element('#loginmodal').modal('hide');
        angular.element('#joinmodal').modal({backdrop: 'static', show: 'true'});
    }
        
    $scope.join = function() {
        SecurityResource.join({id:'join'}, $scope.credential, function(data) {
            angular.element('#joinmodal').modal('hide');
            angular.element('#loginmodal').modal({backdrop: 'static', show: 'true'});
        });
    };

});
meApp.controller('ItemsCtrl', function($scope, $rootScope, $location, APIResource) {


    var tvaParts = $location.path().split("/");
    
    var tvsBaseType = tvaParts[1]; //eg. locations, or products, or whatever
    
    if (tvaParts.length < 3) {
            $scope.items = APIResource.query({id:tvsBaseType});            
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
        $location.path(url);
    }
    $scope.add = function(items, url) {
        $location.path(url);        
    };
    $scope.query = function(collectiontype) {
        $scope.items = APIResource.query({id:collectiontype});
    };
    
    $scope.list = function(items, url) {
        $location.path(url);
    };

    if (tvaParts[2] === 'edit') {
    }

    if (tvaParts[2] === 'list') {
    }

    $scope.save = function(revisedItem) {    
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
    
});


meApp.config(function($httpProvider) {
    $httpProvider.responseInterceptors.push(function($q, $location) {
        function success(response) {
            return response;
        }
        function error(response) {
            if (response.status == 401)
                angular.element('#loginmodal').modal({backdrop: 'static', show: 'true'});
                return $q.reject(response);
        }
        return function(promise) {
            return promise.then(success, error);
        }
    });
});
    

meApp.config(['$routeProvider', function($routeProvider) {
        $routeProvider
        .when('/login', {templateUrl: 'lib/common/views/login.html', controller: 'SecurityCtrl'})
        .when('/join', {templateUrl: 'lib/common/views/join.html', controller: 'SecurityCtrl'})
                .when('/logout', {controller: 'SecurityCtrl'})
                
        .when('/locations/add', {templateUrl: 'lib/common/views/add_location.html', controller: 'ItemsCtrl'})
                .when('/locations/edit/', {templateUrl: 'lib/common/views/edit_location.html', controller: 'ItemsCtrl'})
                .when('/locations', {templateUrl: 'lib/common/views/list_location.html', controller: 'ItemsCtrl'})
                
                .when('/faq/add', {templateUrl: 'lib/common/views/add_faq.html', controller: 'ItemsCtrl'})
                .when('/faq/edit/', {templateUrl: 'lib/common/views/edit_faq.html', controller: 'ItemsCtrl'})
                .when('/faq', {templateUrl: 'lib/common/views/list_faq.html', controller: 'ItemsCtrl'})
                

        .when('/products/add/product', {templateUrl: 'lib/common/views/add_product.html', controller: 'ItemsCtrl'})
                .when('/products/list/products', {templateUrl: 'lib/common/views/list_product.html', controller: 'ItemsCtrl'})
                .when('/products/edit/product', {templateUrl: 'lib/common/views/edit_product.html', controller: 'ItemsCtrl'})                
                .when('/products/edit/', {templateUrl: 'lib/common/views/edit_productcategory.html', controller: 'ItemsCtrl'})
               .when('/products/add', {templateUrl: 'lib/common/views/add_productcategory.html', controller: 'ItemsCtrl'})
                .when('/products', {templateUrl: 'lib/common/views/list_productcategory.html', controller: 'ItemsCtrl'})

        .when('/recipes/add/ingredient', {templateUrl: 'lib/common/views/add_ingredient.html', controller: 'ItemsCtrl'})                
                .when('/recipes/list/ingredients', {templateUrl: 'lib/common/views/list_ingredient.html', controller: 'ItemsCtrl'})  
                .when('/recipes/edit/ingredient', {templateUrl: 'lib/common/views/edit_ingredient.html', controller: 'ItemsCtrl'})                                              

        .when('/recipes/add/recipe', {templateUrl: 'lib/common/views/add_recipe.html', controller: 'ItemsCtrl'})                
                .when('/recipes/list/recipes', {templateUrl: 'lib/common/views/list_recipe.html', controller: 'ItemsCtrl'})  
                .when('/recipes/edit/recipe', {templateUrl: 'lib/common/views/edit_recipe.html', controller: 'ItemsCtrl'})                                              
                .when('/recipes/edit/', {templateUrl: 'lib/common/views/edit_recipecategory.html', controller: 'ItemsCtrl'})
               .when('/recipes/add', {templateUrl: 'lib/common/views/add_recipecategory.html', controller: 'ItemsCtrl'})                
                .when('/recipes', {templateUrl: 'lib/common/views/list_recipecategory.html', controller: 'ItemsCtrl'})

        .when('/contacts/add/phonenumber', {templateUrl: 'lib/common/views/add_phonenumber.html', controller: 'ItemsCtrl'})
                .when('/contacts/list/phonenumbers', {templateUrl: 'lib/common/views/list_phonenumber.html', controller: 'ItemsCtrl'})  
                .when('/contacts/edit/phonenumber', {templateUrl: 'lib/common/views/edit_phonenumber.html', controller: 'ItemsCtrl'})           

        .when('/contacts/add/emailaddress', {templateUrl: 'lib/common/views/add_emailaddress.html', controller: 'ItemsCtrl'})
                .when('/contacts/list/emailaddresses', {templateUrl: 'lib/common/views/list_emailaddress.html', controller: 'ItemsCtrl'})  
                .when('/contacts/edit/emailaddress', {templateUrl: 'lib/common/views/edit_emailaddress.html', controller: 'ItemsCtrl'})           

        .when('/contacts/add/postaladdress', {templateUrl: 'lib/common/views/add_postaladdress.html', controller: 'ItemsCtrl'})
                .when('/contacts/list/postaladdresses', {templateUrl: 'lib/common/views/list_postaladdress.html', controller: 'ItemsCtrl'})  
                .when('/contacts/edit/postaladdress', {templateUrl: 'lib/common/views/edit_postaladdress.html', controller: 'ItemsCtrl'})           

        .when('/contacts/add/contact', {templateUrl: 'lib/common/views/add_contact.html', controller: 'ItemsCtrl'})                
                .when('/contacts/list/contacts', {templateUrl: 'lib/common/views/list_contact.html', controller: 'ItemsCtrl'})  
                .when('/contacts/edit/contact', {templateUrl: 'lib/common/views/edit_contact.html', controller: 'ItemsCtrl'})                                              
        .when('/contacts/edit/', {templateUrl: 'lib/common/views/edit_contactcategory.html', controller: 'ItemsCtrl'})        
               .when('/contacts/add', {templateUrl: 'lib/common/views/add_contactcategory.html', controller: 'ItemsCtrl'})                          
                .when('/contacts', {templateUrl: 'lib/common/views/list_contactcategory.html', controller: 'ItemsCtrl'})   
                                
                .when('/pushnotifications/add', {templateUrl: 'lib/common/views/add_pushnotification.html', controller: 'ItemsCtrl'})
                .when('/pushnotifications/edit/', {templateUrl: 'lib/common/views/edit_pushnotification.html', controller: 'ItemsCtrl'})
                .when('/pushnotifications', {templateUrl: 'lib/common/views/list_pushnotification.html', controller: 'ItemsCtrl'})             

                ;
    }]);
   
