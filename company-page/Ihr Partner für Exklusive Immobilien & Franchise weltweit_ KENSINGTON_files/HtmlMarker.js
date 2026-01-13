/**
 *
 * @param latlng
 * @param map
 * @param args
 * @constructor
 */
function HtmlMarker(latlng, map, args) {
	this.latlng = latlng;
	this.args = args;
	this.setMap(map);
}
HtmlMarker.prototype = new google.maps.OverlayView();
HtmlMarker.prototype.draw = function() {
	var self = this;
	var div = this.div;
	if (!div) {
		div = this.div = document.createElement('div');
		div.id = this.args.id;
		div.className = this.args.class;
		div.innerHTML = this.args.innerHTML;
		if (typeof(self.args.marker_id) !== 'undefined') {
			div.dataset.marker_id = self.args.marker_id;
		}
		div.addEventListener( "click", function(event) {
			google.maps.event.trigger(self, "click");
		});
		div.addEventListener( "mouseover", function(event) {
			google.maps.event.trigger(self, "mouseover");
		});
		div.addEventListener( "mouseout", function(event) {
			google.maps.event.trigger(self, "mouseout");
		});
		var panes = this.getPanes();
		panes.overlayImage.appendChild(div);
	}
	this.setPosition(this.latlng);
};
HtmlMarker.prototype.remove = function() {
	if (this.div) {
		this.div.parentNode.removeChild(this.div);
		this.div = null;
	}
};
HtmlMarker.prototype.getPosition = function() {
	return this.latlng;
};
HtmlMarker.prototype.setPosition = function(latlng) {
	var point = this.getProjection().fromLatLngToDivPixel(latlng);
	if (point) {
		var marker = jQuery('#' + this.args.id);
		var div = marker.closest('div');
		var markerWidth = this.args.width;
		var markerHeight = this.args.height;
		if(this.args.position === 'CC') {
			div.css('left', (point.x - markerWidth / 2) + 'px');
			div.css('top', (point.y - markerHeight / 2) + 'px');
		}
		else if(this.args.position === 'CT') {
			div.css('left', (point.x - markerWidth / 2) + 'px');
			div.css('top', (point.y - markerHeight) + 'px');
		}
	}
};

/*
HtmlMarker.prototype.onAdd = function()
{
	console.log('onAdd');
};

HtmlMarker.prototype.onRemove = function()
{
	console.log('onRemove');
};
HtmlMarker.prototype.setVisible = function(visible)
{
	console.log('setVisible');
	// set display block or hidden
};


// Set the visibility to 'hidden' or 'visible'.
HtmlMarker.prototype.hide = function() {
	console.log('hide');
	if (this.div_) {
		// The visibility property must be a string enclosed in quotes.
		this.div_.style.visibility = 'hidden';
	}
};

HtmlMarker.prototype.show = function() {
	console.log('show');
	if (this.div_) {
		this.div_.style.visibility = 'visible';
	}
};

HtmlMarker.prototype.toggle = function() {
	console.log('toggle');
	if (this.div_) {
		if (this.div_.style.visibility === 'hidden') {
			this.show();
		} else {
			this.hide();
		}
	}
};

// Detach the map from the DOM via toggleDOM().
// Note that if we later reattach the map, it will be visible again,
// because the containing <div> is recreated in the overlay's onAdd() method.
HtmlMarker.prototype.toggleDOM = function() {
	console.log('toggleDOM');
	if (this.getMap()) {
		// Note: setMap(null) calls OverlayView.onRemove()
		this.setMap(null);
	} else {
		this.setMap(this.map_);
	}
};
*/
