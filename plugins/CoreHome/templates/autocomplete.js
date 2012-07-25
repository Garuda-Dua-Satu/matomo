/*!
 * Piwik - Web Analytics
 *
 * @link http://piwik.org
 * @license http://www.gnu.org/licenses/gpl-3.0.html GPL v3 or later
 */

$('.but').on('click', function(e)
{
	if($('#websiteSearch').val() != '')
		$('#websiteSearch').autocomplete('search', $('#websiteSearch').val() + '%%%');
	return false;
});

function switchSite(id, name)
{
    $("#sitesSelectionSearch .custom_select_block").toggleClass("custom_select_block_show");
    $('.custom_select_main_link').text(name);
    $('.custom_select_main_link').addClass('custom_select_loading');
    broadcast.propagateNewPage('idSite='+id );
    return false;
}

// global function that is executed when the user selects a new site.
// can be overridden to customize behavior (see UsersManager)
window.autocompleteOnNewSiteSelect = function(siteId, siteName)
{
	switchSite(siteId, siteName);
};

$(function() {
	if($('#websiteSearch').length == 0)
	{
		return;
	}

	$('#websiteSearch').click(function(e)
	{
		$(this).val('');
	});
	$('#websiteSearch').keyup(function(e)
	{
		if(parseInt($(this).val().length) == 0)
		{
			reset();
		}
	});
	$('#websiteSearch').autocomplete({
		minLength: 1,
		source: '?module=SitesManager&action=getSitesForAutocompleter',
		appendTo: '#custom_select_container',
		select: function(event, ui) {
			if(piwik.idSite == ui.item.id)
			{
				$("#sitesSelectionSearch .custom_select_block").toggleClass("custom_select_block_show");
			}
			else
			{
				if(ui.item.id > 0) {
					// set attributes of selected site display (what shows in the box)
					$("#sitesSelectionSearch .custom_select_main_link")
                		.attr('siteid', ui.item.id)
                		.text(ui.item.name);
                	// hide the dropdown
        			$("#sitesSelectionSearch .custom_select_block").toggleClass("custom_select_block_show");
        			// fire the site selected event
					window.autocompleteOnNewSiteSelect(ui.item.id, ui.item.name);
				} else {
					reset();
				}
			}
			return false;
		},
		focus: function(event, ui) {
			$('#websiteSearch').val(ui.item.name);
			return false;
		},
		search: function(event, ui) {
			$("#reset").show();
			$("#sitesSelectionSearch .custom_select_main_link").addClass("custom_select_loading");
		},
		open: function(event, ui) {
			widthSitesSelection = $("#sitesSelectionSearch ul").width();
			$("#sitesSelectionSearch .custom_select_main_link").removeClass("custom_select_loading");
			if(widthSitesSelection > $('#max_sitename_width').val())
			{
				$('#max_sitename_width').val(widthSitesSelection);
			}
			else
			{
				widthSitesSelection = $('#max_sitename_width').val();
			}

			$('.custom_select_ul_list').hide();
			$("#siteSelect.ui-autocomplete").show();
			$("#siteSelect.ui-autocomplete").css('top', '0px');
			$("#siteSelect.ui-autocomplete").css('left', '-6px');
			$("#siteSelect.ui-autocomplete").width(parseInt(widthSitesSelection));
			$(".custom_select_block_show").width(parseInt(widthSitesSelection));
		}
	}).data("autocomplete")._renderItem = function( ul, item ) {
		$(ul).attr('id', 'siteSelect');
		return $( "<li></li>" )
		.data( "item.autocomplete", item )
		.append( $( "<a></a>" ).html( item.label )
					.attr('href', piwikHelper.getCurrentQueryStringWithParametersModified('idSite='+item.id) 
									+ (broadcast.isHashExists()
												? broadcast.getHashFromUrl().replace(/idSite=[0-9]+/, 'idSite='+item.id) 
												: ""
									) ) )
		.appendTo( ul );
	};

	$('body').on('mouseup',function(e){ 
		if(!$(e.target).parents('#sitesSelectionSearch').length && !$(e.target).is('#sitesSelectionSearch') && !$(e.target).parents('#siteSelect.ui-autocomplete').length) {
			reset();
			$('#sitesSelectionSearch .custom_select_block').removeClass('custom_select_block_show');
		}
	});

	function reset()
	{
		$('#websiteSearch').val('');
		$('.custom_select_ul_list').show();
		$("#siteSelect.ui-autocomplete").hide();
		$("#reset").hide();
	}
	$("#reset").click(function(e)
	{
		reset();
	});
});
