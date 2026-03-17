import { apiSlice } from './apiSlice';

const ADMIN_VEHICLES_URL = '/api/vehicles/admin';

export const adminVehiclesApiSlice = apiSlice.injectEndpoints({
    endpoints: (builder) => ({
        // Get all vehicles (rental + sale)
        getAllVehiclesAdmin: builder.query({
            query: () => ({ url: `${ADMIN_VEHICLES_URL}/all` }),
            providesTags: ['Vehicle', 'Rental', 'Sale'],
        }),
        // Add a rental listing
        addRentalListing: builder.mutation({
            query: (data) => ({
                url: `${ADMIN_VEHICLES_URL}/rent`,
                method: 'POST',
                body: data,
            }),
            invalidatesTags: ['Vehicle', 'Rental'],
        }),
        // Add a sale listing
        addSaleListing: builder.mutation({
            query: (data) => ({
                url: `${ADMIN_VEHICLES_URL}/sale`,
                method: 'POST',
                body: data,
            }),
            invalidatesTags: ['Vehicle', 'Sale'],
        }),
        // Delete a rental listing
        deleteRentalListing: builder.mutation({
            query: (id) => ({
                url: `${ADMIN_VEHICLES_URL}/rent/${id}`,
                method: 'DELETE',
            }),
            invalidatesTags: ['Vehicle', 'Rental'],
        }),
        // Delete a sale listing
        deleteSaleListing: builder.mutation({
            query: (id) => ({
                url: `${ADMIN_VEHICLES_URL}/sale/${id}`,
                method: 'DELETE',
            }),
            invalidatesTags: ['Vehicle', 'Sale'],
        }),
        // Update a rental listing
        updateRentalListing: builder.mutation({
            query: ({ id, data }) => ({
                url: `${ADMIN_VEHICLES_URL}/rent/${id}`,
                method: 'PUT',
                body: data,
            }),
            invalidatesTags: ['Vehicle', 'Rental'],
        }),
        // Update a sale listing
        updateSaleListing: builder.mutation({
            query: ({ id, data }) => ({
                url: `${ADMIN_VEHICLES_URL}/sale/${id}`,
                method: 'PUT',
                body: data,
            }),
            invalidatesTags: ['Vehicle', 'Sale'],
        }),
    }),
});

export const {
    useGetAllVehiclesAdminQuery,
    useAddRentalListingMutation,
    useAddSaleListingMutation,
    useDeleteRentalListingMutation,
    useDeleteSaleListingMutation,
    useUpdateRentalListingMutation,
    useUpdateSaleListingMutation,
} = adminVehiclesApiSlice;
