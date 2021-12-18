const _files = {
  map: {
    region:
      "../clean_datasets/maps_france_v2/regions-version-simplifiee.geojson",
    departement:
      "../clean_datasets/maps_france_v2/departements-version-simplifiee.geojson",
    circonscription:
      "../clean_datasets/maps_france_v2/circonscriptions.geojson",
    canton:
      "../clean_datasets/maps_france_v2/cantons-version-simplifiee.geojson",
    metropole: "../clean_datasets/maps_france_v2/metropole.geojson"
  },
  data_1: {
    region: "../clean_datasets/pipeline/region/regions_1.output.csv",
    departement:
      "../clean_datasets/pipeline/departement/departements_1.output.csv",
    circonscription:
      "../clean_datasets/pipeline/circonscription/circonscriptions_1.output.csv",
    canton: "../clean_datasets/pipeline/canton/cantons_1.output.csv"
  },
  data_2: {
    region: "../clean_datasets/pipeline/region/regions_2.output.csv",
    departement:
      "../clean_datasets/pipeline/departement/departements_2.output.csv",
    circonscription:
      "../clean_datasets/pipeline/circonscription/circonscriptions_2.output.csv",
    canton: "../clean_datasets/pipeline/canton/cantons_2.output.csv"
  },
};

var _data = {
  map: {
    region: null,
    departement: null,
    circonscription: null,
    canton: null
  },
  data_1: {
    region: null,
    departement: null,
    circonscription: null,
    canton: null
  },
  data_2: {
    region: null,
    departement: null,
    circonscription: null,
    canton: null
  },
};

var candidates = {
  DP: { color: "#7B241C", label: "Dupont-Aignan" },
  LP: { color: "#283747", label: "Le Pen" },
  MA: { color: "#A569BD", label: "Macron" },
  HA: { color: "#CB4335", label: "Hamon" },
  AR: { color: "#F39C12", label: "Arthaud" },
  PO: { color: "#633974", label: "Poutou" },
  CH: { color: "#196F3D", label: "Cheminade" },
  LA: { color: "#45B39D", label: "Lassale" },
  ME: { color: "#E67E22", label: "Mélenchon" },
  AS: { color: "#2874A6", label: "Asselineau" },
  FI: { color: "#2E86C1", label: "Fillon" },
  UNDEFINED: { color: "white", label: "null" },
};

/**
 * Sets attributes of map with the its winner, the proportion of each candidate for first and second turn, its name, its id and its parent_id
 * @param {.geojson} map
 * @param {.output} data_1
 * @param {.output} data_2
 * @param {string} mapIdentifier
 */
var bindMapData = function (map, data_1, data_2, mapIdentifier) {
  map.features.forEach((area) => {
    var candidatesResults_1 = data_1.filter(function (line) {
      return (
        line.id_area == area.properties[mapIdentifier] ||
        +line.id_area == +area.properties[mapIdentifier]
      );
    });
    var candidatesResults_2 = data_2.filter(function (line) {
      return (
        line.id_area == area.properties[mapIdentifier] ||
        +line.id_area == +area.properties[mapIdentifier]
      );
    });
    if (candidatesResults_1.length == 0) {
      area.properties.winner_1 = "UNDEFINED";
    } else {
      candidatesResults_1.forEach((row) => {
        area.properties[row.candidate + "_1"] = row.votes;
        area.properties[row.candidate + "_p_1"] = row.proportion;
      });
      var maxVoix_1 = candidatesResults_1[0].votes;
      var maxIndex_1 = 0;
      for (index = 1; index < candidatesResults_1.length; index++) {
        if (+candidatesResults_1[index].votes > +maxVoix_1) {
          maxIndex_1 = index;
          maxVoix_1 = candidatesResults_1[index].votes;
        }
      }
      area.properties.winner_1 = candidatesResults_1[maxIndex_1].candidate;
      area.properties.id_area = candidatesResults_1[maxIndex_1].id_area;
      area.properties.name_area = candidatesResults_1[maxIndex_1].name_area;
      area.properties.id_region = candidatesResults_1[maxIndex_1].id_region;
      area.properties.id_departement =
        candidatesResults_1[maxIndex_1].id_departement;
    }
    if (candidatesResults_2.length == 0) {
      area.properties.winner_2 = "UNDEFINED";
    } else {
      candidatesResults_2.forEach((row) => {
        area.properties[row.candidate + "_2"] = row.votes;
        area.properties[row.candidate + "_p_2"] = row.proportion;
      });
      var maxVoix_2 = candidatesResults_2[0].votes;
      var maxIndex_2 = 0;
      for (index = 1; index < candidatesResults_2.length; index++) {
        if (+candidatesResults_2[index].votes > +maxVoix_2) {
          maxIndex_2 = index;
          maxVoix_2 = candidatesResults_2[index].votes;
        }
      }
      area.properties.winner_2 = candidatesResults_2[maxIndex_2].candidate;
      area.properties.id_area = candidatesResults_1[maxIndex_2].id_area;
      area.properties.name_area = candidatesResults_1[maxIndex_2].name_area;
      area.properties.id_region = candidatesResults_1[maxIndex_2].id_region;
      area.properties.id_departement =
        candidatesResults_1[maxIndex_2].id_departement;
    }
  });
};

var loadData = function () {
  Promise.all([
    d3.json(_files.map.metropole),
    d3.json(_files.map.region),
    d3.json(_files.map.departement),
    d3.json(_files.map.circonscription),
    d3.json(_files.map.canton),
    d3.csv(_files.data_1.region),
    d3.csv(_files.data_1.departement),
    d3.csv(_files.data_1.circonscription),
    d3.csv(_files.data_1.canton),
    d3.csv(_files.data_2.region),
    d3.csv(_files.data_2.departement),
    d3.csv(_files.data_2.circonscription),
    d3.csv(_files.data_2.canton),
  ]).then(function (loadedData) {
    console.log("Data loaded...");

    _data.map = {
      region: loadedData[1],
      departement: loadedData[2],
      circonscription: loadedData[3],
      canton: loadedData[4]
    };

    _data.data_1 = {
      region: loadedData[5],
      departement: loadedData[6],
      circonscription: loadedData[7],
      canton: loadedData[8]
    };

    _data.data_2 = {
      region: loadedData[9],
      departement: loadedData[10],
      circonscription: loadedData[11],
      canton: loadedData[12]
    };

    var mapBox = d3.select("#mapBox").node().getBoundingClientRect();
    var mapBoxSize = [mapBox.width, mapBox.height];

    _visual.projection = d3.geoMercator().fitSize(mapBoxSize, loadedData[0]);
    _visual.path = d3.geoPath().projection(_visual.projection);

    bindMapData(
      _data.map.region,
      _data.data_1.region,
      _data.data_2.region,
      "code"
    );
    bindMapData(
      _data.map.departement,
      _data.data_1.departement,
      _data.data_2.departement,
      "code"
    );
    bindMapData(
      _data.map.circonscription,
      _data.data_1.circonscription,
      _data.data_2.circonscription,
      "ID"
    );
    bindMapData(
      _data.map.canton,
      _data.data_1.canton,
      _data.data_2.canton,
      "code"
    );

    setCentroid(_data.map.region, getPath());
    setCentroid(_data.map.departement, getPath());
    setCentroid(_data.map.circonscription, getPath());
    setCentroid(_data.map.canton, getPath());

    setViz();
  });
};

var getSuffix = function (turn) {
  return turn == 1 ? "_1" : "_2";
};

var setCentroid = function (data, path) {
  data.features.forEach(function (area) {
    area.properties.centroid = path.centroid(area);
  });
};

var setMapData = function () {
  var map = _data.map[_state.level];
  if (_state.filter == null) {
    // Not filtering
    _state.mapData = map.features;
  } else {
    // Filtering from a parent area
    if (_state.filter.level == "region") {
      if (_state.level == "region")
        _state.mapData = map.features.filter(
          (area) => area.properties.id_area == _state.filter.idParentArea
        );
      else
        _state.mapData = map.features.filter(
          (area) => area.properties.id_region == _state.filter.idParentArea
        );
    } else if (_state.filter.level == "departement") {
      if (_state.level == "departement")
        _state.mapData = map.features.filter(
          (area) => area.properties.id_area == _state.filter.idParentArea
        );
      else
        _state.mapData = map.features.filter(
          (area) => area.properties.id_departement == _state.filter.idParentArea
        );
    }
  }
};

/**
 *
 * @returns The vote proportions, as an array, filtered by the candidate (implies the current mode is candidate)
 */
var getVoteProportions = function (turn) {
  if (_state.state.name != "candidate") throw "Case not implemented";
  var suffix = getSuffix(turn);
  return _state.mapData.map(
    (area) => +area.properties[_state.state.candidate + "_p" + suffix]
  );
};

/**
 *
 * @returns The difference of vote proportions, as an array, filtered by the candidates (implies the current mode is conflict)
 */
var getVoteProportionDifference = function (turn) {
  if (_state.state.name != "conflict") throw "Should be in conflict case";
  var suffix = getSuffix(turn);
  return _state.mapData.map(
    (area) =>
      +area.properties[_state.state.candidates[1] + "_p" + suffix] -
      +area.properties[_state.state.candidates[0] + "_p" + suffix]
  );
};

var getConflictScaleDomain = function () {
  var voteProportionsDifferences = getVoteProportionDifference(_state.turn);
  return [
    d3.min(voteProportionsDifferences),
    d3.median(voteProportionsDifferences),
    d3.max(voteProportionsDifferences),
  ];
};

var getCandidateScaleDomain = function () {
  var voteProportions = getVoteProportions(_state.turn);
  var min = d3.min(voteProportions);
  var max = d3.max(voteProportions);
  return [min, max];
};

var getBarVoteScale = function (range, votes) {
  var maxVotes = d3.max(Object.values(votes));

  return d3.scaleLinear().domain([0, maxVotes]).range(range);
};

var getBarProportionScale = function (range, votes) {
  var sumVotes = Object.values(votes).reduce((a, b) => a + b, 0);
  var maxVote = d3.max(Object.values(votes));

  return d3
    .scaleLinear()
    .domain([0, (100 * maxVote) / sumVotes])
    .range(range);
};

var getCandidateColorScale = function () {
  return d3
    .scaleLinear()
    .domain(getCandidateScaleDomain(_state.turn))
    .range(["white", candidates[_state.state.candidate].color]);
};

var getConflictColorScale = function () {
  return d3
    .scaleLinear()
    .domain(getConflictScaleDomain(_state.turn))
    .range([
      candidates[_state.state.candidates[1]].color,
      "white",
      candidates[_state.state.candidates[0]].color,
    ]);
};

var getMapColorFunction = function () {
  var suffix = getSuffix(_state.turn);
  if (_state.state.name == "global") {
    return (area) => candidates[area.properties["winner" + suffix]].color;
  } else if (_state.state.name == "candidate") {
    var colorScale = getCandidateColorScale();
    return (area) =>
      colorScale(+area.properties[_state.state.candidate + "_p" + suffix]);
  } else if (_state.state.name == "conflict") {
    var colorScale = getConflictColorScale();
    return (area) =>
      colorScale(
        +area.properties[_state.state.candidates[1] + "_p" + suffix] -
        area.properties[_state.state.candidates[0] + "_p" + suffix]
      );
  }
  throw "Case not implemented";
};

var getMapOpacityFunction = function () {
  if (_state.highlight == null) {
    return (area) => 1;
  } else {
    return (area) => {
      if (area.properties.id_area == _state.highlight.areaID) return 1;
      return 0.2;
    };
  }
};

var getBarColorFunction = function () {
  if (_state.state.name == "global") {
    return (candidate) => candidates[candidate].color;
  } else if (_state.state.name == "candidate") {
    return function (candidate) {
      if (candidate == _state.state.candidate)
        return candidates[candidate].color;
      else return "lightgrey";
    };
  } else if (_state.state.name == "conflict") {
    return function (candidate) {
      if (_state.state.candidates.includes(candidate))
        return candidates[candidate].color;
      else return "lightgrey";
    };
  }
};

var getCandidatesVotes = function (turn) {
  var suffix = getSuffix(turn);
  var mapData = _state.mapData;
  var candidates = getCandidates(turn);
  var result = {};
  candidates.forEach((candidate) => (result[candidate] = 0));

  if (_state.highlight == null) {
    mapData.forEach((area) => {
      candidates.forEach((candidate) => {
        if (
          candidate != "UNDEFINED" &&
          !isNaN(+area.properties[candidate + suffix])
        )
          result[candidate] += +area.properties[candidate + suffix];
      });
    });
  } else {
    mapData.forEach((area) => {
      if (area.properties.id_area == _state.highlight.areaID) {
        candidates.forEach((candidate) => {
          if (
            candidate != "UNDEFINED" &&
            !isNaN(+area.properties[candidate + suffix])
          )
            result[candidate] += +area.properties[candidate + suffix];
        });
      }
    });
  }

  return result;
};

var getCandidates = function (turn) {
  if (turn == 1)
    return ["MA", "LP", "FI", "ME", "HA", "DP", "LA", "PO", "AS", "AR", "CH"];
  return ["MA", "LP"];
};

function getProjection() {
  return _visual.projection;
}

function getPath() {
  return _visual.path;
}

var canFocusSecondTurn = function () {
  var secondTurnCandidates = getCandidates(2);
  return (
    _state.state.name == "global" ||
    (_state.state.name == "candidate" &&
      secondTurnCandidates.includes(_state.state.candidate)) ||
    (_state.state.name == "conflict" &&
      secondTurnCandidates.includes(_state.state.candidates[0]) &&
      secondTurnCandidates.includes(_state.state.candidates[1]))
  );
};
