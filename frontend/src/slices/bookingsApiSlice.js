import { apiSlice } from './apiSlice';
import { BOOKINGS_URL } from '../constants';

export const bookingsApiSlice = apiSlice.injectEndpoints({
    endpoints: (builder) => ({
        createBooking: builder.mutation({
            query: (bookingData) => ({
                url: BOOKINGS_URL,
                method: 'POST',
                body: bookingData,
            }),
            invalidatesTags: ['Booking'],
        }),
        getMyBookings: builder.query({
            query: () => ({
                url: `${BOOKINGS_URL}/my-bookings`,
            }),
            providesTags: ['Booking'],
            keepUnusedDataFor: 5,
        }),
        updateBookingStatus: builder.mutation({
            query: (data) => ({
                url: `${BOOKINGS_URL}/${data.bookingId}/status`,
                method: 'PUT',
                body: { status: data.status },
            }),
            invalidatesTags: ['Booking'],
        }),
    }),
});

export const {
    useCreateBookingMutation,
    useGetMyBookingsQuery,
    useUpdateBookingStatusMutation,
} = bookingsApiSlice;
