function Chart({ type = 'bar', data, title }) {
  const canvasRef = React.useRef(null);
  const chartRef = React.useRef(null);

  React.useEffect(() => {
    if (canvasRef.current) {
      if (chartRef.current) chartRef.current.destroy();
      chartRef.current = new Chart(canvasRef.current, {
        type,
        data: {
          labels: data.labels || [],
          datasets: [{
            label: title,
            data: data.values || [],
            backgroundColor: 'rgba(123, 104, 238, 0.6)',
            borderColor: '#4b3c8e',
            borderWidth: 1
          }]
        },
        options: {
          responsive: true,
          plugins: {
            legend: { position: 'top' },
            title: { display: true, text: title, font: { size: 16 } }
          },
          scales: {
            y: { beginAtZero: true }
          }
        }
      });
    }
    return () => chartRef.current?.destroy();
  }, [data, type, title]);

  return (
    <div className="bg-white p-4 rounded-lg shadow-lg">
      <canvas ref={canvasRef} aria-label={title} role="img"></canvas>
    </div>
  );
}