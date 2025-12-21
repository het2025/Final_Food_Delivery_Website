import * as React from 'react';
import Stack from '@mui/material/Stack';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import { interpolateBlues } from 'd3-scale-chromatic';

// Custom Heatmap implementation using CSS Grid since @mui/x-charts-pro is commercial
export default function ActivityHeatmap({ data }) {
    if (!data || data.length === 0) return null;

    // Data is [ { hour: '00', Mon: 5, Tue: 2, ... }, ... ]
    const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
    const hours = data.map(d => d.hour);

    // Find max value for color scaling
    let maxVal = 0;
    data.forEach(row => {
        days.forEach(day => {
            if (row[day] > maxVal) maxVal = row[day];
        });
    });

    const getColor = (value) => {
        if (value === 0) return 'rgba(255,255,255,0.05)'; // Very faint for 0
        // Use D3 interpolator or simple opacity
        // interpolateBlues returns rgb(r, g, b)
        // We normalize value 0 to 1
        const t = maxVal > 0 ? value / maxVal : 0;
        // Boost low values slightly for visibility
        return interpolateBlues(Math.min(t + 0.1, 1));
    };

    return (
        <Box sx={{ width: '400%', p: 2, border: '1px solid', borderColor: 'divider', borderRadius: 2, bgcolor: 'background.paper', overflowX: 'auto' }}>
            <Typography variant="h6" gutterBottom>Peak Activity (Orders)</Typography>
            <Box sx={{
                display: 'grid',
                gridTemplateColumns: `auto repeat(${days.length}, 1fr)`,
                gap: 0.5,
                minWidth: '100%', // Ensure it tries to fill width
                width: '100%'
            }}>
                {/* Header Row */}
                <Box></Box> {/* Empty top-left */}
                {days.map(day => (
                    <Typography key={day} variant="caption" align="center" sx={{ fontWeight: 'bold' }}>{day}</Typography>
                ))}

                {/* Rows */}
                {data.map((row) => (
                    <React.Fragment key={row.hour}>
                        <Typography variant="caption" sx={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', pr: 1 }}>
                            {row.hour}:00
                        </Typography>
                        {days.map(day => (
                            <Box
                                key={`${row.hour}-${day}`}
                                sx={{
                                    bgcolor: getColor(row[day]),
                                    height: 30,
                                    borderRadius: 0.5,
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    cursor: 'default'
                                }}
                                title={`${day} ${row.hour}:00 - ${row[day]} orders`}
                            >
                                {row[day] > 0 && <Typography variant="caption" sx={{ fontSize: '0.6rem', color: row[day] > maxVal / 2 ? 'white' : 'black' }}>{row[day]}</Typography>}
                            </Box>
                        ))}
                    </React.Fragment>
                ))}
            </Box>
        </Box>
    );
}
