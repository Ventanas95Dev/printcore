// lib/mock/orders.js

export const mockOrders = [
  {
    _id: 'order001',
    customerName: 'Alice',
    platformOrderId: 'shopify-001',
    status: 'queued',
    paymentStatus: 'paid',
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 2),
    items: [
      {
        designId: 'abc123',
        imageUrl: 'https://picsum.photos/seed/alice1/200/170',
        quantity: 2,
      },
      {
        designId: 'xyz789',
        imageUrl: 'https://picsum.photos/seed/alice2/200/170',
        quantity: 1,
      },
    ],
  },
  {
    _id: 'order002',
    customerName: 'Bob',
    platformOrderId: 'shopify-002',
    status: 'queued',
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 1),
    items: [
      {
        designId: 'def456',
        imageUrl: 'https://picsum.photos/seed/bob/200/170',
        quantity: 3,
      },
    ],
  },
  {
    _id: 'order003',
    customerName: 'Charlie',
    platformOrderId: 'shopify-003',
    status: 'queued',
    createdAt: new Date(Date.now() - 1000 * 60 * 30),
    items: [
      {
        designId: 'ghi789',
        imageUrl: 'https://picsum.photos/seed/charlie/200/170',
        quantity: 1,
      },
    ],
  },
  {
    _id: 'order004',
    customerName: 'Dana',
    platformOrderId: 'shopify-004',
    status: 'queued',
    createdAt: new Date(Date.now() - 1000 * 60 * 15),
    items: [
      {
        designId: 'jkl012',
        imageUrl: 'https://picsum.photos/seed/dana1/200/170',
        quantity: 1,
      },
      {
        designId: 'mno345',
        imageUrl: 'https://picsum.photos/seed/dana2/200/170',
        quantity: 2,
      },
    ],
  },
  {
    _id: 'order005',
    customerName: 'Eli',
    platformOrderId: 'shopify-005',
    status: 'queued',
    createdAt: new Date(Date.now() - 1000 * 60 * 5),
    items: [
      {
        designId: 'pqr678',
        imageUrl: 'https://picsum.photos/seed/eli/200/170',
        quantity: 1,
      },
    ],
  },
]
