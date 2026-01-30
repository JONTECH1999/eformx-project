import React, { useMemo } from 'react';
import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    Legend,
    ResponsiveContainer,
    PieChart,
    Pie,
    Cell,
} from 'recharts';

const COLORS = ['#1a5f6f', '#5a8a96', '#ffbb28', '#ff8042', '#0f4c5c', '#8884d8'];

const AnalyticsCharts = ({ form, responses }) => {
    // Process data for charts
    const chartsData = useMemo(() => {
        if (!form?.fields || !responses?.length) return [];

        return form.fields.map((field) => {
            // Initialize data structure based on field type
            let data = [];
            let type = 'text'; // default

            if (field.type === 'number' || field.type === 'rating') {
                type = 'bar';
                // Initialize counts for ratings 1-5
                const counts = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
                responses.forEach((r) => {
                    const val = r.responses[field.id];
                    if (val && counts[val] !== undefined) counts[val]++;
                });
                data = Object.keys(counts).map((key) => ({
                    name: key,
                    count: counts[key],
                }));
            } else if (field.type === 'select' || field.type === 'radio' || field.type === 'multiple-choice') {
                type = 'pie';
                const counts = {};
                responses.forEach((r) => {
                    const val = r.responses[field.id];
                    if (val) {
                        // Handle array values (checkboxes)
                        const values = Array.isArray(val) ? val : [val];
                        values.forEach(v => {
                            counts[v] = (counts[v] || 0) + 1;
                        });
                    }
                });
                data = Object.keys(counts).map((key) => ({
                    name: key,
                    value: counts[key],
                }));
            } else {
                // For text/date fields, we just collect the last 5 responses for preview
                type = 'list';
                data = responses
                    .map((r) => r.responses[field.id])
                    .filter((v) => v)
                    .slice(0, 5);
            }

            return {
                id: field.id,
                label: field.label,
                type,
                data,
            };
        });
    }, [form, responses]);

    if (!chartsData.length) return <p>No data available for analytics.</p>;

    return (
        <div className="analytics-charts-container">
            {chartsData.map((chart) => (
                <div key={chart.id} className="chart-card">
                    <h3 className="chart-title">{chart.label}</h3>

                    {chart.type === 'bar' && (
                        <div style={{ height: 300, width: '100%' }}>
                            <ResponsiveContainer>
                                <BarChart data={chart.data}>
                                    <CartesianGrid strokeDasharray="3 3" />
                                    <XAxis dataKey="name" />
                                    <YAxis allowDecimals={false} />
                                    <Tooltip />
                                    <Legend />
                                    <Bar dataKey="count" fill="#1a5f6f" name="Responses" />
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                    )}

                    {chart.type === 'pie' && (
                        <div style={{ height: 300, width: '100%' }}>
                            <ResponsiveContainer>
                                <PieChart>
                                    <Pie
                                        data={chart.data}
                                        cx="50%"
                                        cy="50%"
                                        labelLine={false}
                                        label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                                        outerRadius={100}
                                        fill="#8884d8"
                                        dataKey="value"
                                    >
                                        {chart.data.map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                        ))}
                                    </Pie>
                                    <Tooltip />
                                </PieChart>
                            </ResponsiveContainer>
                        </div>
                    )}

                    {chart.type === 'list' && (
                        <ul className="text-response-list">
                            {chart.data.map((text, idx) => (
                                <li key={idx} className="text-response-item">"{text}"</li>
                            ))}
                            {chart.data.length === 0 && <li className="text-muted">No text responses yet.</li>}
                        </ul>
                    )}
                </div>
            ))}
        </div>
    );
};

export default AnalyticsCharts;
