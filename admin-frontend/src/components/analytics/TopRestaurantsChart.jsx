import * as React from 'react';
import { BarChart } from '@mui/x-charts/BarChart';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';

export default function TopRestaurantsChart({ data }) {
    if (!data || data.length === 0) return null;

    // Sort by revenue descending
    const sortedData = [...data].sort((a, b) => b.revenue - a.revenue).slice(0, 10);

    const names = sortedData.map(d => d.name);
    const revenues = sortedData.map(d => d.revenue);

    return (
        <Box sx={{ width: '101%', height: 480, p: 2, border: '1px solid', borderColor: 'divider', borderRadius: 2, bgcolor: 'background.paper' }}>
            <Typography variant="h6" gutterBottom>Top Restaurants by Revenue</Typography>
            <BarChart
                layout="horizontal"
                series={[
                    {
                        data: revenues,
                        label: 'Revenue (₹)',
                        color: '#3B82F6',
                        valueFormatter: (value) => `₹${value.toLocaleString()}`
                    }
                ]}
                yAxis={[{ scaleType: 'band', data: names, tickLabelStyle: { fontSize: 12, width: 100 } }]}
                margin={{ left: 120 }} // Space for long names
                height={390}
                borderRadius={4}
            />
        </Box>
    );
}
