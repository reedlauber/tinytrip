(function(TT, S) {
	var _map;

	function _addMarker(location) {
		var marker = new google.maps.Marker({
			position: new google.maps.LatLng(location.lat, location.lon),
			map: _map,
			title: location.title,
    		animation: google.maps.Animation.DROP
		});
	}

	function _addMarkers(nodes) {
		$.each(nodes, function(i, node) {
			if(node.start_location) {
				_addMarker(node.start_location);
			}
			if(node.end_location) {
				_addMarker(node.end_location);
			}
			if(node.node.polyline) {
				_addEncodedPolyline(node.node.polyline);
			}
		});
	}

	function _addEncodedPolyline(encoded) {
		poly = google.maps.geometry.encoding.decodePath(encoded);
		
		new google.maps.Polyline({
			path: poly,
			strokeColor: "#0000FF",
			strokeOpacity: 0.4,
			strokeWeight: 4,
			map: _map
		});
	}

	function _addDirections(resp) {
		if(resp && resp.routes && resp.routes.length) {
			var encoded = resp.routes[0].overview_polyline.points;
			_addEncodedPolyline(encoded);
		}
	}

	function _getDirections(nodes) {
		var i = 0, len = nodes.length, nodeGroup = [];
		for(i; i<len; i++) {
			nodeGroup.push(nodes[i].city + ',' + nodes[i].state);
			if(i+1 % 8 === 0) {
				S.Data.get('/directions/' + nodeGroup.join('|'), function(resp) {
					_addDirections(resp);
				});
				nodeGroup = [];
			}
		}
		if(nodeGroup.length) {
			S.Data.get('/directions/' + nodeGroup.join('|'), function(resp) {
				_addDirections(resp);
			});
		}
	}

	TT.Map = S.component({
		id: 'map',
		mapOptions: {
			zoom: 4
        }
	}, function(o, p, $map) {
		o.mapOptions.center = new google.maps.LatLng(38, -97);
		o.mapOptions.mapTypeId = google.maps.MapTypeId.ROADMAP;
        _map = new google.maps.Map(document.getElementById(o.id), o.mapOptions);

        $(TT).bind('nodes-received', function(evt, nodes) {
        	_addMarkers(nodes);
        	//_getDirections(nodes);
        });
	});
})(TinyTrip, Sour);