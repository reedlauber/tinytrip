(function(TT) {
	TT.Manager = function(options) {
		var _self = {},
			_options = $.extend({
				components: {}
			}, options);

		var _fixedEls = [];
		function _setupFixedScrolling() {
			var top = $('.fixed-container').offset().top || 0, fixed = false;
			$(window).scroll(function(evt) {
				if(!fixed && window.scrollY > top - 8) {
					fixed = true;
					$.each(_fixedEls, function() {
						$(this).css({ left:$(this).data('fixedScrollLeft'), width:$(this).data('fixedScrollWidth') }).addClass('trip-fixed');
					});
				} else if(fixed && window.scrollY < top - 8) {
					fixed = false
					$.each(_fixedEls, function() {
						$(this).removeClass('trip-fixed').css({ left: 'auto', width:'auto' });
					});
				}
			});
		}

		_self.registerFixed = function($el) {
			$el.data('fixedScrollWidth', $el.width()).data('fixedScrollLeft', $el.offset().left - 4);
			_fixedEls.push($el);
		};

		_self.init = function() {
			_setupFixedScrolling();

			$.each(_options.components, function(n, c) {
				c.init(_self);
			});

			return _self;
		};

		return _self;
	};
})(TinyTrip);