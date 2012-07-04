(function(TT, S) {
	var _tripId,
		_nodes,
		_nodeTmpl = ['<li class="row-fluid trip-node" data-id="{{id}}">', 
						'<span class="span2">',
							'<strong>{{position}}.</strong>',
						'</span>',
						'<span class="span10">',
							'<p>{{title}}</p>',
							'<span class="trip-node-date">',
								'{{#has_starts_on}}<span class="trip-node-date-date">{{starts_on}}</span>{{/has_starts_on}}',
								'{{^has_starts_on}}<a href="javascript:void(0)" class="trip-node-date-add">Add Date</a>{{/has_starts_on}}',
							'</span>',
							'<span class="close">&times;</span>',
						'</span>',
					'</li>'].join('');

	var $nodes;

	var _resultTypes = {
		'street_address': 'address',
		'administrative_area_level_1': 'state',
		'locality': 'city',
		'postal_code': 'zipcode'
	};

	function _geocodeResultToAddress(prefix, resp) {
		if(resp && resp.results && resp.results.length) {
			var result = resp.results[0],
				address = {};

			if(result.address_components.length) {
				$.each(result.address_components, function(i, ac) {
					$.each(_resultTypes, function(type, prop) {
						if(S.Util.inArray(type, ac.types)) {
							address[prefix + '_' + prop] = ac.short_name;
						}
					});
				});
			}

			var title = prefix + '_title', city = prefix + '_city', state = prefix + '_state', lat = prefix + '_lat', lon = prefix + '_lon';

			address[title] = '';
			if(address[city]) {
				address[title] = address[city];
			}
			if(address[state]) {
				if(address[title]) {
					address[title] += ', ';
				}
				address[title] += address[state];
			}

			if(result.geometry && result.geometry.location) {
				address[lat] = result.geometry.location.lat;
				address[lon] = result.geometry.location.lng;
			}

			return address;
		}
	}

	function _renderNodes() {
		$.each(_nodes, function(i, node) {
			(function(node) {
				if(node.starts_on) {
					var starts_on = node.starts_on.replace(/Z/ig, '');
					node.starts_on = Date.parse(starts_on).toString('ddd MMM dd');
					node.has_starts_on = true;
				}
				_renderNode(node);
			})(node.node)
		});
	}

	function _renderNode(node) {
		var html = S.tmpl(_nodeTmpl, node);
		$(html).appendTo($nodes);
	}

	function _updatePositions() {
		$('.trip-node').each(function(i) {
			$('strong', this).html((i + 1) + '.');
		});
	}

	function _setupEvents(o) {
		S.form(o.fields, { context:'#trip-nodes-new', button:'#trip-nodes-new-btn', onValid:function(data) {
			var addresses = [encodeURIComponent(data.start), encodeURIComponent(data.end)].join('|');
			S.Data.get('/geocode/' + addresses, function(resp) {
				if(resp && resp.start_resp && resp.end_resp) {
					var start = _geocodeResultToAddress('start', resp.start_resp)
						end = _geocodeResultToAddress('end', resp.end_resp);

					if(start && end) {
						var node = $.extend(start, end);
						node.title = node.start_title + ' to ' + node.end_title;
						node.position = _nodes.length + 1;
						
						S.Data.post('/trips/' + _tripId + '/nodes', node, function(resp) {
							_nodes.push(resp);
							_renderNode(resp);
							$(TT).trigger('nodes-received', [[resp]]);
							$('#' + o.fields[0].id).val(end.end_title);
							$('#' + o.fields[1].id).val('');
						});
					}
				}
			});
		}});

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
				nodeId = $node.attr('data-id');

			$('<input type="date" class="input-small" />').val(Date.today().toString('yyyy-MM-dd')).appendTo($date).focus().blur(function() {
				var $input = $(this);
				var val = Date.parse($input.val());
				if(val) {
					S.Data.put('/trips/' + _tripId + '/nodes/' + nodeId, { starts_on:val }, function() {
					});
					$date.prepend('<span class="trip-node-date-date">' + val.toString('ddd MMM dd') + '</span>');
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
			{ id:'address-end', prop:'end', label:'Going From', require:true }
		]
	}, function(o, p, $trip) {
		_tripId = $trip.attr('data-id');
		//console.log($trip, _tripId)

		$nodes = $('#' + o.id + '-nodes', $trip);

		_setupEvents(o);

		S.Data.get('/trips/' + _tripId + '/nodes', function(resp) {
			_nodes = resp.nodes;
			_renderNodes();
			$(TT).trigger('nodes-received', [_nodes]);
		});
	});
})(TinyTrip, Sour);