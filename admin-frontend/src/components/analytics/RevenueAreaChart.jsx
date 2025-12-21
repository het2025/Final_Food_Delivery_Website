import * as React from 'react';
import { LineChart, lineElementClasses } from '@mui/x-charts/LineChart';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';

export default function RevenueAreaChart({ data }) {
    if (!data || data.length === 0) return null;

    const dates = data.map(d => d.date);
    const revenue = data.map(d => d.revenue);

    return (
        <Box sx={{ width: '101%', height: 350, p: 2, border: '1px solid', borderColor: 'divider', borderRadius: 2, bgcolor: 'background.paper' }}>
            <Typography variant="h6" gutterBottom>Revenue Trend</Typography>
            <Box sx={{ width: '100%', height: 300 }}>
                <LineChart
                    series={[{
                        data: revenue,
                        label: 'Revenue (₹)',
                        area: true,
                        showMark: false,
                        color: '#10B981'
                    }]}
                    xAxis={[{ scaleType: 'point', data: dates, tickLabelStyle: { angle: 0, textAnchor: 'middle' } }]}
                    sx={{
                        [`& .${lineElementClasses.root}`]: {
                            strokeWidth: 2,
                        },
                    }}
                />
            </Box>
        </Box>
    );
}
