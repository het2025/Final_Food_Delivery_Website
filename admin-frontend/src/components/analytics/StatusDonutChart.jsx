import * as React from 'react';
import { PieChart, pieArcLabelClasses } from '@mui/x-charts/PieChart';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import { useDrawingArea } from '@mui/x-charts/hooks';
import { styled } from '@mui/material/styles';

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

export default function StatusDonutChart({ data }) {
    if (!data || data.length === 0) return null;

    // Group into Success (Delivered) vs Failed (Cancelled, Rejected)
    const successCount = data.find(d => d.status === 'Delivered')?.count || 0;
    const cancelledCount = data.filter(d => ['Cancelled', 'Rejected'].includes(d.status)).reduce((sum, d) => sum + d.count, 0);
    const activeCount = data.filter(d => ['Pending', 'Accepted', 'Preparing', 'Ready', 'Out for Delivery'].includes(d.status)).reduce((sum, d) => sum + d.count, 0);

    const chartData = [
        { label: 'Delivered', value: successCount, color: '#10B981' },
        { label: 'Cancelled/Rejected', value: cancelledCount, color: '#EF4444' },
        { label: 'Active', value: activeCount, color: '#F59E0B' }
    ].filter(d => d.value > 0);

    const total = chartData.reduce((sum, d) => sum + d.value, 0);

    return (
        <Box sx={{ width: '70%', height: 350, p: 2, border: '1px solid', borderColor: 'divider', borderRadius: 2, bgcolor: 'background.paper', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            <Typography variant="h6" align="left" sx={{ width: '100%', mb: 2 }}>Order Status</Typography>
            <PieChart
                series={[
                    {
                        innerRadius: 80,
                        outerRadius: 120,
                        paddingAngle: 2,
                        cornerRadius: 4,
                        data: chartData,
                        arcLabel: (item) => `${((item.value / total) * 100).toFixed(0)}%`,
                    }
                ]}
                sx={{
                    [`& .${pieArcLabelClasses.root}`]: {
                        fill: 'white',
                        fontSize: 12,
                        fontWeight: 'bold',
                    },
                }}
                width={400}
                height={250}
                slotProps={{
                    legend: { hidden: false, direction: 'row', position: { vertical: 'bottom', horizontal: 'middle' } },
                }}
            >
                <PieCenterLabel>{total} Orders</PieCenterLabel>
            </PieChart>
        </Box>
    );
}
