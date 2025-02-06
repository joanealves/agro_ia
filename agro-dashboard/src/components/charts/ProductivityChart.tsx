import Plot from "react-plotly.js";

export default function ProductivityChart() {
  return (
    <Plot
      data={[
        {
          x: ["Jan", "Feb", "Mar", "Apr"],
          y: [10, 15, 7, 20],
          type: "scatter",
          mode: "lines+markers",
          marker: { color: "blue" },
        },
      ]}
      layout={{ title: "Produtividade Agrícola" }}
    />
  );
}
