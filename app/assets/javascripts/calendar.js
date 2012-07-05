(function(TT, S) {
	var _today = Date.today(),
		_nodes = [],
		_headerTmpl = ['<header>',
							'<span class="icon-chevron-left cal-prev"></span>',
							'<span class="cal-month"></span>',
							'<span class="icon-chevron-right cal-next"></span>',
						'</header>'].join(''),
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
		_nodeTmpl = ['<span class="cal-node{{#fly}} cal-node-fly{{/fly}}" data-id="{{id}}" title="{{title}}">',
						'{{position}}. {{title}}',
					'</span>'].join(''),
		_dayNames = [{ name:'Sun' }, { name:'Mon' }, { name:'Tue' }, { name:'Wed' }, { name:'Thu' }, { name:'Fri' }, { name:'Sat' }];

	var $cal,
			$header,
			$body;

	function _renderLayout() {
		var _firstDayOfMonth = _today.moveToFirstDayOfMonth(),
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

		$('.cal-month', $header).html(_firstDayOfMonth.toString('MMMM'));
		$body.empty().append(S.tmpl(_bodyTmpl, { dayNames:_dayNames }));
		$body.append(S.tmpl(_rowTmpl, { weeks:_weeks }));
	}

	function _renderNodes() {
		$.each(_nodes, function(i, node) {
			_renderNode(node);
		});
	}

	function _renderNode(node) {
		var date = node.starts_on && S.Util.parseDate(node.starts_on);
		if(date && date.getMonth() === _today.getMonth()) {
			$('.cal-day[data-day=' + date.getDate() + ']', $cal).append(S.tmpl(_nodeTmpl, node));
		}
	}

	function _setupEvents() {
		$('.cal-next', $cal).click(function() {
			_today.addMonths(1);
			_renderLayout();
			_renderNodes();
		});
		$('.cal-prev', $cal).click(function() {
			_today.addMonths(-1);
			_renderLayout();
			_renderNodes();
		});
	}

	TT.Calendar = S.component({
		id:'cal'
	}, function(o, p, $el) {
		$cal = $el;
		$header = $(_headerTmpl).appendTo($cal);
		$body = $('<div class="row-fluid cal-body" />').appendTo($cal);

        this.manager.registerFixed($cal);

		_renderLayout();
		_setupEvents();

		$(TT).bind('nodes-received', function(evt, nodes) {
			_nodes = nodes;
			_renderNodes();
		});

		$(TT).bind('node-date-changed', function(evt, node) {
			$('.cal-day[data-id=' + node.id + ']').remove();
			_renderNode(node);
		});
	});
})(TinyTrip, Sour);