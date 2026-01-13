var openImmo = openImmo || {};
openImmo.radiusSearch = {
    autocomplete: null,
    locationField: null,
    initAutocomplete: function() {
        locationField = jQuery('#search-location-input');

        // Location
        if (locationField.length === 1) {
            locationAutoComplete = new google.maps.places.Autocomplete(locationField[0], {
    types: ['geocode'],
    componentRestrictions: { country: ['de', 'es', 'ch', 'gb'] }  // Einschränkung auf Deutschland
});


            // When the user selects an address from the dropdown, populate the address fields in the form.
            locationAutoComplete.addListener('place_changed', function () {
                // Get the place details from the autocomplete object.
                var place = locationAutoComplete.getPlace();
                if (typeof place.geometry !== 'undefined') {
                    latitude = place.geometry.location.lat();
                    longitude = place.geometry.location.lng();
                } else {
                    latitude = 0.0;
                    longitude = 0.0;
                }

                // Insert into HTML fields.
                jQuery('#address-latitude-field').val(latitude);
                jQuery('#address-longitude-field').val(longitude);
            });

            // Get geo location on enter
            locationField.on('keydown', function (event) {
                if (event.keyCode === 13) {

                    jQuery(event.target).blur();
                    var firstResult = '';
                    var firstItemText = jQuery('.pac-container .pac-item:first span:eq(3)').text();
                    if (firstItemText === '') {
                        firstResult = jQuery('.pac-container .pac-item:first .pac-item-query').text();
                    } else {
                        firstResult = jQuery('.pac-container .pac-item:first .pac-item-query').text() + ', ' + firstItemText;
                    }

                    var geocoder = new google.maps.Geocoder();
                    geocoder.geocode({'address': firstResult}, function (results, status) {
                        if (status === google.maps.GeocoderStatus.OK) {
                            place = results[0];
                            event.target.value = firstResult;
                            if (typeof place.geometry !== 'undefined') {
                                latitude = place.geometry.location.lat();
                                longitude = place.geometry.location.lng();
                            } else {
                                latitude = 0.0;
                                longitude = 0.0;
                            }
                            jQuery('#address-latitude-field').val(latitude);
                            jQuery('#address-longitude-field').val(longitude);
                        }
                    });
                }
            });
        }
    }
}

jQuery(document).ready(function () {
    if(typeof google !== 'undefined') {
        if (typeof google.maps !== 'undefined') {
            openImmo.radiusSearch.initAutocomplete();
        }
    }
});
