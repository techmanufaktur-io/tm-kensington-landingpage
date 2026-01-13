var openImmo = openImmo || {};
openImmo.bookmarks = {

	/**
	 * Initializes the bookmarks
	 */
	initialize: function() {
		// Bind bookmark buttons
		var bookmarkItems = jQuery('[data-openimmo-bookmark-item-uid]');
		if(bookmarkItems.length>0) {
			jQuery.each(bookmarkItems, function() {
				jQuery(this).click(openImmo.bookmarks.change);
			});
		}
		var bookmarkItemCount = jQuery('[data-openimmo-bookmarks]');
		if(bookmarkItemCount.length > 0) {
			jQuery('.bookmarks-item-count').html(bookmarkItemCount.attr('data-openimmo-bookmarks'));
		}
	},

	/**
	 * Clears all reminded bookmarks
	 * @returns {boolean}
	 */
	clear: function() {
		// Clear immobilie
		var data = {
			tx_openimmo_jsonapi: {
				clear: true
			}
		};
		// Send clear action
        jQuery.ajax({
			url: openImmo.jsonApi,
			dataType: 'json',
			data: data,
            method: 'POST',
			success: function (json) {
				window.location.reload(false);
			},
			error: function () {
				//
			}
		});
		return false;
	},

	/**
	 * On change bookmarks button
	 * @returns {boolean}
	 */
	change: function () {
		// Default: Remind immobilie
		var data = {
			tx_openimmo_jsonapi: {
				remind: true,
				immobilie: jQuery(this).attr('data-openimmo-bookmark-item-uid')
			}
		};
		// set bookmark
		if (jQuery(this).hasClass('bookmarked')) {
			data.tx_openimmo_jsonapi.remind = false;
		}
		// Send bookmark action
        jQuery.ajax({
			url: openImmo.jsonApi,
			dataType: 'json',
			data: data,
            method: 'POST',
			success: function (json) {
				var button = jQuery('[data-openimmo-bookmark-item-uid=\'' + json.immobilie + '\']');
				if(json.remind) {
					button.addClass('bookmarked');
				}
				else {
					button.removeClass('bookmarked');
					// remove item in bookmarks view
					var bookmarksView = jQuery('.openimmo-bookmarks');
					if(bookmarksView.length > 0) {
						button.closest('.immobilie-list-item').remove();
					}
				}
				if(typeof json.messages.error !== 'undefined') {
					// Some error happen?
					FlashMessage.push(json.messages.error, 'danger', '#openimmo-flash-messages');
					button.removeClass('bookmarked');
				}
				else {
					if(typeof json.messages.info !== 'undefined') {
						FlashMessage.push(json.messages.info, 'info', '#openimmo-flash-messages');
					}
				}
				// Refresh bookmark item count
				jQuery('.openimmo-bookmarks-item-count').html(json.bookmarks.count);
				//
				if(json.bookmarks.count === 1) {
					jQuery('.openimmo-bookmarks-item-label.singular').addClass('active');
					jQuery('.openimmo-bookmarks-item-label.plural').removeClass('active');
				}
				else {
					jQuery('.openimmo-bookmarks-item-label.singular').removeClass('active');
					jQuery('.openimmo-bookmarks-item-label.plural').addClass('active');
				}
				if(json.bookmarks.count === 0) {
					jQuery('.openimmo-bookmarks-button').addClass('openimmo-bookmarks-empty');
					jQuery('.openimmo-bookmarks-actions').addClass('openimmo-bookmarks-empty');
					jQuery('.openimmo-bookmarks-not-empty').removeClass('openimmo-bookmarks-not-empty');
				}
				else {
					jQuery('.openimmo-bookmarks-button').removeClass('openimmo-bookmarks-empty');
					jQuery('.openimmo-bookmarks-actions').removeClass('openimmo-bookmarks-empty');
					jQuery('.openimmo-bookmarks-not-empty').addClass('openimmo-bookmarks-not-empty');
				}
			},
            error: function (error) {
				console.log(error)
			}
		});
		return false;
	}

};
