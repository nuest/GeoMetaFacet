function GeoNames() {
	var body = null;
	var searchText = null;
}

/**
*	\details	This Method uses GeoNames Search Engine to find object-related longitude and latitude 
*	\author 	Hannes Tressel
*   \param		value - Search Term (e.g. Dresden )
*/
GeoNames.search = function(value) {
	GeoNames.searchText = value;
	require(["dojo/request/script"], function(script) {
		script.get("http://api.geonames.org/searchJSON", {
			query: {
				q: value,
				maxRows: 20,
				isNameRequired: true,
				username: "hannestressel",
				format: "json",
				callback: "GeoNamesAnswer"
			}
		});
	});
};

/**
*	\details 	manage results of geonames search engine
*	\param		data - Results ( json )
*	\author		Hannes Tressel
*/
function GeoNamesAnswer(data) {
	require(["dojo/dom-construct", "dijit/form/Button"], function(domConstruct, Button) {
 
		GeoNames.body = domConstruct.create("div", {
			id: "Dialog_body",
			style: "width: 100%;"
		}); 
		var widget = domConstruct.create("table", {
			id: "GeoNamesResults",
			style: "width: 100%; margin-bottom: 20px;"
		}, GeoNames.body);
		
		domConstruct.create("th", {
			innerHTML: "Name",
			style: "text-align:left; background-color: #F9B200;"
		}, widget);
		domConstruct.create("th", {
			innerHTML: "Country",
			style: "text-align:left; background-color: #F9B200;"
		}, widget);
		domConstruct.create("th", {
			innerHTML: "Feature Class",
			style: "text-align:left; background-color: #F9B200;"
		}, widget);
		domConstruct.create("th", {
			innerHTML: "Longitude",
			style: "text-align:left; background-color: #F9B200;"
		}, widget);
		domConstruct.create("th", {
			innerHTML: "Latitude",
			style: "text-align:left; background-color: #F9B200;"
		}, widget);

		var GeoNameResults = filterCityCountry(data.geonames);

		for (var i=0; i<GeoNameResults.length; i++) {
			var tr = domConstruct.create("tr", {
				style: "background-color: #D4E3E5;",
				ondblclick: function() { //damit man auch schneller Handlungsfaehig ist ....
					for (var i=0; i<widget.rows.length; i++){
						var row = widget.rows[i];
						if (row.style.backgroundColor === "rgba(0, 124, 149, 0.2)"){
							map2.setCenter(new OpenLayers.LonLat(row.cells[4].innerHTML, row.cells[3].innerHTML).transform(map2.displayProjection, map2.projection), manageLevelOfZoom(GeoNameResults[i].fcode));
						}
					}

					require(["dijit/registry"], function(registry) {
						var dialog = registry.byId("SearchResultOverview");
						dialog.hide();
					});

				},

				onclick: function() {				
					for (var i=0; i<widget.rows.length; i++) {
  						row = widget.rows[i];
  						if (i%2){
  							row.style.backgroundColor = "#eee";
  						}else
  							row.style.backgroundColor = "#fff";
  					}	 
					this.style.backgroundColor = "rgba(0,124,149,0.2)";
				}
			}, widget);

			domConstruct.create("td", {
				innerHTML: GeoNameResults[i].name
			}, tr);

			domConstruct.create("td", {
				innerHTML: GeoNameResults[i].countryName
			}, tr);

			domConstruct.create("td", {
				innerHTML: GeoNameResults[i].fcodeName
			}, tr);

			domConstruct.create("td", {
				innerHTML: GeoNameResults[i].lat
			}, tr);

			domConstruct.create("td", {
				innerHTML: GeoNameResults[i].lng
			}, tr);
			
//			domConstruct.create("td", {
//				innerHTML: "<b>" + GeoNameResults[i].name + "</b>, " + GeoNameResults[i].countryName + "<br>Datatype: map result<br>Lat/Lon: " + GeoNameResults[i].lat + ", " + GeoNameResults[i].lng
//			}, tr);

		}

  		for (var i=0; i<widget.rows.length; i++) {
  			row = widget.rows[i];
  			if (i%2) {
  				row.style.backgroundColor = "#eee";
  			} else
  				row.style.backgroundColor = "#fff";
  		}	
		
		var okBTN = domConstruct.create("div", {
			style: "width: 100%; height: 30px;"
		}, GeoNames.body);
		var cancelBTN = domConstruct.create("div", {
			style: "width: 100%; height: 30px;"
		}, GeoNames.body);

		new Button({
			label: "OK",
			onClick: function() {
				for (var i=0; i<widget.rows.length; i++) {
					var row = widget.rows[i];
					if (row.style.backgroundColor === "rgba(0, 124, 149, 0.2)") {
						map2.setCenter(new OpenLayers.LonLat(row.cells[4].innerHTML, row.cells[3].innerHTML).transform(map2.displayProjection, map2.projection), manageLevelOfZoom(GeoNameResults[i].fcode));
					}
				}

				require(["dijit/registry"], function(registry) {
					var dialog = registry.byId("SearchResultOverview");
					dialog.hide();
				});
			} 
		}, okBTN);

		new Button({
			label: "Cancel",
			onClick: function() {
				require(["dijit/registry"], function(registry) {
					var dialog = registry.byId("SearchResultOverview");
					dialog.hide();
				});
			}
		}, cancelBTN);
	});

	Search.execute(GeoNames.searchText);
}

/**
* \details		this method should return the correct level of zoom, depending on geoname attribute "fcode"
* \param		fcode 	Feature Code
* \return 		OpenLayers ZoomLevel
* \author 		hannes tressel
*/
function manageLevelOfZoom(fcode) {
	switch(fcode) {
		case "ADM1":
			return 7;
			
		case "AMD2":
			return 8;
			
		case "AMD3":
			return 9;
			
		case "AMD4":
			return 10;
			
		case "AMD5":
			return 11;
			
		case "PCLI":
			return 4;
			
		default:
			return 10;	
	}
}

/**
 * \details		This method is filtering from cities or countries
 * 				PPLA - 4 	-> seat of a first/second/third/fourth-order administrative division
 * 				PPLC 		-> capital of a political entity
 * 				ADM1 - 5	-> first/second/third/fourth/fifth-order administrative division
 * 				PCLI		-> independent political entity
 * 				
 * \param 		fcode		Feature Code 
 * \return 		Array containing cities / countries
 * \author		hannes tressel
 */
function filterCityCountry(data) {
	var result = [];
	for (var i=0; i<data.length; i++) {
		var fcode = data[i].fcode;
		
		if (   fcode === "PPLA"  || fcode === "PPLA2" || fcode === "PPLA3" 
			|| fcode === "PPLA4" || fcode === "PPLC"  || fcode === "ADM1" 
			|| fcode === "ADM2"  || fcode === "ADM3"  || fcode === "ADM4"
			|| fcode === "ADM5"  || fcode === "PCLI"  ){
			result.push(data[i]);
		}
	}	
	return result;
}