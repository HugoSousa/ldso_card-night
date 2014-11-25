var app = angular.module('controllers', []);


//used to control alerts
function RootCtrl($rootScope, $location, alertService) {
  $rootScope.changeView = function(view) {
    $location.path(view);
  }
  // root binding for alertService
  $rootScope.closeAlert = alertService.closeAlert; 
}
RootCtrl.$inject = ['$scope', '$location', 'alertService'];



app.controller('SidebarCtrl', function($scope, $state){

    $scope.toggleSidebar = false;

    $scope.toggle =  function(e){
        //e.preventDefault();
        //document.getElementById('wrapper').toggleClass("toggled");
        $scope.toggleSidebar = !$scope.toggleSidebar;
        
        
    };

});


app.controller('IncomingOrdersCtrl', function($scope, $state, Restangular,alertService){

    $scope.ordered = 'ordered';
    $scope.notified = 'notified';
    $scope.orders = null;
	alertService.clear();

    $scope.showOrder = function(order){
        return order.orderstate === $scope.ordered || order.orderstate === $scope.notified;
    };
	
    Restangular.one('incomingorders').getList(1).then(function(data){
        $scope.orders = data;
    }), function(data){
        console.log("Error");
    };

    $scope.removeOrder = function(orderid){
        console.log("Remove Order Function");
        var index = -1;

        for( var i = 0; i < $scope.orders.length; i++ ) {
            if( $scope.orders[i].ordersid === orderid ) {
                index = i;
                break;
            }
        }

        if(index == -1)
            console.log("Error. Order not found.");
        else
            $scope.orders.splice(index, 1);
    }


    $scope.notifyOrder = function(orderid){
        console.log("Notify Order Function");

        var notify_order = {"orderid": orderid};
        console.log(notify_order);
        Restangular.all('notify').post(notify_order).then(function(resp){
            for( var i = 0; i < $scope.orders.length; i++ ) {
                if( $scope.orders[i].ordersid === orderid ) {
                    $scope.orders[i].orderstate = 'notified';
                    break;
                }
            }
            console.log("User notifed");
        }, function(resp){
            console.log("Error notifying user");
        });


    };
});

app.controller('ProductsCtrl', function($scope, $stateParams, Restangular,alertService, ShareUser) {
	
    //hardcoded establishment id=1
    var products = Restangular.one('products').getList(ShareUser.getUser().establishmentid).then(function(data){
        $scope.products = data;
    })
	
	$scope.addProduct=function()
	  {
	   $state.go("product-add");
	   alertService.clear();
	  }
	
});

app.controller('ProductAdd', function($state, $scope, $stateParams,Restangular,$scope, $modal) {
		
		
		$scope.open = function (size) {
			$scope.modalInstance = $modal.open({
			templateUrl: 'confirmAdd.html',
			controller: 'ProductAddConfirm',
			size: size,
			scope: $scope
			});
		};
});


app.controller('ProductAddConfirm', function($state, $scope, $stateParams,Restangular, $modalInstance,alertService){

	alertService.clear();
	$scope.cancel = function () {
			 $modalInstance.dismiss('cancel');
		};
		
	$scope.addProduct=function()
		  {
			console.log($scope.product);
		   
		   var body= {"establishmentid": 1,"categoryid":$scope.product.categoryid,
		   "name":$scope.product.name,"price":$scope.product.price,"description":$scope.product.description};
		   
		   console.log('teste');
		   
			var teste =Restangular.all('add-product').post(body).then(function (resp){
				console.log("ok-");
				console.log(resp);
				$modalInstance.dismiss('cancel');
				alertService.add('success', 'Product added successfully');
				$state.go("products");
		  }); 
	  }		
})

app.controller('ProductCtrl', function($state, $scope, $stateParams,Restangular,$modal,alertService) {
  
	alertService.clear();
    var product = Restangular.one('product', $stateParams.productId).get().then(function(data){
        $scope.product = data[0];
		console.log($scope.product);
      })
	  
	  $scope.openEdit = function (size) {
			console.log("edit");
			$scope.modalInstance = $modal.open({
			templateUrl: 'confirmEdit.html',
			controller: 'ProductEditConfirm',
			size: size,
			scope: $scope
			});
		};
		
		$scope.openDelete = function (size) {
			$scope.modalInstance = $modal.open({
			templateUrl: 'confirmDelete.html',
			controller: 'ProductDeleteConfirm',
			size: size,
			scope: $scope
			});
		};

	  
});

app.controller('ProductDeleteConfirm', function($state, $scope, $stateParams,Restangular, $modalInstance,alertService){
	$scope.cancel = function () {
			 $modalInstance.dismiss('cancel');
		};  
	  $scope.deleteProduct=function()
	  {
		   console.log($scope.product.productid);
		   var productid = {"productid": $scope.product.productid};
		   
			var teste =Restangular.all('delete-product').post(productid).then(function (resp){
				console.log("ok");
				console.log(resp);
				$modalInstance.dismiss('cancel');
				alertService.add('success', 'Product deleted successfully');
				$state.go("products");
			});
	  }
	  	
})

app.controller('ProductEditConfirm', function($state, $scope, $stateParams,Restangular, $modalInstance, alertService){
	$scope.cancel = function () {
			 $modalInstance.dismiss('cancel');
		};
		
	$scope.editProduct=function()
	  {
		   console.log($scope.product);

		   var body= {"productid": $scope.product.productid,"categoryid":$scope.product.categoryid,
		   "name":$scope.product.name,"price":$scope.product.price,"description":$scope.product.description};
		   
			var test =Restangular.all('edit-product').post(body).then(function (resp){
				console.log("ok");
				console.log(resp);
				$modalInstance.dismiss('cancel');
				 alertService.add('success', 'Product edited successfully');
				$state.go("products");
		  }); 
	  }
});

app.controller('CustomersCtrl', function($state, $scope, $stateParams, Restangular) {

	var customer = Restangular.one('customer').getList(2).then(function(data){
		$scope.customers=data;
	})

});

app.controller('LoginCtrl', function($scope, $state, Restangular, AuthService, ShareUser) {

	$scope.submitted= false;
	
	$scope.invalidInput= false;
	
	$scope.loginSubmit = function() {
 		
		var userStructure= {"username": $scope.user.username, "password": $scope.user.password};
		
        Restangular.all('login').post(userStructure).then(function (resp){

            AuthService.login(resp.user, resp.access_token);
							
			$scope.submitted= true;
			
			if(resp.user.permission)
			{
				if(resp.user.permission == "manager" || resp.user.permission  == "employee")
				{
					
					ShareUser.setUser(resp.user);
            
					$state.go('incoming-orders');
				}
				else
				{
					$scope.invalidInput= true;			
            
					var error = "";
					if(resp.status == 0)
						error = "Please check your Internet connection.";
					else if(resp.status == 401)
						error = resp.data.error;
					else
						error = "Something went wrong.";
				}
			}
			else
			{
				$scope.invalidInput= true;
			
				var error = "";
				if(resp.status == 0)
					error = "Please check your Internet connection.";
				else if(resp.status == 401)
					error = resp.data.error;
				else
					error = "Something went wrong.";
			
			}			
			
        }, function(resp){
		
			$scope.invalidInput= true;
			
            var error = "";
            if(resp.status == 0)
                error = "Please check your Internet connection.";
            else if(resp.status == 401)
                error = resp.data.error;
            else
                error = "Something went wrong.";
        });
	
	
	}
	
});

