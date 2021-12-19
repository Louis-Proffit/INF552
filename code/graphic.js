/*
Louis Proffit
*/

var _state = {
    state: { name: "global" }, // Global / candidate / conflict
    level: "region",
    filter: null, // null : global ou {level, parentID}
    highlight: null, // null : global ou {areaID}
    mapData: null,
    turn: 1,
};

/**
 * The different svg's
 */
var _elements = {
    map: null,
    barFirstTurn: null,
    barSecondTurn: null,
    legend: null,
};

var _visual = {
    zoom: d3.zoom().on("zoom", zoomed),
    projection: null,
    path: null,
    transform: {
        x: 0,
        y: 0,
        k: 1,
    },
};

function zoomed(event, d) {
    // Store the current transform
    _visual.transform = event.transform;

    _elements.map.attr("transform", _visual.transform);
    _elements.map.selectAll("g.areaLabel").attr("transform", function(d) {
        return (
            "translate(" +
            d.properties.centroid[0] +
            "," +
            d.properties.centroid[1] +
            ")scale(" +
            1 / _visual.transform.k +
            ")"
        );
    });
}

function keydown(event) {
    var code = event.keyCode;

    switch (code) {
        case 37: // Left
            if (_state.highlight != null) {
                _state.highlight = null;
                updateAreasColor();
                console.log("Dé-highlight");
            } else {
                if (_state.level == "canton") _state.level = "circonscription";
                else if (_state.level == "circonscription") _state.level = "canton";
                setMapData();
                updateAreasData();
                updateTitle();
                updateMapLegend();
            }
            updateBarSize(1);
            updateBarSize(2);

            break;
        case 38: // Up
            if (_state.highlight != null) {
                _state.highlight = null;
                updateAreasColor();
                console.log("Dé-highlight");
            } else {
                if (_state.level == "circonscription" || _state.level == "canton") {
                    _state.level = "departement";
                } else if (_state.level == "departement") {
                    _state.level = "region";
                    if (_state.filter != null && _state.filter.level == "departement")
                        _state.filter = null;
                } else if (_state.level == "region") {
                    _state.filter = null;
                    centerProjection();
                }
                setMapData();
                updateAreasData();
                updateMapLegend();
                updateTitle();
            }
            updateBarSize(1);
            updateBarSize(2);
            break;
        case 39: // Right
            if (_state.highlight != null) {
                _state.highlight = null;
                updateAreasColor();
                console.log("Dé-highlight");
            } else {
                if (_state.level == "canton") _state.level = "circonscription";
                else if (_state.level == "circonscription") _state.level = "canton";
                setMapData();
                updateAreasData();
                updateMapLegend();
                updateTitle();
            }
            updateBarSize(1);
            updateBarSize(2);
            break;
        case 40: // Down
            if (_state.highlight != null) {
                _state.highlight = null;
                updateAreasColor();
                console.log("Dé-highlight");
            } else {
                if (_state.level == "region") {
                    _state.level = "departement";
                } else if (_state.level == "departement") {
                    _state.level = "circonscription";
                }
                setMapData();
                updateAreasData();
                updateMapLegend();
                updateTitle();
            }
            updateBarSize(1);
            updateBarSize(2);
            break;
        case 84: // t
            if (_state.turn == 2) {
                _state.turn = 1;
                updateTitle();
                updateAreasColor();
                updateMapLegend();
                console.log("Tour 1");
            } else if (canFocusSecondTurn()) {
                _state.turn = 2;
                updateAreasColor();
                updateMapLegend();
                updateTitle();
                console.log("Tour 2");
            } else {
                console.log("Pas de mise à jour");
            }
            break;
        case 70: // f
            _state.filter = null;
            _state.highlight = null;
            updateBarSize(1);
            updateBarSize(2);
            setMapData();
            updateAreasData();
            updateMapLegend();
            updateTitle();
            centerProjection();
            console.log("Plus de filtre");
            break;
    }
    console.log(_state);
}

var createViz = function() {
    _elements.map = d3
        .select("#mapBox")
        .append("svg")
        .call(_visual.zoom)
        .on("dblclick.zoom", null)
        .append("g")
        .attr("id", "map")
        .attr("clip-path", "url(#clip)");

    _elements.map
        .append("rect")
        .attr("id", "pz")
        .attr("width", "100%")
        .attr("height", "100%")
        .style("fill", "none")
        .style("pointer-events", "all");

    _elements.barFirstTurn = d3
        .select("#barFirstTurn")
        .append("svg")
        .attr("id", "bars")
        .attr("viewBox", "0 0 500 500");

    _elements.barSecondTurn = d3
        .select("#barSecondTurn")
        .append("svg")
        .attr("id", "bars")
        .attr("viewBox", "0 0 500 500");

    d3.select("body").on("keydown", keydown); // React to key events

    loadData();
};

var getTextBox = function(selection) {
    selection.each(function(d) {
        d.bbox = this.getBBox();
    });
};

var centerProjection = function() {
    d3.select("#mapBox")
        .select("svg")
        .transition()
        .duration(1000)
        .call(_visual.zoom.transform, d3.zoomIdentity.translate(0, 0).scale(1));
};

var focusArea = function(data) {
    var properties = data.srcElement["__data__"].properties;
    console.log("Focus sur " + properties.name_area);

    var centroid = getPath().centroid(data.srcElement["__data__"]);
    var bounds = getPath().bounds(data.srcElement["__data__"]);
    var svg = d3.select("#mapBox").node().getBoundingClientRect();
    var svgBounds = [svg.width, svg.height];

    var paddingPercentage = 10;
    var minXY = bounds[0];
    var maxXY = bounds[1];
    // find size of map area defined
    var zoomWidth = Math.abs(minXY[0] - maxXY[0]);
    var zoomHeight = Math.abs(minXY[1] - maxXY[1]);
    // find midpoint of map area defined
    var zoomMidX = centroid[0];
    var zoomMidY = centroid[1];
    // increase map area to include padding
    var zoomWidth = zoomWidth * (1 + paddingPercentage / 100);
    var zoomHeight = zoomHeight * (1 + paddingPercentage / 100);
    // find scale required for area to fill svg
    var maxXscale = svgBounds[0] / zoomWidth;
    var maxYscale = svgBounds[1] / zoomHeight;

    var zoomScale = 0.6 * Math.min(maxXscale, maxYscale);
    // handle some edge cassette

    // Find screen pixel equivalent once scaled
    var offsetX = zoomScale * zoomMidX;
    var offsetY = zoomScale * zoomMidY;

    // Find offset to centre
    var dleft = svgBounds[0] / 2 - offsetX;
    var dtop = svgBounds[1] / 2 - offsetY;

    d3.select("#mapBox")
        .select("svg")
        .transition()
        .duration(1000)
        .call(
            _visual.zoom.transform,
            d3.zoomIdentity.translate(dleft, dtop).scale(zoomScale)
        );

    if (_state.level == "region" || _state.level == "departement") {
        _state.filter = {
            level: _state.level,
            name: properties.name_area,
            idParentArea: properties.id_area,
        };
        _state.highlight = null;
        if (_state.level == "region") _state.level = "departement";
        else if (_state.level == "departement") _state.level = "circonscription";

        setMapData();
        updateAreasData();
        updateBarSize(1);
        updateBarSize(2);
        updateTitle();
    }
    console.log(_state);
};

var highlightArea = function(data) {
    var properties = data.srcElement["__data__"].properties;
    console.log("Highlight sur " + properties.name_area);

    if (
        _state.highlight == null ||
        _state.highlight.areaID != properties.id_area
    ) {
        console.log("Highlight sur " + properties.name_area);
        _state.highlight = {
            areaID: properties.id_area,
            name: properties.name_area,
        };

        updateAreasColor();
        updateBarSize(1);
        updateBarSize(2);
        updateTitle();
    } else {
        console.log("Dé-highlight sur " + properties.name_area);
        _state.highlight = null;

        updateAreasColor();
        updateBarSize(1);
        updateBarSize(2);
        updateTitle();
    }
    console.log(_state);
};

var focusCandidate = function(candidate) {
    if (_state.state.name == "global") {
        if (!getCandidates((turn = 2)).includes(candidate) && _state.turn == 2) {
            console.log("Can't focus " + candidate + " for second turn");
        } else {
            // Focus single candidate
            _state.state = {
                name: "candidate",
                candidate: candidate,
            };

            setMapData();
            updateBarColor(1);
            updateBarColor(2);
            updateAreasColor();
            updateTitle();
            updateMapLegend();
            console.log("Focused : " + candidate);
        }
    } else if (_state.state.name == "candidate") {
        if (_state.state.candidate == candidate) {
            // unfocus single candidate
            _state.state = {
                name: "global",
            };

            updateBarColor(1);
            updateBarColor(2);
            updateAreasColor();
            updateTitle();
            updateMapLegend();
            console.log("Unfocused : " + candidate);
        } else if (!getCandidates((turn = 2)).includes(candidate) &&
            _state.turn == 2
        ) {
            console.log("Can't focus " + candidate + " for second turn");
        } else {
            var previous_candidate = _state.state.candidate;
            _state.state = {
                name: "conflict",
                candidates: [previous_candidate, candidate],
            };
            updateBarColor(1);
            updateBarColor(2);
            updateAreasColor();
            updateTitle();
            updateMapLegend();
            console.log("Focused second candidate : " + candidate);
        }
    } else if (_state.state.name == "conflict") {
        if (_state.state.candidates.includes(candidate)) {
            // unfocus single candidate
            var otherCandidate =
                _state.state.candidates[0] == candidate ?
                _state.state.candidates[1] :
                _state.state.candidates[0];
            _state.state = {
                name: "candidate",
                candidate: otherCandidate,
            };
            updateBarColor(1);
            updateBarColor(2);
            updateAreasColor();
            updateTitle();
            updateMapLegend();
            console.log("Unfocused : " + candidate);
        } else if (!getCandidates((turn = 2)).includes(candidate) &&
            _state.turn == 2
        ) {
            console.log("Can't focus " + candidate + " for second turn");
        } else {
            var previous_candidate = _state.state.candidates[0];
            _state.state = {
                name: "conflict",
                candidates: [previous_candidate, candidate], // Keeps the first candidate and drops the second
            };
            updateBarColor(1);
            updateBarColor(2);
            updateAreasColor();
            updateTitle();
            updateMapLegend();
            console.log("Focused second candidate : " + candidate);
        }
    }
};

var setViz = function() {
    console.log("Initialisation...");

    setMapData();

    setAreas();
    setBars(1);
    setBars(2);
    setMapLegend();
    updateTitle();
};

var setMapLegend = function() {
    var mapBox = d3.select("#mapBox").node().getBoundingClientRect();
    var mapBoxSize = [mapBox.width, mapBox.height];

    var mapData = _state.mapData;

    d3.select("#mapBox")
        .select("svg")
        .append("g")
        .attr("id", "legendConflict")
        .attr("opacity", 0)
        .attr(
            "transform",
            "translate(" + mapBoxSize[0] * 0.9 + ", " + mapBoxSize[1] * 0.05 + ")"
        );

    d3.select("#legendConflict").append("g").attr("id", "axis");

    d3.select("#legendConflict")
        .append("g")
        .attr("id", "colors")
        .attr("transform", "translate(5, 0)");

    d3.select("#legendConflict")
        .append("text")
        .attr("id", "textTop")
        .attr("opacity", 1)
        .attr("transform", "translate(0, -10)");

    d3.select("#legendConflict")
        .append("text")
        .attr("id", "textBottom")
        .attr("opacity", 1)
        .attr("transform", "translate(0, 210)");

    var legendLines = 50;
    var legendHeight = 200;
    var legendVerticalScale = d3
        .scaleLinear()
        .domain([0, legendLines])
        .range([0, legendHeight]);
    var lineHeight = legendVerticalScale(1) - legendVerticalScale(0);

    d3.select("#legendConflict")
        .select("#colors")
        .selectAll("rect")
        .data(Array.from({ length: legendLines }, (x, i) => i))
        .enter()
        .append("rect")
        .attr("height", lineHeight)
        .attr("width", 20)
        .attr("y", (d, index) => legendVerticalScale(index));

    updateMapLegend(mapData);
};

var updateMapLegend = function() {
    var mapData = _state.mapData;

    if (_state.state.name == "conflict") {
        var domain = getConflictScaleDomain(mapData);
        var colorScale = getConflictColorScale(mapData);
        var range = d3.scaleLinear().domain([0, 50]).range([domain[0], domain[2]]);

        d3.select("#legendConflict").transition().duration(1000).attr("opacity", 1);

        d3.select("#legendConflict")
            .select("#colors")
            .selectAll("rect")
            .transition()
            .duration(1000)
            .attr("fill", (d) => colorScale(range(d))); // Range and index are the same

        var verticalScale = d3
            .scaleLinear()
            .domain([domain[0], domain[2]])
            .range([0, 200]);

        d3.select("#legendConflict")
            .select("#axis")
            .transition()
            .duration(1000)
            .call(d3.axisLeft(verticalScale));

        d3.select("#legendConflict")
            .select("#textTop")
            .transition()
            .duration(1000)
            .attr("opacity", 1)
            .text(candidates[_state.state.candidates[0]].label);

        d3.select("#legendConflict")
            .select("#textBottom")
            .transition()
            .duration(1000)
            .attr("opacity", 1)
            .text(candidates[_state.state.candidates[1]].label);
    } else if (_state.state.name == "candidate") {
        var domain = getCandidateScaleDomain(mapData);
        var colorScale = getCandidateColorScale(mapData);
        var range = d3.scaleLinear().domain([0, 50]).range(domain);

        d3.select("#legendConflict").transition().duration(1000).attr("opacity", 1);

        d3.select("#legendConflict")
            .select("#colors")
            .selectAll("rect")
            .transition()
            .duration(1000)
            .attr("fill", (d) => colorScale(range(50 - d))); // Range and index are the same

        var verticalScale = d3.scaleLinear().domain(domain).range([200, 0]);

        d3.select("#legendConflict")
            .select("#axis")
            .transition()
            .duration(1000)
            .call(d3.axisLeft(verticalScale));

        d3.select("#legendConflict")
            .select("#textTop")
            .transition()
            .duration(1000)
            .text(candidates[_state.state.candidate].label)
            .attr("opacity", 1);

        d3.select("#legendConflict")
            .select("#textBottom")
            .transition()
            .duration(1000)
            .attr("opacity", 0);
    } else {
        d3.select("#legendConflict").transition().duration(1000).attr("opacity", 0);
    }
};

var setBars = function(turn) {
    var svg = getBarSvg(turn);
    var candidatesArray = getCandidates(turn);

    svg.append("g").attr("id", "bars");

    var candidatesLabel = candidatesArray.map(
        (candidate) => candidates[candidate].label
    );

    var margin = 20;
    var candidateCount = candidatesArray.length;

    var scaleY = d3
        .scaleLinear()
        .domain([0, candidateCount])
        .range([margin, 380]);
    var scaleYlabels = d3
        .scaleBand()
        .domain(candidatesLabel)
        .padding(0.1)
        .range([margin, 380]);
    var barHeight = scaleY(0.9) - scaleY(0.1);

    // Horizontal axis votes
    svg
        .append("g")
        .attr("id", "horizontalAxisVote")
        .attr("transform", "translate(110,390)");

    // Horizontal axis percentage
    svg
        .append("g")
        .attr("id", "horizontalAxisPercent")
        .attr("transform", "translate(110,450)");

    svg
        .append("g")
        .attr("id", "verticalAxis")
        .attr("transform", "translate(100,0)")
        .call(d3.axisLeft(scaleYlabels));

    svg
        .append("text")
        .attr("text-align", "right")
        .attr("width", 100 - margin)
        .attr("transform", "translate(" + margin + ",410)")
        .text("Nombre de votes");

    svg
        .append("text")
        .style("text-align", "right")
        .attr("width", 100 - margin)
        .attr("transform", "translate(" + margin + ",470)")
        .text("Part de votes");

    svg
        .select("g#bars")
        .selectAll("rect.bar")
        .data(candidatesArray)
        .enter()
        .append("rect")
        .attr("class", "bar")
        .attr("x", 110)
        .attr("y", (d, index) => scaleY(index + 0.1))
        .attr("height", barHeight + 1)
        .attr("width", 0)
        .attr("fill", "white")
        .on("click", function(data) {
            focusCandidate(data.srcElement.__data__);
        });

    updateBarColor(turn, (duration = 0));
    updateBarSize(turn);
};

var updateBarColor = function(turn, duration = 1000) {
    getBarSvg(turn)
        .select("g#bars")
        .selectAll("rect.bar")
        .transition()
        .duration(duration)
        .attr("fill", getBarColorFunction());
};

var getBarSvg = function(turn) {
    if (turn == 1) return _elements.barFirstTurn;
    return _elements.barSecondTurn;
};

var updateBarSize = function(turn) {
    var margin = 10;
    var svg = getBarSvg(turn);
    var votes = getCandidatesVotes(turn);
    var scaleX = getBarVoteScale([0, 390 - margin], votes);
    var scaleXpercent = getBarProportionScale([0, 390 - margin], votes);

    // Horizontal axis votes
    svg
        .select("g#horizontalAxisVote")
        .transition()
        .duration(1000)
        .call(d3.axisBottom(scaleX))
        .selectAll("text")
        .attr("font-size", "small")
        .attr("transform", "translate(0,0)rotate(-30)")
        .style("text-anchor", "end");

    // Horizontal axis percentage
    svg
        .select("g#horizontalAxisPercent")
        .transition()
        .duration(1000)
        .call(d3.axisBottom(scaleXpercent))
        .selectAll("text")
        .attr("font-size", "small")
        .attr("transform", "translate(4,2)")
        .style("text-anchor", "end");

    svg
        .select("g#bars")
        .selectAll("rect.bar")
        .transition()
        .duration(1000)
        .attr("width", (candidate) => scaleX(votes[candidate]));
};

var updateAreasData = function() {
    _elements.map.select("g#areas").selectAll("path.area").remove();
    _elements.map.select("g#areaLabels").selectAll("g.areaLabel").remove();

    var mapData = _state.mapData;

    var path = getPath();

    var colorFunction = getMapColorFunction(mapData);

    _elements.map
        .select("g#areas")
        .selectAll("path.area")
        .data(mapData)
        .enter()
        .append("path")
        .attr("id", "area")
        .attr("d", path)
        .attr("class", "area")
        .attr("opacity", 1)
        .style("fill", colorFunction)
        .on("mouseover", function(d) {
            d3.select("#areaLabel" + d.target.__data__.properties.id_area).style(
                "display",
                "block"
            );
        })
        .on("mouseout", function(d) {
            d3.select("#areaLabel" + d.target.__data__.properties.id_area).style(
                "display",
                "none"
            );
        })
        .on("dblclick", function(item) {
            focusArea(item);
        })
        .on("click", function(item) {
            highlightArea(item);
        });

    areaLabels = _elements.map
        .select("g#areaLabels")
        .selectAll("g")
        .data(mapData)
        .enter()
        .append("g")
        .attr("class", "areaLabel")
        .attr("id", function(d) {
            return "areaLabel" + d.properties.id_area;
        })
        .attr("transform", function(d) {
            return (
                "translate(" +
                d.properties.centroid[0] +
                "," +
                d.properties.centroid[1] +
                ")scale(" +
                1 / _visual.transform.k +
                ")"
            );
        })
        // add mouseover functionality to the label
        .on("mouseover", function(d, i) {
            d3.select(this).style("display", "block");
        })
        .on("mouseout", function(d, i) {
            d3.select(this).style("display", "none");
        });

    areaLabels
        .append("text")
        .attr("class", "areaName")
        .style("text-anchor", "middle")
        .attr("dx", 0)
        .attr("dy", 0)
        .text(function(d) {
            return d.properties.name_area;
        })
        .call(getTextBox);

    // add a background rectangle the same size as the text
    areaLabels
        .insert("rect", "text")
        .attr("class", "areaLabelBackground")
        .attr("transform", function(d) {
            return "translate(" + (d.bbox.x - 2) + "," + d.bbox.y + ")";
        })
        .attr("width", function(d) {
            return d.bbox.width + 4;
        })
        .attr("height", function(d) {
            return d.bbox.height;
        });
};

var updateAreasColor = function() {
    _elements.map
        .select("g#areas")
        .selectAll("path.area")
        .transition()
        .duration(1000)
        .style("fill", getMapColorFunction())
        .attr("opacity", getMapOpacityFunction());
};

var setAreas = function() {
    _elements.map.append("g").attr("id", "areas");
    _elements.map.append("g").attr("id", "areaLabels");

    updateAreasData();
};

var updateTitle = function() {
    d3.select(".title").text("Résultats élections présidentielles 2017");

    var subtitle = "";
    if (_state.turn == 1) subtitle += "Tour 1 | ";
    else subtitle += "Tour 2 | ";

    if (_state.state.name == "global") subtitle += "Gagnant | ";
    else if (_state.state.name == "candidate")
        subtitle +=
        "Résultats de : " + candidates[_state.state.candidate].label + " | ";
    else if (_state.state.name == "conflict")
        subtitle +=
        "Comparaison entre : " +
        candidates[_state.state.candidates[0]].label +
        " et " +
        candidates[_state.state.candidates[1]].label +
        " | ";

    if (_state.highlight != null) subtitle += _state.highlight.name + " | ";
    else {
        if (_state.filter == null) subtitle += "France entière | ";
        else subtitle += _state.filter.name + " | ";
    }

    subtitle += " Échelle : ";
    switch (_state.level) {
        case "region":
            subtitle += "Région";
            break;
        case "departement":
            subtitle += "Département";
            break;
        case "circonscription":
            subtitle += "Circonscription";
            break;
        case "canton":
            subtitle += "Canton";
            break;
    }

    d3.select(".subtitle").text(subtitle);
};