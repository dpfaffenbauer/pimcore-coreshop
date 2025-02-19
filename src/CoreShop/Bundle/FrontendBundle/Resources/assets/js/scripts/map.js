document.addEventListener('DOMContentLoaded', function () {
    const mapBlock = document.getElementById('map-block');

    if (mapBlock) {
        mapBlock.style.height = document.getElementById('map-wrapper').clientHeight + 'px';

        function initialize() {
            const mapOptions = {
                zoom: 18,
                center: new google.maps.LatLng(48.1592513, 14.02302510000004),
                disableDefaultUI: true
            };
            const mapNew = new google.maps.Map(mapBlock, mapOptions);
            console.log(mapNew);
        }

        window.addEventListener('load', initialize);
    }
});
