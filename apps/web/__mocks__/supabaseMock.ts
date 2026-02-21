export const createMockSupabaseClient = () => {
    const mockFrom = jest.fn();
    const mockInsert = jest.fn();
    const mockSelect = jest.fn();
    const mockEq = jest.fn();
    const mockOrder = jest.fn();

    // Chainable methods
    const mockClient = {
        from: mockFrom.mockReturnValue({
            select: mockSelect.mockReturnValue({
                eq: mockEq.mockReturnValue({
                    order: mockOrder.mockResolvedValue({ data: [], error: null }),
                }),
                order: mockOrder.mockResolvedValue({ data: [], error: null }),
            }),
            insert: mockInsert.mockReturnValue({
                select: mockSelect.mockResolvedValue({ data: [], error: null }),
            }),
        }),
    };

    return { mockClient, mockFrom, mockInsert, mockSelect, mockEq, mockOrder };
};
