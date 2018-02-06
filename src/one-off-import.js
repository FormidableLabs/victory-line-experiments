// Go straight off of the full path to the individual component.
import React from "react";
import VictoryLine from "victory-chart/es/components/victory-line/victory-line";

export default render = function () {
  return React.createElement(VictoryLine, {
    data: [
      {month: "September", profit: 35000, loss: 2000},
      {month: "October", profit: 42000, loss: 8000},
      {month: "November", profit: 55000, loss: 5000}
    ],
    x: "month",
    y: function (datum) { return datum.profit - datum.loss }
  });
};
