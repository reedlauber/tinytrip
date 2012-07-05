(function(TT, S) {
	var _tripId,
		_nodes,
		_lastDate,
		_nodeTmpl = ['<li class="row-fluid trip-node" data-id="{{id}}">', 
						'<span class="span2">',
							'<strong>{{position}}.</strong>',
						'</span>',
						'<span class="span10">',
							'<p class="trip-node-title">{{title}}</p>',
							'<span class="trip-node-duration trip-node-detail label">{{duration}}</span>',
							'<span class="trip-node-date">',
								'{{#has_starts_on}}<span class="trip-node-date-date trip-node-detail label label-info">{{starts_on_formatted}}</span>{{/has_starts_on}}',
								'{{^has_starts_on}}<a href="javascript:void(0)" class="trip-node-date-add">Add Date</a>{{/has_starts_on}}',
							'</span>',
							'<span class="close">&times;</span>',
						'</span>',
					'</li>'].join('');

	var $nodes;

	function _simpleLocationToAddress(prefix, address, location) {
		if(prefix) {
			prefix += '_';
		}

		var obj = {};

		address = address.replace(/, USA/ig, '');
		obj[prefix + 'title'] = address;

		address = address.split(', ');
		if(address.length > 1) {
			obj[prefix + 'state'] = address[address.length-1];
			obj[prefix + 'city'] = address[address.length-2];
		}

		obj[prefix + 'lat'] = location.lat();
		obj[prefix + 'lon'] = location.lng();

		return obj;
	}

	function _directionsResultToAddresses(result, callback) {
		if(result && result.routes && result.routes.length) {
			var route = result.routes[0];
			if(route.legs.length) {
				var leg = route.legs[0],
					start = _simpleLocationToAddress('start', leg.start_address, leg.start_location),
					end = _simpleLocationToAddress('end', leg.end_address, leg.end_location);
				callback(leg.distance.text, leg.duration.value, route.overview_polyline.points, start, end);
			}
		}
	}

	function _updateStartsOnField(tryDate) {
		if(tryDate && tryDate > _lastDate) {
			_lastDate = tryDate.clone();
		}
		date = _lastDate;
		$('#starts-on').val(date.addDays(1).toString('yyyy-MM-dd'));
	}

	function _renderNodes() {
		$.each(_nodes, function(i, node) {
			_renderNode(node);
			if(node.starts_on) {
				_lastDate = node.starts_on.clone();
			}
		});
		if(_lastDate) {
			_updateStartsOnField();
		}
	}

	function _renderNode(node) {
		if(node.starts_on) {
			node.starts_on = Date.parse(node.starts_on.replace(/Z/ig, ''));
			node.starts_on_formatted = node.starts_on.toString('ddd MMM dd');
			node.has_starts_on = true;
		}

		if(node.duration) {
			var mins = Math.round(node.duration / 60),
				hrs = Math.floor(mins / 60);
			mins = mins - (hrs * 60);
			node.duration = hrs + 'h ';
			if(mins) {
				node.duration += mins + 'm';
			}
		}

		node.fly = node.node_type === 'fly';

		var html = S.tmpl(_nodeTmpl, node);

		var $node = $('.trip-node[data-id=' + node.id + ']', $nodes);
		if($node.length) {
			$node.replaceWith(html);
		} else {
			$nodes.append(html);
		}
	}

	function _updatePositions() {
		$('.trip-node').each(function(i) {
			$('strong', this).html((i + 1) + '.');
		});
	}

	function _setupNewNodeForm(o) {
		var directions = new google.maps.DirectionsService();
		S.form(o.fields, { context:'#trip-nodes-new', button:'#trip-nodes-new-btn', onValid:function(data) {
			directions.route({ origin:data.start, destination:data.end, travelMode:google.maps.TravelMode.DRIVING }, function(result, status) {
				if(result && result.routes.length) {
					_directionsResultToAddresses(result, function(distance, duration, polyline, start, end) {
						var node = $.extend(data, { title:data.start + ' - ' + data.end }, start, end);
						node.position = _nodes.length + 1;
						node.polyline = polyline;
						node.distance = distance;
						node.duration = duration;

						S.Data.post('/trips/' + _tripId + '/nodes', node, function(resp) {
							_nodes.push(resp);
							_renderNode(resp);
							_updateStartsOnField(node.starts_on);
							$(TT).trigger('nodes-received', [[resp]]);
							$('#' + o.fields[0].id).val(end.end_title);
							$('#' + o.fields[1].id).val('');
						});
					});
				}
			});
		} });
	}

	function _setupEvents(o) {
		_setupNewNodeForm(o);

		$('#' + o.id + '-nodes').on('click', '.close', function() {
			var $li = $(this).parents('.trip-node'),
				id = parseInt($li.attr('data-id'), 10);

			if(confirm('Are you sure you want to delete this stop?')) {
				S.Data.del('/trips/' + _tripId + '/nodes/' + id, function() {
					Sour.Util.removeFromArray(id, _nodes);
					$li.fadeOut(function() {
						$li.remove();
						_updatePositions();
					});
				});
			}
		});

		$('#' + o.id + '-nodes').on('click', '.trip-node-date-add', function() {
			var $link = $(this).hide(),
				$date = $link.parent(),
				$node = $link.parents('.trip-node'),
				nodeId = $node.attr('data-id'),
				node = S.Util.objFromArray(nodeId, _nodes);

			$('<input type="date" class="input-small" />').val(Date.today().toString('yyyy-MM-dd')).appendTo($date).focus().blur(function() {
				var $input = $(this);
				var val = Date.parse($input.val());
				if(val) {
					S.Data.put('/trips/' + _tripId + '/nodes/' + nodeId, { starts_on:val }, function(resp) {
						node = resp;
						_renderNode(node);
						_updateStartsOnField(node.starts_on);
						$(TT).trigger('node-date-changed', [node]);
					});
				} else {
					$link.show();
				}
				$input.remove();
			});
		});
	}

	TT.Trips = S.component({
		id: 'trip',
		fields: [
			{ id:'address-start', prop:'start', label:'Starting From', require:true },
			{ id:'address-end', prop:'end', label:'Going From', require:true },
			{ id:'node-type', prop:'node_type', label:'Travel Type', require:true },
			{ id:'starts-on', prop:'starts_on', label:'Travel Type' }
		]
	}, function(o, p, $trip) {
		_tripId = $trip.attr('data-id');

		$nodes = $('#' + o.id + '-nodes', $trip);

		_setupEvents(o);

		S.Data.get('/trips/' + _tripId + '/nodes', function(resp) {
			_nodes = resp.nodes;
			_renderNodes();
			$(TT).trigger('nodes-received', [_nodes]);
		});
	});
})(TinyTrip, Sour);