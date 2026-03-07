import { apiSlice } from './apiSlice';

const VEHICLES_URL = '/api/vehicles';

export const vehiclesApiSlice = apiSlice.injectEndpoints({
    endpoints: (builder) => ({
        getRentalListings: builder.query({
            query: (params) => ({
                url: `${VEHICLES_URL}/rent`,
                params
            }),
            providesTags: ['Rental', 'Vehicle']
        }),
        getSaleListings: builder.query({
            query: (params) => ({
                url: `${VEHICLES_URL}/buy`,
                params
            }),
            providesTags: ['Sale', 'Vehicle']
        }),
        getRentalDetails: builder.query({
            query: (id) => ({
                url: `${VEHICLES_URL}/rent/${id}`
            }),
            providesTags: ['Rental', 'Vehicle']
        }),
        getSaleDetails: builder.query({
            query: (id) => ({
                url: `${VEHICLES_URL}/buy/${id}`
            }),
            providesTags: ['Sale', 'Vehicle']
        }),
    }),
});

export const {
    useGetRentalListingsQuery,
    useGetSaleListingsQuery,
    useGetRentalDetailsQuery,
    useGetSaleDetailsQuery
} = vehiclesApiSlice;
