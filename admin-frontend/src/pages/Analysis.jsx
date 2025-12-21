import React, { useState, useEffect } from 'react';
import { analyticsAPI } from '../api/adminApi';
import Box from '@mui/material/Box';
import Grid from '@mui/material/Grid';
import Typography from '@mui/material/Typography';
import CircularProgress from '@mui/material/CircularProgress';

// Components
import KPICard from '../components/analytics/KPICard';
import RevenueAreaChart from '../components/analytics/RevenueAreaChart';
import PaymentPieChart from '../components/analytics/PaymentPieChart';
import ActivityHeatmap from '../components/analytics/ActivityHeatmap';
import StatusDonutChart from '../components/analytics/StatusDonutChart';
import TopRestaurantsChart from '../components/analytics/TopRestaurantsChart';

const Analysis = () => {
    const [loading, setLoading] = useState(true);
    const [data, setData] = useState({
        overview: null,
        orderStatus: [],
        ordersTrend: [],
        paymentSplit: [],
        peakHours: [],
        topRestaurants: []
    });

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            setLoading(true);
            const [overview, orderStatus, ordersTrend, paymentSplit, peakHours, topRestaurants] = await Promise.all([
                analyticsAPI.getOverview(),
                analyticsAPI.getOrderStatus(),
                analyticsAPI.getOrdersTrend(12),
                analyticsAPI.getPaymentSplit(),
                analyticsAPI.getPeakHours(),
                analyticsAPI.getTopRestaurants(10)
            ]);

            setData({
                overview: overview.data.data,
                orderStatus: orderStatus.data.data,
                ordersTrend: ordersTrend.data.data,
                paymentSplit: paymentSplit.data.data,
                peakHours: peakHours.data.data,
                topRestaurants: topRestaurants.data.data
            });
        } catch (error) {
            console.error('Error fetching analytics:', error);
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '80vh' }}>
                <CircularProgress />
            </Box>
        );
    }

    const { overview, orderStatus, ordersTrend, paymentSplit, peakHours, topRestaurants } = data;

    return (
        <Box sx={{ p: 3, bgcolor: '#F3F4F6', minHeight: '100vh' }}>
            <Typography variant="h4" sx={{ mb: 4, fontWeight: 'bold', color: '#1F2937' }}>
                Analytics Dashboard
            </Typography>

            {/* Row 1: Key Metrics (3 cols) */}
            <Grid container spacing={3} sx={{ mb: 4 }}>
                <Grid item xs={12} md={6} lg={4}>
                    <KPICard
                        title="Total Revenue"
                        value={`₹${(overview?.totalRevenue || 0).toLocaleString()}`}
                        color="#10B981"
                        data={overview?.monthlyStats?.revenue}
                    />
                </Grid>
                <Grid item xs={12} md={6} lg={4}>
                    <KPICard
                        title="Total Orders"
                        value={overview?.totalOrders?.toLocaleString()}
                        color="#3B82F6"
                        data={overview?.monthlyStats?.orders}
                    />
                </Grid>
                <Grid item xs={12} md={6} lg={4}>
                    <KPICard
                        title="Active Users"
                        value={overview?.totalUsers?.toLocaleString()}
                        color="#8B5CF6"
                        data={overview?.monthlyStats?.users}
                    />
                </Grid>
            </Grid>

            {/* Row 2: Restaurants & Distribution (3 cols) */}
            <Grid container spacing={3} sx={{ mb: 4 }}>
                <Grid item xs={12} md={4} lg={4}>
                    <KPICard
                        title="Active Restaurants"
                        value={overview?.totalRestaurants?.toLocaleString()}
                        color="#F59E0B"
                        data={overview?.monthlyStats?.restaurants}
                    />
                </Grid>
                <Grid item xs={12} md={4} lg={4}>
                    <PaymentPieChart data={paymentSplit} />
                </Grid>
                <Grid item xs={12} md={4} lg={4}>
                    <StatusDonutChart data={orderStatus} />
                </Grid>

            </Grid>

            {/* Row 3: Trends & Leaderboard */}
            <Grid container spacing={3} sx={{ mb: 4 }}>
                <Grid item xs={12} lg={8}>
                    <RevenueAreaChart data={ordersTrend} />
                </Grid>
                <Grid item xs={12} lg={4}>
                    <TopRestaurantsChart data={topRestaurants} />
                </Grid>
            </Grid>

            {/* Heatmap Row */}
            <Grid container spacing={3}>
                <Grid item xs={12}>
                    <ActivityHeatmap data={peakHours} />
                </Grid>
            </Grid>
        </Box>
    );
};

export default Analysis;
