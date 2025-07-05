import React, { useRef, useEffect } from "react";
import * as d3 from "d3";
import { createScope, Scope } from "animejs";
import { pulse } from "../animations/emphasis/pulse";
import { spin } from "../animations/cohering/spin";

const ExampleD3BarChart: React.FC = () => {
  const svgRef = useRef<SVGSVGElement | null>(null);
  const scope = useRef<Scope | null>(null);

  useEffect(() => {
    if (!svgRef.current) return;

    const data = Array.from({ length: 10 }, () =>
      Math.floor(Math.random() * 100)
    ); // 随机生成数据

    const margin = { top: 20, right: 30, bottom: 40, left: 40 };
    const width = 600 - margin.left - margin.right;
    const height = 400 - margin.top - margin.bottom;

    d3.select(svgRef.current).selectAll("*").remove(); // 清除旧图表

    const svg = d3
      .select(svgRef.current)
      .attr("width", width + margin.left + margin.right)
      .attr("height", height + margin.top + margin.bottom)
      .append("g")
      .attr("transform", `translate(${margin.left},${margin.top})`);

    const x = d3
      .scaleBand()
      .domain(data.map((_, i) => i.toString()))
      .range([0, width])
      .padding(0.1);

    const y = d3
      .scaleLinear()
      .domain([0, d3.max(data) || 0])
      .nice()
      .range([height, 0]);

    svg
      .append("g")
      .selectAll("rect")
      .data(data)
      .enter()
      .append("rect")
      .attr("x", (_, i) => x(i.toString()) || 0)
      .attr("y", (d) => y(d))
      .attr("width", x.bandwidth())
      .attr("height", (d) => height - y(d))
      // 添加自定义属性, 动画用
      .attr("data-index", (_, i) => i)
      .attr("data-value", (d) => d)
      .attr("fill", "steelblue");

    svg
      .append("g")
      .attr("transform", `translate(0,${height})`)
      .call(d3.axisBottom(x));

    svg.append("g").call(d3.axisLeft(y));
  }, []);

  useEffect(() => {
    if (!svgRef.current) return;
    scope.current = createScope({ root: svgRef }).add((self) => {
      const barSelectors = "rect";
      const barElems = Array.from(
        self.root.querySelectorAll(barSelectors)
      ).sort(
        (a, b) =>
          parseInt(a.getAttribute("data-index") || "0") -
          parseInt(b.getAttribute("data-index") || "0")
      );

      const idx = d3.randomInt(barElems.length)();
      const barElem = barElems[idx];

      // pulse(barElem);
      spin(svgRef.current!, {
        rotate: 90,
        scale: 1.5,
      });
    });
    return () => scope.current?.revert();
  }, []);

  return (
    <div>
      <h2>随机D3柱状图</h2>
      <svg ref={svgRef}></svg>
    </div>
  );
};

export default ExampleD3BarChart;
