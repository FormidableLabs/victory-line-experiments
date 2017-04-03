// Use the full index with all re-exported components.
import { VictoryLine } from "victory-chart";

export default render = () => (
  <VictoryLine
    data={[
      {month: "September", profit: 35000, loss: 2000},
      {month: "October", profit: 42000, loss: 8000},
      {month: "November", profit: 55000, loss: 5000}
    ]}
    x="month"
    y={(datum) => datum.profit - datum.loss}
  />
);
