import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { CreateBatchButton } from '@/components/CreateBatchsButtons'
import { SyncPaymentsButton } from '@/components/SyncPaymentsButton'
import { getDb } from '@/lib/db/db'
import { Pagination } from '@/components/Pagination'
import { ELink } from '@/components/ELink'
import { CalendarIcon } from 'lucide-react'
import { ShowAllOrdersToggle } from '@/components/ShowAllOrdersToggle'

const ORDERS_PER_PAGE = 10

export default async function AdminOrdersPage(props) {
  const db = await getDb()
  const ordersCollection = db.collection('orders')
  const searchParams = await props.searchParams
  const pageParam = searchParams.page
  const currentPage = Math.max(parseInt(pageParam || '1', 10), 1)
  const showAll = searchParams?.showall === 'true'

  const totalOrders = await ordersCollection.countDocuments()
  const totalPages = Math.ceil(totalOrders / ORDERS_PER_PAGE)

  const filter = showAll ? {} : { paymentStatus: 'paid' }

  const totalCount = await ordersCollection.countDocuments(filter)
  const ordersData = await ordersCollection
    .find(filter)
    .sort({ createdAt: -1 })
    .skip((currentPage - 1) * ORDERS_PER_PAGE)
    .limit(ORDERS_PER_PAGE)
    .toArray()

  const orders = ordersData.map((order) => ({
    ...order,
    _id: order._id.toString(),
    createdAt: order.createdAt instanceof Date ? order.createdAt : new Date(order.createdAt),
  }))

  const latestPaidOrder = orders.find((order) => order.paymentStatus === 'paid')
  const yesterdayData = new Date(Date.now() - 1000 * 60 * 60 * 24)
  const latestPaidOrderDate = latestPaidOrder ? latestPaidOrder.createdAt : yesterdayData

  const formatDate = (date) =>
    new Intl.DateTimeFormat('en-US', {
      month: 'short',
      day: 'numeric',
      hour: 'numeric',
      minute: 'numeric',
      hour12: true,
    }).format(date)

  const getStatusVariant = (status) => {
    switch (status) {
      case 'queued':
        return 'secondary'
      case 'processing':
        return 'warning'
      case 'completed':
        return 'success'
      case 'cancelled':
        return 'destructive'
      default:
        return 'outline'
    }
  }

  return (
    <main className="container py-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Orders</h1>
          <p className="text-sm text-muted-foreground">
            {totalCount} {showAll ? 'total' : 'paid'} orders
          </p>
        </div>
        <div className="flex gap-2">
          <ShowAllOrdersToggle />
          <SyncPaymentsButton fromDate={latestPaidOrderDate} />
        </div>
      </div>

      <div className="space-y-4">
        {orders.map((order) => {
          const totalQty = order.items.reduce((sum, item) => sum + item.quantity, 0)
          const batchedQty = order.items.reduce((sum, item) => sum + (item.batchedQuantity || 0), 0)
          const fullyBatched = batchedQty === totalQty
          return (
            <Card key={order._id} className="overflow-hidden transition-all hover:shadow-md">
              <CardHeader className="p-4 pb-0">
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle className="text-lg">{order.customerName}</CardTitle>
                    <div className="flex flex-col text-sm text-muted-foreground mt-1 space-y-0.5">
                      <div className="flex items-center gap-2">
                        <span>Order ID: {order.platformOrderId || order._id}</span>
                        <span>•</span>
                        <span className="flex items-center">
                          <CalendarIcon className="mr-1 h-3 w-3" />
                          {formatDate(order.createdAt)}
                        </span>
                      </div>
                      <div>{order.customerEmail}</div>
                      {order.address && (
                        <div>
                          {order.address.postal_code} {order.address.city}, {order.address.country}
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="flex flex-col items-end gap-1">
                    <Badge variant={getStatusVariant(order.status)} className="capitalize">
                      {order.status}
                    </Badge>
                    <p className="text-xs text-muted-foreground">{order.paymentStatus}</p>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="p-4">
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
                  {order.items?.map((item, i) => (
                    <div key={i} className="group relative">
                      <div className="overflow-hidden rounded-md border bg-background">
                        <img
                          src={item.imageUrl}
                          alt={item.designId}
                          className="h-auto w-full object-cover aspect-[6/5] group-hover:scale-105 transition-transform duration-300"
                        />
                      </div>
                      <div className="flex items-center justify-between mt-2">
                        <p className="text-xs font-medium truncate">{item.designId}</p>
                        <Badge variant="outline" className="text-xs">
                          Qty: {item.quantity}
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
              <CardFooter className="p-4 pt-0 flex justify-between">
                <p className="text-sm text-muted-foreground">
                  {fullyBatched ? (
                    <span className="text-green-600 font-medium">✅ Fully batched</span>
                  ) : (
                    <span>
                      {batchedQty} of {totalQty} items batched
                    </span>
                  )}
                </p>
                <ELink href={`/admin/orders/${order._id}`} prefetch={false}>
                  <Button variant="outline" size="sm">
                    View Details
                  </Button>
                </ELink>
              </CardFooter>
            </Card>
          )
        })}
      </div>

      {/* Pagination controls */}
      {totalPages > 1 && <Pagination totalPages={totalPages} currentPage={currentPage} />}
    </main>
  )
}
