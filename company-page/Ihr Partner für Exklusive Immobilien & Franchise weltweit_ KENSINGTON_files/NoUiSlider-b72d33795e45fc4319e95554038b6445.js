/**
 * Bind NoUiSlider by data attributes
 */
jQuery(document).ready(function () {
	var noUiSliders = jQuery('[data-no-ui-slider]');
	if (noUiSliders.length > 0) {
		jQuery.each(noUiSliders, function () {
			var slider = jQuery(this);
			var type = slider.attr('data-no-ui-slider');
			var minValue = parseInt(slider.attr('data-min-value'), 10);
			//
			// Get the maximum value
			var maxValue = slider.attr('data-max-value');
			// Max value can be the current year
			if (maxValue === 'currentYear') {
				maxValue = (new Date()).getFullYear();
				// Insert current year in label
				jQuery('[data-insert-current-year=\'1\']').html(maxValue).attr('data-insert-current-year', '0');
			}
			else {
				maxValue = parseInt(maxValue, 10);
			}
			//
			// Get the default value
			var defaultValue = parseInt(slider.attr('data-default-value'), 10);
			//
			// Get the step value
			var stepValue = slider.attr('data-step-value');
			if (typeof stepValue !== 'undefined') {
				stepValue = parseFloat(stepValue);
			}
			else {
				stepValue = 1.0;
			}
			if (isNaN(stepValue)) {
				stepValue = 1.0;
			}
			//
			// Get the decimals for formatting
			var formatDecimals = parseInt(slider.attr('data-format-decimals'), 10);
			if(typeof formatDecimals === 'undefined') {
				formatDecimals = 0;
			}
			var format = {
				to: function(value) {
					return parseFloat(Math.round(value * 100) / 100).toFixed(formatDecimals);
				},
				from: function(value) {
					return parseFloat(Math.round(value * 100) / 100).toFixed(formatDecimals);
				}
			};
			/**
			 * @todo NICE-TO-HAVE format with thousands-separator
			 */
			//
			// Bind a range slider with a single control
			if (type === 'single') {
				// Display a tooltip?
				var tooltipValue = slider.attr('data-tooltip-value');
				if(typeof tooltipValue === 'undefined' || tooltipValue === '') {
					tooltipValue = false;
				}
				else if(tooltipValue === 'true') {
					tooltipValue = true;
				}
				// Initialize slider
				noUiSlider.create(slider[0], {
					start: [defaultValue],
					step: stepValue,
					tooltips: [tooltipValue],
					format: format,
					range: {
						'min': [minValue],
						'max': [maxValue]
					}
				});
				//
				// On slide: change input field
				var targetFieldId = slider.attr('data-target-field');
				var targetField = jQuery('#' + targetFieldId);
				slider[0].noUiSlider.on('update', function( values, handle ) {
					targetField.val(values[handle]);
				});
				//
				// On change input: adjust slider
				targetField[0].addEventListener('change', function(){
					slider[0].noUiSlider.set(this.value);
				});
			}
			//
			// Bind a range slider with a double control
			if (type === 'double') {
				//
				var defaultMinValue = parseInt(slider.attr('data-default-min-value'), 10);
				var defaultMaxValue = parseInt(slider.attr('data-default-max-value'), 10);
				// Display a tooltip?
				var tooltipMinValue = slider.attr('data-tooltip-min-value');
				if(typeof tooltipMinValue === 'undefined' || tooltipMinValue === '') {
					tooltipMinValue = false;
				}
				else if(tooltipMinValue === 'true') {
					tooltipMinValue = true;
				}
				var tooltipMaxValue = slider.attr('data-tooltip-max-value');
				if(typeof tooltipMaxValue === 'undefined' || tooltipMaxValue === '') {
					tooltipMaxValue = false;
				}
				else if(tooltipMaxValue === 'true') {
					tooltipMaxValue = true;
				}
				// Initialize slider
				noUiSlider.create(slider[0], {
					start: [defaultMinValue, defaultMaxValue],
					step: stepValue,
					tooltips: [tooltipMinValue, tooltipMaxValue],
					format: format,
					range: {
						'min': [minValue],
						'max': [maxValue]
					}
				});
				//
				// On slide: change input field
				var targetMinFieldId = slider.attr('data-target-min-field');
				var targetMinField = jQuery('#' + targetMinFieldId);
				var targetMaxFieldId = slider.attr('data-target-max-field');
				var targetMaxField = jQuery('#' + targetMaxFieldId);
				slider[0].noUiSlider.on('update', function( values, handle ) {
					if(handle === 0) {
						targetMinField.val(values[handle]);
					}
					else if(handle === 1) {
						targetMaxField.val(values[handle]);
					}
				});
				//
				// On change input: adjust slider
				targetMinField[0].addEventListener('change', function(){
					slider[0].noUiSlider.set([this.value, null]);
				});
				targetMaxField[0].addEventListener('change', function(){
					slider[0].noUiSlider.set([null, this.value]);
				});
			}
		});
	}

});
