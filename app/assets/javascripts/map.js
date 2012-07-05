(function(TT, S) {
	var _map,
		_directions,
		_bounds;

	function _latLng(lat, lon) {
		if(typeof lat === 'object') {
			return new google.maps.LatLng(lat.lat, lat.lon);
		} else {
			return new google.maps.LatLng(lat, lon);
		}
	}

	function _addMarker(location) {
		var marker = new google.maps.Marker({
			position: _latLng(location),
			map: _map,
			title: location.title,
    		animation: google.maps.Animation.DROP
		});
		_bounds.extend(marker.position);
	}

	function _addMarkers(nodes) {
		$.each(nodes, function(i, node) {
			if(node.start_location) {
				_addMarker(node.start_location);
			}
			if(node.end_location) {
				_addMarker(node.end_location);
			}
			if(node.node_type === 'fly' && node.start_location) {
				_addPolyline([_latLng(node.start_location), _latLng(node.end_location)], '#00FF00');
			} else if(node.polyline) {
				_addEncodedPolyline(node.polyline);
			}
		});
	}

	function _addEncodedPolyline(encoded) {
		poly = google.maps.geometry.encoding.decodePath(encoded);
		_addPolyline(poly, '#0000FF')
	}

	function _addPolyline(poly, color) {
		new google.maps.Polyline({
			path: poly,
			strokeColor: color,
			strokeOpacity: 0.4,
			strokeWeight: 4,
			map: _map
		});
	}

	TT.Map = S.component({
		id: 'map',
		mapOptions: {
			zoom: 4
        }
	}, function(o, p, $map) {
		o.mapOptions.center = new google.maps.LatLng(38, -97);
		o.mapOptions.mapTypeId = google.maps.MapTypeId.ROADMAP;
        _map = new google.maps.Map(document.getElementById(o.id + '-inner'), o.mapOptions);
        _bounds = new google.maps.LatLngBounds();

        this.manager.registerFixed($map);

        $(TT).bind('nodes-received', function(evt, nodes) {
        	_addMarkers(nodes);
        	if(nodes.length) {
				_map.fitBounds(_bounds);
			}
        });
	});
})(TinyTrip, Sour);