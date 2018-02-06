// Use the full index with all re-exported components.
import React from "react";
import { VictoryLine } from "victory";

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
