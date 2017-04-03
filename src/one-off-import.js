// Go straight off of the full path to the individual component.
import VictoryLine from "victory-chart/components/victory-line/victory-line";

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
