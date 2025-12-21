import * as React from 'react';
import { PieChart, pieArcLabelClasses } from '@mui/x-charts/PieChart';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import { styled } from '@mui/material/styles';
import { useDrawingArea } from '@mui/x-charts/hooks';

const StyledText = styled('text')(({ theme }) => ({
    fill: theme.palette.text.primary,
    textAnchor: 'middle',
    dominantBaseline: 'central',
    fontSize: 20,
}));

function PieCenterLabel({ children }) {
    const { width, height, left, top } = useDrawingArea();
    return (
        <StyledText x={left + width / 2} y={top + height / 2}>
            {children}
        </StyledText>
    );
}

export default function PaymentPieChart({ data }) {
    if (!data || data.length === 0) return null;

    // Format data for chart
    const formattedData = data.map((item, index) => ({
        id: index,
        value: item.count,
        label: item.method,
        color: item.method === 'online' ? '#3B82F6' : '#F59E0B' // Blue for Online, Orange for COD
    }));

    const total = data.reduce((sum, item) => sum + item.count, 0);

    return (
        <Box sx={{ width: '70%', height: 450, p: 2, border: '1px solid', borderColor: 'divider', borderRadius: 2, bgcolor: 'background.paper', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            <Typography variant="h6" align="left" sx={{ width: '100%', mb: 2 }}>Payment Methods</Typography>
            <PieChart
                series={[
                    {
                        innerRadius: 80,
                        outerRadius: 120,
                        paddingAngle: 5,
                        cornerRadius: 5,
                        data: formattedData,
                        arcLabel: (item) => `${((item.value / total) * 100).toFixed(0)}%`,
                    },
                ]}
                sx={{
                    [`& .${pieArcLabelClasses.root}`]: {
                        fill: 'white',
                        fontSize: 14,
                        fontWeight: 'bold',
                    },
                }}
                width={400}
                height={350}
                slotProps={{
                    legend: { hidden: false, direction: 'row', position: { vertical: 'bottom', horizontal: 'middle' } },
                }}
            >
                <PieCenterLabel>Total: {total}</PieCenterLabel>
            </PieChart>
        </Box>
    );
}
