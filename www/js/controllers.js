//Global var, the current 10 matches
var matches;

angular.module('starter.controllers', ['ngCordova' ,'ngCordovaOauth'])

  .controller('LoginCtrl',function($scope, $cordovaOauth,$state){
    $scope.login = function() {
      //console.log("something called");
      $cordovaOauth.linkedin('75raqzxpgqo73n','hLVHrUKJRsBNSfAG',['r_basicprofile'],'spaghettiandmeatballs248').then(function(result) {
        $.get("https://api.linkedin.com/v1/people/~:(id,location,formatted-name,industry,summary,specialties,positions,headline,picture-urls::(original),picture-url,interests,languages,skills,date-of-birth)?oauth2_access_token=" + result.access_token + "&format=json", {}, function(data)
        	{
	        	$.post("http://kawaiikrew.net/www/php/login.php", 
	        	{  formattedName:data.formattedName,
		           id:data.id,
		           headline:data.headline,
		           pictureUrl:data.pictureUrl,
		           pictureUrls:data.pictureUrls,
		           industry:data.industry,
		           positions:data.positions,
		           summary:data.summary
	        	}, function(returnMessage)
	        	{
		        	if (returnMessage == "connect")
		        	{
			        	$state.go("tab.connect");
		        	}
		        	else if (returnMessage == "setup")
		        	{
			        	//test
			        	$state.go("setup");
		        	}
	        	});
        	});
        //$state.go("tab.connect");
      }, function(error) {
        console.log(error);
      });
    }
  })

  .controller('ConnectTabCtrl', function($scope, $state) {
    console.log('ConnectTabCtrl');  
	$scope.trips = [];

    $.get("http://kawaiikrew.net/www/php/get_trips.php", {}, function(data) {
      var parsed = JSON.parse(data);
      if (parsed.length == 1)
      {
        var connectEmpty = document.getElementById("ty-connect-empty");
        connectEmpty.style.visibility = "visible";
      }

      for(var i = 0; i < parsed.length; i++)
      {
        var obj = parsed[i];
        var fullPlaceName = obj.city + ", " + obj.country;
        if (obj.startDate == null)
        {
          $scope.trips.push(
            {
	          id:obj.id,  
              displayString:fullPlaceName,
              tripClass:"ty-trip-icon ty-hometown ty-vertical",
              icon:"ty-vertical icon ion-heart",
              dateString:"Hometown",
              backgroundImage:obj.backgroundImage
            });  
        }
        else
        {
          $scope.trips.push(
            {
	          id:obj.id,
              displayString:fullPlaceName,
              tripClass:"ty-trip-icon ty-trip ty-vertical",
              icon:"ty-vertical icon ion-plane",
              dateString:convertDate(obj.startDate) + " - " + convertDate(obj.endDate),
              backgroundImage:obj.backgroundImage
            });
        }
      }
      $scope.$digest();
    });
    
    $scope.goToMatch = function(type, id) {
	    var key = id;
        if (type != "Hometown")
        {
            type = "Travel";
        }
        else
        {
	        key = "user";
        }
	    matches = [];
	    $.get("http://kawaiikrew.net/www/php/match.php", 
	    {
            type:type,
            key:key
	    }, function(data){
		  matches = JSON.parse(data);
		  if (matches.length == 0)
		  {
		      $state.go('tab.connect_empty');
		  }
		  else
		  {
		      $state.go("tab.user_profile");
		  }
	    })
    }
  })

  .controller('MessagesTabCtrl', function($scope) {
    console.log('MessagesTabCtrl');
  })

  .controller('CalendarTabCtrl', function($scope) {
    console.log('CalendarTabCtrl');
  })
  
  .controller('MakeMeetingCtrl', function($scope, $state) {
	  console.log('MakeMeetingCtrl');
	  $scope.trips = [];
	  $scope.friends = [];
	  $scope.picture;
	  $scope.name;
	  var trips = document.getElementById('trips-list');
	  var friends = document.getElementById('friendlist');
	  var meeting = document.getElementById('add-meeting');
	  var friendID;
	  
	  trips.style.display = "block";
	  friends.style.display = "none";
	  meeting.style.display = "none";
	  
	  $.get("http://kawaiikrew.net/www/php/get_trips.php", {}, function(data) 
	  {
	      var parsed = JSON.parse(data);
	      if (parsed.length == 1)
	      {
	        var connectEmpty = document.getElementById("ty-connect-empty");
	        connectEmpty.style.visibility = "visible";
	      }
		  else
		  {
		  	for(var i = 1; i < parsed.length; i++)
		  	{
		  		var obj = parsed[i];
		  		var fullPlaceName = obj.city + ", " + obj.country;
		        $scope.trips.push(
		        {
			      id:obj.id,
	              displayString:fullPlaceName,
	              tripClass:"ty-trip-icon ty-trip ty-vertical",
	              icon:"ty-vertical icon ion-plane",
	              dateString:convertDate(obj.startDate) + " - " + convertDate(obj.endDate),
	              backgroundImage:obj.backgroundImage
		        });
	        }
	        $scope.$digest();
		  }
	  });
	  
	  $scope.goToFriends = function(id)
	  {
		  trips.style.display = "none";
		  friends.style.display = "block";
		  meeting.style.display = "none";
		  
		  $.get("http://kawaiikrew.net/www/php/get_friends.php", {trip:id}, function(friendData)
		  {
			 var parsedFriends = JSON.parse(friendData);
			 for (var i = 0; i < parsedFriends.length; i++)
			 {
				 var friend = parsedFriends[i];
				 $scope.friends.push({
					 id:friend.id,
					 name:friend.name,
					 picFull:friend.picFull 
				 });
			 }
			 
			 $scope.$digest(); 
		  });
	  }
	  
	  $scope.goToPlan = function(id, name, picture)
	  {
		  trips.style.display = "none";
		  friends.style.display = "none";
		  meeting.style.display = "block";
		  
		  $scope.name = name;
		  $scope.picture = picture;
		  
		  friendID = id;
	  }
	  
	  $scope.makeMeeting = function()
	  {
		  var date = document.getElementById('date').value;
		  var time = document.getElementById('time').value;
		  var place = document.getElementById('place').value;
		  
		  $.post("http://kawaiikrew.net/www/php/add_meeting.php", 
		  {
			  date:date,
			  time:time,
			  place:place,
			  userId:friendID
		  }, function (data)
		  {
		  	alert(data);
		  	if (data == "Success")
		  	{
			  	$state.go('tab.calendar');
		  	}
		  });
	  }
  })

  .controller('SetupTabCtrl', function($scope, $state) {
    console.log('SetupTabCtrl');
    var city;
    var country;
    var preferences;
    var favoriteFoods;
    var languages;
    var bio;
    
    var firstPage = document.getElementById('ty-setup-step-1');
    var secondPage = document.getElementById('ty-setup-step-2');
    var thirdPage = document.getElementById('ty-setup-step-3');
    
    $scope.firstToSecondPage = function() {
	    var location = document.getElementById('hometownTextField');
	    var locationSplit = (location.value).split(", ");
	    city = locationSplit[0];
	    country = locationSplit[1];
	    firstPage.style.display = "none";
	    secondPage.style.display = "block";
	    thirdPage.style.display = "none";
    }
    
    $scope.secondToThirdPage = function() {
	    preferences = document.getElementById('ty-pref1').value;
	    firstPage.style.display = "none";
	    secondPage.style.display = "none";
	    thirdPage.style.display = "block";
    }
    
    $scope.secondToFirstPage = function() {
	  	firstPage.style.display = "block";
	    secondPage.style.display = "none";
	    thirdPage.style.display = "none"; 
    }
    
    $scope.thirdToSecondPage = function() {
	    firstPage.style.display = "none";
	    secondPage.style.display = "block";
	    thirdPage.style.display = "none";
    }
    
    $scope.finish = function(){
	    favoriteFoods = document.getElementById('favFoods').value;
	    bio = document.getElementById('ty-about-input').value;
	    if (bio.length > 140)
	    {
		    alert("Please enter a bio less than 140 characters. Your current bio has " + bio.length + " characters");
		    return;
	    }
	    languages = document.getElementById('ty-language-input').value;
	    
	    $.post("http://kawaiikrew.net/www/php/add_profile_info.php", 
	    {
		    bio:bio,
		    city:city,
		    country:country,
		    preferences:preferences,
		    languages:languages,
		    favoriteFoods:favoriteFoods
	    }, function(data) 
	    {
		    if (data=="Success")
		    {
				$state.go("tab.connect");
			}
	    });
    }
    
    //TODO: figure out a way to get autocomplete for this
    /*autocomplete = new google.maps.places.Autocomplete(
      (document.getElementById('hometownTextField')),
      {types: ['(cities)']});
    google.maps.event.addListener(autocomplete, 'place_changed', function()
    {
      var place = autocomplete.getPlace();
      for (var i = 0; i < place.address_components.length; i++) {
        var addressType = place.address_components[i].types[0];
        if (addressType == 'locality')
        {
          var val = place.address_components[i]['long_name'];
          alert("adding city of " + val);
          city = val;
        }
        if (addressType == 'country')
        {
          var val = place.address_components[i]['long_name'];
          alert("Adding country of " + val);
          country = val;
        }
      }
    })*/
  })

  .controller('NewTripTabCtrl', function($scope, $state) {
    console.log('NewTripTabCtrl');
    
	$scope.makeTrip = function() {
		var location = document.getElementById('cityTextField').value;
		var locationSplit = location.split(", ");
	    var city = locationSplit[0];
	    var country = locationSplit[1];
	    var startDate = document.getElementById('start-date').value;
	    var endDate = document.getElementById('end-date').value;
	    if (startDate != null && endDate != null)
	    {
		    $.post("http://kawaiikrew.net/www/php/add_trip.php", 
		    {
			    Start:startDate,
			    End:endDate,
			    Country:country,
			    City:city
		    },
		    function(data)
		    {
			    if (data == "Successfully inserted")
			    {
				    $state.go('tab.connect');
			    }
		    });
	    }
	    else
	    {
		    //TODO: print error message
	    }
	}

    /*autocomplete = new google.maps.places.Autocomplete(
      (document.getElementById('cityTextField')),
      {types: ['(cities)']});
    google.maps.event.addListener(autocomplete, 'place_changed', function()
    {
      var place = autocomplete.getPlace();
      for (var i = 0; i < place.address_components.length; i++) {
        var addressType = place.address_components[i].types[0];
        if (addressType == 'locality')
        {
          var val = place.address_components[i]['long_name'];
          alert("adding city of " + val);
          city = val;
        }
        if (addressType == 'country')
        {
          var val = place.address_components[i]['long_name'];
          alert("Adding country of " + val);
          country = val;
        }
      }
    })*/
  })

  .controller('MatchCtrl', function($scope, $state) {
	  console.log("MatchCtrl");
	  var profilePage = document.getElementById('user-profile');
	  var buttons = document.getElementById('acceptreject');
	  var emptyPage = document.getElementById('empty');
	  profilePage.style.display = "block";
	  buttons.style.display = "block";
	  emptyPage.style.display = "none";

	  if (matches.length == 0)
	  {
		  alert("No users, go to no users found page");
	  }
	  else
	  {
	  	  var user = matches[0];
		  $scope.name = user.name;
	      fullName = (user.name).split(" ");
	      $scope.firstName = fullName[0];
	      $scope.headline = user.headline;
	      $scope.hometown = user.city + ", " + user.country;
	      $scope.bio = user.bio;
	      $scope.picFull = user.picFull;
	      $scope.favoriteFoods = user.favoriteFoods;
	      $scope.languages = user.languages;  
	  }
      
      $scope.accept = function(){
	      matches.shift();
	      if (matches.length == 0)
	      {
		    profilePage.style.display = "none";
			buttons.style.display = "none";
			emptyPage.style.display = "block";
		    return;
	      }
	      user = matches[0];
		  $scope.name = user.name;
	      fullName = (user.name).split(" ");
	      $scope.firstName = fullName[0];
	      $scope.headline = user.headline;
	      $scope.hometown = user.city + ", " + user.country;
	      $scope.bio = user.bio;
	      $scope.picFull = user.picFull;
	      $scope.favoriteFoods = user.favoriteFoods;
	      $scope.languages = user.languages;
	      $scope.$digest();
      }
      
      $scope.reject = function(){
	      matches.shift();
	      if (matches.length == 0)
	      {
		      profilePage.style.display = "none";
			  buttons.style.display = "none";
			  emptyPage.style.display = "block";
		      return;
	      }
	      user = matches[0];
		  $scope.name = user.name;
	      fullName = (user.name).split(" ");
	      $scope.firstName = fullName[0];
	      $scope.headline = user.headline;
	      $scope.hometown = user.city + ", " + user.country;
	      $scope.bio = user.bio;
	      $scope.picFull = user.picFull;
	      $scope.favoriteFoods = user.favoriteFoods;
	      $scope.languages = user.languages;
	      $scope.$digest();
      }
      
  })

  .controller('EditProfileCtrl', function($scope, $state) {
	console.log('EditProfileCtrl');
	$scope.update = function() {
		$.get("http://kawaiikrew.net/www/php/get_user_data.php", {}, function(data)
		{
			var user = JSON.parse(data);
			var favoriteFoods = user.favoriteFoods;
			var bio = user.bio;
			var languages = user.languages;
			var city = user.city;
			var country = user.country;
			var preferences = user.preferences;
			
			if (document.getElementById('cityTextField').value != "")
			{
				var location = (document.getElementById('cityTextField').value).split(", ");
				city = location[0];
				country = location[1];	
			}
			if (document.getElementById('favoriteFoodsTextField').value != "")
			{
				favoriteFoods = document.getElementById('favoriteFoodsTextField').value;
			}
			if (document.getElementById('ty-language-input').value != "")
			{
				languages = document.getElementById('ty-language-input').value;
			}
			if (document.getElementById('ty-about-input').value != "")
			{
				bio = document.getElementById('ty-about-input').value;
			}
			
			$.post("http://kawaiikrew.net/www/php/add_profile_info.php", 
			{
				bio:bio,
				city:city,
				country:country,
				preferences:preferences,
				languages:languages,
				favoriteFoods:favoriteFoods
			}, function(data) 
			{
				if (data=="Success")
				{
					$state.go("tab.me");
				}
			});
	    });
	}
  })

  .controller('MeTabCtrl', function($scope) {
    console.log('MeTabCtrl');
    $.get("http://kawaiikrew.net/www/php/get_user_data.php", {}, function(data)
    {
      var user = JSON.parse(data);
      $scope.name = user.name;
      fullName = (user.name).split(" ");
      $scope.firstName = fullName[0];
      $scope.headline = user.headline;
      $scope.hometown = user.city + ", " + user.country;
      $scope.bio = user.bio;
      $scope.picFull = user.picFull;
      $scope.favoriteFoods = user.favoriteFoods;
      $scope.languages = user.languages;
      $scope.$digest();
    });
  })

//In the connect controller, convert the sql date string in the format yyyy-mm-dd to a more readable format
function convertDate(initial)
{
  values = initial.split("-");
  switch(values[1])
  {
    case '01':
      return "Jan " + values[2];
      break;
    case '02':
      return "Feb " + values[2];
      break;
    case '03':
      return "Mar " + values[2];
      break;
    case '04':
      return "Apr " + values[2];
      break;
    case '05':
      return "May " + values[2];
      break;
    case '06':
      return "Jun " + values[2];
      break;
    case '07':
      return "Jul " + values[2];
      break;
    case '08':
      return "Aug " + values[2];
      break;
    case '09':
      return "Sep " + values[2];
      break;
    case '10':
      return "Oct " + values[2];
      break;
    case '11':
      return "Nov " + values[2];
      break;
    case '12':
      return "Dec " + values[2];
      break;
  }
}
