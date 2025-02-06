"use client"; 

import dynamic from "next/dynamic";

const Plot = dynamic(() => import("react-plotly.js"), { ssr: false });

export default function ProductivityChart() {
  return (
    <Plot
      data={[
        {
          x: ["Janeiro", "Fevereiro", "Março"],
          y: [10, 15, 7],
          type: "bar",
          mode: "lines+markers",
          marker: { color: "blue" },
        },
      ]}
      layout={{ width: 600, height: 400, title: "Produtividade" }}
    />
  );
}
