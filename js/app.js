// app.js
// create angular app and inject ngAnimate and ui-router 
// =============================================================================
var tsacApp = angular.module('tsacApp', ['flash', 'ngAnimate', 'ui.router']);

// configuring our routes 
// =============================================================================
tsacApp.config(function ($stateProvider, $urlRouterProvider) {

    $stateProvider

    // route to show our basic form (/form)  this is necessary for stateProvider to route to other form-xxxx.html
        .state('form', {
            url: '/form',
            templateUrl: 'form.html',
            controller: 'formController'
        })

        // nested states
        // each of these sections will have their own view
        // url will be nested (/form/abstract)
        .state('form.abstract', {
            url: '/abstract',
            templateUrl: 'form-abstract.html'
        })


        // url will be /form/profile
        .state('form.profile', {
            url: '/profile',
            templateUrl: 'form-profile.html'
        })

        // url will be /form/transaction/resale or ~/rental
        // 4 level nested state
        .state('form.transaction', {            //this is necessary for stateProvider to route to .transaction.resale/tental
            url: '/transaction',
            templateUrl: 'form-transaction.html'
        })
        .state('form.transaction.resale', {
            url: '/resale',
            templateUrl: 'resale.html'
        })
        .state('form.transaction.rental', {
            url: '/rental',
            templateUrl: 'rental.html'
        })

        // url will be /form/customer
        .state('form.customer', {
            url: '/customer',
            templateUrl: 'form-customer.html'
        })

        // url will be /form/cobroker
        .state('form.cobroker', {
            url: '/cobroker',
            templateUrl: 'form-cobroker.html'
        })

        // url will be /form/cobroker
        .state('form.billing', {
            url: '/billing',
            templateUrl: 'form-billing.html'
        });

    // catch all route
    // send users to the form page 
    $urlRouterProvider.otherwise('/form/abstract');
});

// our controller for the form
// =============================================================================
tsacApp.controller('formController', ['$rootScope', '$scope', 'Flash', function ($rootScope, $scope, Flash) {
    //declare form data
    $scope.formData = {};
    //declare new object entry input holder
    $scope.newEntry = {};
    //for edit mode
    $scope.editEnabled = false;
    //edit input holder
    $scope.editing = {};

    //declare and initialize respective form data
    $scope.customers = [];
    $scope.formData.customers = $scope.customers;

    $scope.cobrokers = [];
    $scope.formData.cobrokers = $scope.cobrokers;

    $scope.billings = [];
    $scope.formData.billings = $scope.billings;

    //submit form for ng-submit
    $scope.processForm = function () {
        alert('submitted!');
    };

    //generic add new object
    $scope.newObject = function (array) {
        var newObj = $scope.newEntry;
        array.push(newObj);
        $scope.newEntry = {};
    };

    //generic edit of an object in an array
    $scope.editObject = function (array, index) {
        array[index] = $scope.editing;
        $scope.editing = {};
    };

    //generic generate preview data when edit of an object in an array
    $scope.editPreview = function (array, index) {
        $scope.editing = array[index];
    };

    //generic removal of an object in an array
    $scope.remove = function (array, index) {
        array.splice(index, 1);
    };

    //Successfully save message
    $scope.alertMessage = function (index) {
        var message = "";
        if (index == 1) {
            message = '<strong>Done!</strong> Successful.';
            Flash.create('success', message);
        } else if (index == 2){
            message = '<strong>Oops!</strong> There is an error.';
            Flash.create('danger', message);
        } else if (index == 3){
            message = '<strong>Warning!</strong> Be careful of what you are doing.';
            Flash.create('warning', message);
        } else if (index == 4){
            message = '<strong>Attention!</strong> Please be reminded the changes you just made.';
            Flash.create('info', message);
        } else if (index == 5){
            Flash.pause();
        }
    };

}]);


//flash app to be included in the tsacApp
(function () {
    'use strict';
    var app = angular.module('flash', []);

    app.run(function ($rootScope) {
        // initialize variables
        $rootScope.flash = {};
        $rootScope.flash.text = '';
        $rootScope.flash.type = '';
        $rootScope.flash.timeout = 5000;
        $rootScope.hasFlash = false;
    });

    // Directive for compiling dynamic html
    app.directive('dynamic', function ($compile) {
        return {
            restrict: 'A',
            replace: true,
            link: function (scope, ele, attrs) {
                scope.$watch(attrs.dynamic, function (html) {
                    ele.html(html);
                    $compile(ele.contents())(scope);
                });
            }
        };
    });

    // Directive for closing the flash message
    app.directive('closeFlash', function ($compile, Flash) {
        return {
            link: function (scope, ele) {
                ele.on('click', function () {
                    Flash.dismiss();
                });
            }
        };
    });

    // Create flashMessage directive
    app.directive('flashMessage', function ($compile, $rootScope) {
        return {
            restrict: 'A',
            template: '<div role="alert" ng-show="hasFlash" class="alert {{flash.addClass}} alert-{{flash.type}} alert-dismissible ng-hide alertIn alertOut "> <span dynamic="flash.text"></span> <button type="button" class="close" close-flash><span aria-hidden="true">&times;</span><span class="sr-only">Close</span></button> </div>',
            link: function (scope, ele, attrs) {
                // get timeout value from directive attribute and set to flash timeout
                $rootScope.flash.timeout = parseInt(attrs.flashMessage, 10);
            }
        };
    });

    app.factory('Flash', ['$rootScope', '$timeout',
        function ($rootScope, $timeout) {

            var dataFactory = {},
                timeOut;

            // Create flash message
            dataFactory.create = function (type, text, addClass) {
                var $this = this;
                $timeout.cancel(timeOut);
                $rootScope.flash.type = type;
                $rootScope.flash.text = text;
                $rootScope.flash.addClass = addClass;
                $timeout(function () {
                    $rootScope.hasFlash = true;
                }, 100);
                timeOut = $timeout(function () {
                    $this.dismiss();
                }, $rootScope.flash.timeout);
            };

            // Cancel flashmessage timeout function
            dataFactory.pause = function () {
                $timeout.cancel(timeOut);
            };

            // Dismiss flash message
            dataFactory.dismiss = function () {
                $timeout.cancel(timeOut);
                $timeout(function () {
                    $rootScope.hasFlash = false;
                });
            };
            return dataFactory;
        }
    ]);
}());