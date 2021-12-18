var createViz = function () {
    /*var vlSpec = {
          "width": 900,
          "height": 500,
          "$schema": "https://vega.github.io/schema/vega-lite/v5.json",
          "params": [
              {
                  "name" : "highlight",
                  "select" : {"type": "point", "fields" : ["candidat"], "on" : "mouseover"},
                  "bind" : "legend"
                  },
              {	
                  "name": "select", 
                  "select": "point"
              }
          ],
          "data": {
              "url": "../clean_datasets/pipeline/step_2/regions_develloped.csv",
              "format": {
                  "type": "csv"
              }
          },
          "mark": {
              "type" : "bar",
              "stroke" : "black"
          },
          "encoding": {
              "x" : {
                  "field" : "voix",
                  "type" : "quantitative",
                  "aggregate" : "sum",
                  "stack":  "normalize",
                  "title" : "Part de vote"
              },
              "y" : {
                  "field" : "nom_lieu",
                  "type" : "nominal",
                  "title" : "Région"
              },
              "strokeWidth" : {
                  "condition" : {
                      "param" : "highlight",
                      "empty" : false,
                      "value" : 1
                  },
                  "value" : 0
              },
              "color" : {
                  "field" : "candidat", 
                      "type" : "nominal",
                      "scale" : {
                          "domain" : candidates.map(candidate => candidate.id),
                          "range" : candidates.map(candidate => candidate.color)
                      },
                      "title" : "Candidat"
              },
              "order": {
                  "aggregate": "sum", 
                  "field": "voix",
                  "sort" : "descending"
              }
          }
      }*/
  
    var vlSpec = {
          "width" : 900,
          "height" : 500,
          "$schema": "https://vega.github.io/schema/vega-lite/v5.json",
          "data": {
              "url": "../clean_datasets/maps_france/topojson/regions.json",
              "format": {
                  "type": "topojson",
                  "feature": "regions"
              }
          },
          "transform": [{
              "lookup": "properties.code",
              "from": {
                  "data": {
                      "url": "../clean_datasets/pipeline/step_2/regions.csv",
                      "format": {
                          "type": "csv"
                      }
                  },
                  "key": "id_lieu",
                  "fields": ["MA"]
              }
          }],
          "projection": {
              "type": "mercator"
          },
          "mark": "geoshape",
          "encoding": {
              "color": {
                  "field": "MA",
                  "type": "quantitative",
                  "title":"Votes pour Macron"
              }
          }
      }
  
      var vlOpts = { width: 900, height: 500 };
      vegaEmbed("#main", vlSpec, vlOpts);
  };