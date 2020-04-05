// from https://www.jqueryscript.net/tooltip/HTML5-Tooltip-Follow-Cursor-jQuery.html
// TOX: slightly modified to suit my needs and my preferred coding style
function addTooltips() 
{
	$('[data-tooltip]').hover(
	  	function()
	  	{
	    	$('<div class="div-tooltip"></div>').text($(this).attr('data-tooltip')).appendTo('body').fadeIn('slow');
	  	}, 
	  	function() 
	  	{ 
	    	$('.div-tooltip').remove();
	  	}
	).mousemove(
		function(e) 
		{
			$('.div-tooltip').css({ top: e.pageY + 10, left:  e.pageX + 20 })
	  	}
	);
}
