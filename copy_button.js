function attachCopyHandler(selector)
{
	$(selector).text($(selector).attr('data-clipboard-text-copy'));

	var clipboard = new ClipboardJS(selector);
	console.log(clipboard);
	clipboard.on('success', 
		function(e) 
		{
	    	e.clearSelection();
	    	$(selector).animate({'opacity': 0},
	    		100,
	    		function() 
	    		{
					$(this).text($(this).attr('data-clipboard-text-copied'));
	      			$(this).animate({'opacity': 0},
			    		1500,
			    		function() 
			    		{
							$(this).text($(this).attr('data-clipboard-text-copy'));
			    		}
			    	).animate({'opacity': 1}, 200);
	    		}
	    	).animate({'opacity': 1}, 200);
		}
	);
}
