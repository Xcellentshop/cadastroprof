function StatsChart({ teachers }) {
    const chartRef = React.useRef(null);
    const [chart, setChart] = React.useState(null);

    React.useEffect(() => {
        try {
            if (chartRef.current) {
                if (chart) {
                    chart.destroy();
                }

                const optionsCount = teachers.reduce((acc, teacher) => {
                    teacher.selectedOptions.forEach(option => {
                        acc[option] = (acc[option] || 0) + 1;
                    });
                    return acc;
                }, {});

                const newChart = new Chart(chartRef.current, {
                    type: 'pie',
                    data: {
                        labels: [
                            'EBD (Domingo)',
                            'EBQ (Quarta)',
                            'CULTO KIDS',
                            'EBQ (Quinta)'
                        ],
                        datasets: [{
                            data: [
                                optionsCount[1] || 0,
                                optionsCount[2] || 0,
                                optionsCount[3] || 0,
                                optionsCount[4] || 0
                            ],
                            backgroundColor: [
                                '#4299e1',
                                '#48bb78',
                                '#ed64a6',
                                '#ecc94b'
                            ]
                        }]
                    },
                    options: {
                        responsive: true,
                        plugins: {
                            legend: {
                                position: 'bottom'
                            },
                            title: {
                                display: true,
                                text: 'Distribuição de Escolhas'
                            }
                        }
                    }
                });

                setChart(newChart);
            }
        } catch (error) {
            reportError(error);
        }
    }, [teachers]);

    return (
        <div className="chart-container" data-name="stats-chart">
            <canvas ref={chartRef}></canvas>
        </div>
    );
}
