$(function() {
    if($('#map-block').length > 0) {
        $("#map-block").height($("#map-wrapper").height());
        function initialize($) {
            var mapOptions = {
                zoom: 18,
                center: new google.maps.LatLng(48.1592513, 14.02302510000004),
                disableDefaultUI: true
            };
            var map = new google.maps.Map(document.getElementById('map-block'), mapOptions);
        }

        google.maps.event.addDomListener(window, 'load', initialize);
    }
});