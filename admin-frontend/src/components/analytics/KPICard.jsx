import * as React from 'react';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import { BarChart } from '@mui/x-charts/BarChart';

export default function KPICard({ title, value, data, color, type = 'line' }) {
    // Check if we have monthly data format (array of objects with 'month' and 'value')
    const isMonthlyData = data && data.length > 0 && data[0].hasOwnProperty('month');

    return (
        <Box sx={{
            p: 2,
            border: '1px solid',
            borderColor: 'divider',
            borderRadius: 2,
            bgcolor: 'background.paper',
            height: '100%',
            minHeight: isMonthlyData ? 400 : 150, // Increase height for bar charts
            display: 'flex',
            flexDirection: 'column'
        }}>
            <Typography variant="body2" color="text.secondary" gutterBottom>
                {title}
            </Typography>
            <Typography variant="h4" component="div" sx={{ fontWeight: 'bold', mb: 2 }}>
                {value}
            </Typography>

            <Box sx={{ flexGrow: 1, width: '100%' }}>
                {isMonthlyData ? (
                    <BarChart
                        dataset={data}
                        yAxis={[{ scaleType: 'band', dataKey: 'month' }]}
                        series={[{
                            dataKey: 'value',
                            label: 'Monthly Change',
                            color: color,
                            valueFormatter: (v) => v ? v.toLocaleString() : '0'
                        }]}
                        layout="horizontal"
                        height={300}
                        margin={{ left: 50 }} // Space for Y axis labels
                        slotProps={{
                            legend: { hidden: true }
                        }}
                    />
                ) : (
                    <Box sx={{ height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <Typography variant="caption" color="text.disabled">No monthly data</Typography>
                    </Box>
                )}
            </Box>
        </Box>
    );
}
