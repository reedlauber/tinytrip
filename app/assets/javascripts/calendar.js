(function(TT, S) {
	var _today = Date.today(),
		_headerTmpl = ['<header>{{month}}</header>'].join(''),
		_bodyTmpl = ['<div class="row-fluid cal-daynames">',
						'{{#dayNames}}<span class="cal-dayname">{{name}}</span>{{/dayNames}}',
					'</div>'].join(''),
		_rowTmpl = ['{{#weeks}}',
					'<div class="row-fluid cal-days">',
						'{{#days}}',
						'<span class="cal-day" data-day="{{dayNum}}">',
							'<span class="cal-day-date">{{dayNum}}</span>',
						'</span>',
						'{{/days}}',
					'</div>',
					'{{/weeks}}'].join(''),
		_dayNames = [{ name:'Sun' }, { name:'Mon' }, { name:'Tue' }, { name:'Wed' }, { name:'Thu' }, { name:'Fri' }, { name:'Sat' }];

	var $header,
		$body;

	function _render(month) {
		var _firstDayOfMonth = Date.parse(_today.toString('yyyy') + '-' + month + '-01'),
			_offset = Date.getDayNumberFromName(_firstDayOfMonth.toString('ddd'));

		var _days = [], _weeks = [], i = 0 - _offset, len = _today.getDaysInMonth();
		for(i; i < len; i++) {
			if((_days.length) % 7 === 0) {
				if(_days.length) {
					_weeks.push({ days: _days });
				}
				_days = [];
			}
			_days.push({ dayNum:i < 0 ? '' : (i+1) });
		}
		if(_days.length) {
			_weeks.push({ days: _days });
		}

		$header.html(S.tmpl(_headerTmpl, { month:_firstDayOfMonth.toString('MMMM') }));
		$body.append(S.tmpl(_bodyTmpl, { dayNames:_dayNames }));
		$body.append(S.tmpl(_rowTmpl, { weeks:_weeks }));
	}

	TT.Calendar = S.component({
		id:'cal'
	}, function(o, p, $cal) {
		$header = $('<header />').appendTo($cal);
		$body = $('<div class="row-fluid cal-body" />').appendTo($cal);

		_render(_today.getMonth() + 1);

		$(TT).bind('nodes-received', function(evt, nodes) {
			var firstDate;
			$.each(nodes, function(i, node) {
				(function(node) {
					var date = node.starts_on && S.Util.parseDate(node.starts_on);
					if(!firstDate && date) {
						firstDate = date;
					}
					if(date) {
						$('.cal-day[data-day=' + date.getDate() + ']', $cal).append('<span class="cal-node">' + node.position + '.</span>');
					}
				})(node.node);
			});
		});
	});
})(TinyTrip, Sour);