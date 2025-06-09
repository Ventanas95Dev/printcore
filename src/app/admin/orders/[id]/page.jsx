import { getDb } from '@/lib/db/db'
import { ObjectId } from 'mongodb'
import { notFound } from 'next/navigation'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { ELink } from '@/components/ELink'

export default async function OrderDetailPage(props) {
  const db = await getDb()
  const params = await props.params
  const orders = db.collection('orders')

  const order = await orders.findOne({ _id: new ObjectId(params.id) })
  if (!order) return notFound()

  const formatDate = (date) =>
    new Intl.DateTimeFormat('sv-SE', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }).format(new Date(date))

  return (
    <main className="container py-6 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Order details</h1>
        <ELink href="/admin/orders">
          <Button variant="outline">← Go back</Button>
        </ELink>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Order information</CardTitle>
        </CardHeader>
        <CardContent className="grid sm:grid-cols-2 gap-4 text-sm">
          <div>
            <p><strong>Order-ID:</strong> {order._id.toString()}</p>
            <p><strong>Created:</strong> {formatDate(order.createdAt)}</p>
            <p><strong>Uppdaterad:</strong> {formatDate(order.updatedAt)}</p>
            <p><strong>PaymentStatus:</strong> <Badge variant="outline">{order.paymentStatus}</Badge></p>
            {order.paidAt && <p><strong>Paid:</strong> {formatDate(order.paidAt)}</p>}
          </div>
          <div>
            <p><strong>Customer::</strong> {order.customerName}</p>
            <p><strong>Email:</strong> {order.customerEmail}</p>
            {order.address && (
              <>
                <p><strong>Address:</strong></p>
                <p>{order.address.line1}</p>
                {order.address.line2 && <p>{order.address.line2}</p>}
                <p>{order.address.postal_code} {order.address.city}</p>
                <p>{order.address.country}</p>
              </>
            )}
            {order.stripeReceiptUrl && (
              <p>
                <a href={order.stripeReceiptUrl} target="_blank" className="text-blue-600 underline">
                  Show receipt
                </a>
              </p>
            )}
            <p>
              <a
                href={`https://dashboard.stripe.com/payments/${order.stripePaymentIntentId}`}
                target="_blank"
                className="text-blue-600 underline"
              >
                Stripe Payment
              </a>
            </p>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Products</CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {order.items?.map((item, i) => (
            <div key={item.id} className="space-y-2 text-sm border rounded-lg p-2">
              <img
                src={item.previewUrl || item.imageUrl}
                alt={`Design ${item.designId}`}
                className="w-full aspect-[6/5] object-cover rounded"
              />
              <p><strong>ID:</strong> {item.id}</p>
              <p><strong>Antal:</strong> {item.quantity}</p>
              {item.editorPreviewUrl && (
                <a
                  href={item.editorPreviewUrl}
                  target="_blank"
                  className="text-blue-600 underline"
                >
                  Editor Preview →
                </a>
              )}
              {item.imageUrl && (
                <a
                  href={item.imageUrl}
                  target="_blank"
                  className="text-blue-600 underline block"
                >
                  Print file →
                </a>
              )}
              {item.previewUrl && (
                <a
                  href={item.previewUrl}
                  target="_blank"
                  className="text-blue-600 underline block"
                >
                  Preview file →
                </a>
              )}
            </div>
          ))}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Batch history</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 text-sm">
          {order.batches?.length > 0 ? (
            order.batches.map((batchId) => (
              <ELink
                key={batchId}
                href={`/admin/batches/${batchId}`}
                className="text-blue-600 underline block"
              >
                View batch {batchId?.toString()}
              </ELink>
            ))
          ) : (
            <p>No batches yet for this order.</p>
          )}
        </CardContent>
      </Card>

    </main>
  )
}
