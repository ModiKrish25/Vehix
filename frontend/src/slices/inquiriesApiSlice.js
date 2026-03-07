import { apiSlice } from './apiSlice';
import { INQUIRIES_URL } from '../constants';

export const inquiriesApiSlice = apiSlice.injectEndpoints({
    endpoints: (builder) => ({
        createInquiry: builder.mutation({
            query: (inquiryData) => ({
                url: INQUIRIES_URL,
                method: 'POST',
                body: inquiryData,
            }),
            invalidatesTags: ['Inquiry'],
        }),
        getMyInquiries: builder.query({
            query: () => ({
                url: `${INQUIRIES_URL}/my-inquiries`,
            }),
            providesTags: ['Inquiry'],
            keepUnusedDataFor: 5,
        }),
        updateInquiry: builder.mutation({
            query: (data) => ({
                url: `${INQUIRIES_URL}/${data.inquiryId}`,
                method: 'PUT',
                body: data.payload,
            }),
            invalidatesTags: ['Inquiry'],
        }),
    }),
});

export const {
    useCreateInquiryMutation,
    useGetMyInquiriesQuery,
    useUpdateInquiryMutation,
} = inquiriesApiSlice;
