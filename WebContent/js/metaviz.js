var metaViz = {};
var num_lin_ds = 0, num_us_ds = 0;
var num_lin_mod = 0, num_us_mod = 0;

/**
 * Method to call requestController servlet and get json string.
 */
metaViz.dataBaseRequest = function(mode, id, callback) {	 
	$.ajax({
		"url" : 'MetavizController',
		"type" : 'GET',
		"data" : {
			"mode" : mode,
			"id" : id,			
		}, "success" : function(data,status) { 
			return callback(data);
		}
	});
};

/**
 * Method to hide metaviz gui elements.
 */
metaViz.hideMetaViz = function() {
	if (heatmap)
		metaVizMode = false;
		
	dojo.byId("map_info_text").innerHTML = "Click on a boundingbox to get further information.";
	
	num_lin_ds = 0, num_us_ds = 0;
	num_lin_mod = 0, num_us_mod = 0;	
	dojo.byId("page").style.display = "none";
	
	lineage_model_cards = 0;
	usage_model_cards = 0;
	   
	lineage_model_mini_cards = 0;
	usage_model_mini_cards = 0;
	     
	lineage_dataset_cards = 0; 
	usage_dataset_cards = 0;  

	lineage_dataset_mini_cards = 0; 
	usage_dataset_mini_cards = 0; 
 
	al = dojo.byId("actual_lines");
	while (al.hasChildNodes()) {
		al.removeChild(al.lastChild);
	}
	
	ldmcc = dojo.byId("lineage_dataset_mini_cards_container");
	while (ldmcc.hasChildNodes()) {
		ldmcc.removeChild(ldmcc.lastChild);
	}
	
	lmmcc = dojo.byId("lineage_model_mini_cards_container");
	while (lmmcc.hasChildNodes()) {
		lmmcc.removeChild(lmmcc.lastChild);
	};
	
	udmcc = dojo.byId("usage_dataset_mini_cards_container");
	while (udmcc.hasChildNodes()) {
		udmcc.removeChild(udmcc.lastChild);
	};
	
	ummcc = dojo.byId("usage_model_mini_cards_container");
	while (ummcc.hasChildNodes()) {
		ummcc.removeChild(ummcc.lastChild);
	};
	
	ldcc = dojo.byId("lineage_dataset_cards_container");
	while (ldcc.hasChildNodes()) {
		ldcc.removeChild(ldcc.lastChild);
	};
	
	lmcc = dojo.byId("lineage_model_cards_container");
	while (lmcc.hasChildNodes()) {
		lmcc.removeChild(lmcc.lastChild);
	};
	
	umcc = dojo.byId("usage_model_cards_container");
	while (umcc.hasChildNodes()) {
		umcc.removeChild(umcc.lastChild);
	};
	
	udcc = dojo.byId("usage_dataset_cards_container");
	while (udcc.hasChildNodes()) {
		udcc.removeChild(udcc.lastChild);
	}; 	
};

/**
 * Method to show metaviz gui elements.
 * Database request is set up and display function is initialized.
 * 
 * @param mode - db/csw/file ... requests db/csw/file
 * @param id - id of data set
 */
metaViz.showMetaViz = function(id) {
	//navi_hide_show_logic -> metaViz is not hidden at beginning
	//show Preloader
	guiFunctions.showPreloaderCallback().then(function() {
		lineage_hidden = true;
		mode = null;
		metaViz.hideMetaViz();
		
		dojo.byId("map_info_text").innerHTML = "Click on an item in the list to reset the lineage view to map.";		
				
		metaViz.dataBaseRequest(mode, id, function(data) { 
			metaViz.displayMetaViz(data);
			hidePreloader();
			
			if (heatmap)
				metaVizMode = true;
			
		}); 
	});
};

/**
 * Method to show metaviz gui elements.
 */
metaViz.displayMetaViz = function(data) {
	console.log(data);
	dojo.byId("time4mapsMap").style.display = "none";
	dojo.byId("mapII").style.display = "none";
	var map = dojo.byId("map");
	//delete children of map
	if (map) {
		while (map.hasChildNodes()) {
			map.removeChild(map.lastChild);
		}
	 }
	
	try {
		var jsonObject = $.parseJSON(data);
	} catch(e) {
		console.log("Error with jsonString from database");
		return;
	}
	var storeData = {
		identifier: 'paramName', //each element and sub element must have an attribute 'paramName'
		items: [jsonObject] 
	}; 
	
	initMetaViz(storeData);
	dojo.byId("page").style.display = "block";
	if (dijit.byId("map_contentPane"))
	 	 dijit.byId("map_contentPane").resize();
};