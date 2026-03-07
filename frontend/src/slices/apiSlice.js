import { fetchBaseQuery, createApi } from '@reduxjs/toolkit/query/react';

const baseQuery = fetchBaseQuery({
    baseUrl: '/',
    credentials: 'include',
});

export const apiSlice = createApi({
    baseQuery,
    tagTypes: ['User', 'Vehicle', 'Rental', 'Sale', 'Booking'],
    endpoints: (builder) => ({}),
});
