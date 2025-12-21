
import mongoose from 'mongoose';
import dotenv from 'dotenv';

// Mocking the Context Generation Logic from aiController.js
// Since we can't export it easily without refactoring, we'll duplicate it here for verification
// This ensures that the LOGIC itself is correct given a mock restaurant object.

const verifyDietaryContext = () => {
    console.log('--- Verifying Dietary Context Logic ---');

    // 1. Mock Restaurant Data
    const mockRestaurants = [
        {
            _id: 'rest_1',
            name: 'Pure Veg Delight',
            menu: [
                {
                    category: 'Starters',
                    items: [
                        { name: 'Veg Soup', isVeg: true, price: 100 },
                        { name: 'Paneer Tikka', isVeg: true, price: 200 }
                    ]
                }
            ]
        },
        {
            _id: 'rest_2',
            name: 'Mixed Grill House',
            menu: [
                {
                    category: 'Main',
                    items: [
                        { name: 'Chicken Curry', isVeg: false, price: 300 },
                        { name: 'Dal Fry', isVeg: true, price: 150 }
                    ]
                }
            ]
        },
        {
            _id: 'rest_3',
            name: 'Carnivore Club',
            menu: [
                {
                    category: 'Main',
                    items: [
                        { name: 'Steak', isVeg: false, price: 500 },
                    ]
                }
            ]
        }
    ];

    // 2. Run the Logic (copied from aiController.js update)
    const contextList = mockRestaurants.map(r => {
        let vegCount = 0;
        let totalItems = 0;
        let userHighlights = [];
        let minPrice = Infinity;
        let maxPrice = 0;

        if (r.menu && r.menu.length > 0) {
            r.menu.forEach(cat => {
                if (cat.items) {
                    cat.items.forEach(item => {
                        totalItems++;
                        if (item.isVeg) vegCount++;

                        // Track Prices (for completeness of mock)
                        if (item.price) {
                            if (item.price < minPrice) minPrice = item.price;
                            if (item.price > maxPrice) maxPrice = item.price;
                        }
                    });
                }
            });
        }

        // Dietary Info Logic
        const isPureVeg = totalItems > 0 && vegCount === totalItems;
        const dietaryLabel = isPureVeg ? "Pure Veg" : (vegCount > 0 ? "Mixed / Veg Options" : "Non-Veg Only");

        return `Name: ${r.name} | Dietary: ${dietaryLabel}`;
    });

    console.log('Generated Contexts:');
    contextList.forEach(c => console.log(c));

    // 3. Assertions
    const r1 = contextList.find(c => c.includes('Pure Veg Delight'));
    if (!r1.includes('Dietary: Pure Veg')) console.error('FAIL: Pure Veg Delight should be Pure Veg');
    else console.log('PASS: Pure Veg detection');

    const r2 = contextList.find(c => c.includes('Mixed Grill House'));
    if (!r2.includes('Dietary: Mixed / Veg Options')) console.error('FAIL: Mixed Grill House should be Mixed');
    else console.log('PASS: Mixed detection');

    const r3 = contextList.find(c => c.includes('Carnivore Club'));
    if (!r3.includes('Dietary: Non-Veg Only')) console.error('FAIL: Carnivore Club should be Non-Veg Only');
    else console.log('PASS: Non-Veg detection');
};

verifyDietaryContext();
