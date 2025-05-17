import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { CalendarIcon, SearchIcon } from 'lucide-react'
import { CreateBatchButton } from '@/components/CreateBatchsButtons'
import { SyncOrdersButton } from '@/components/SyncOrdersButton'
import { SyncPaymentsButton } from '@/components/SyncPaymentsButton'
import { getDb } from '@/lib/db/db'
import { ObjectId } from 'mongodb'

// ... import statements (samma som innan)

export default async function AdminOrdersPage() {
  const db = await getDb()
  const ordersCollection = db.collection('orders')
  const ordersData = await ordersCollection.find({}).sort({ createdAt: -1 }).toArray()

  const orders = ordersData.map((order) => ({
    ...order,
    _id: order._id.toString(),
    createdAt: order.createdAt instanceof Date ? order.createdAt : new Date(order.createdAt),
  }))

  const latestPaidOrder = orders.find((order) => order.paymentStatus === 'paid')
  const yesterdayData = new Date(new Date().getTime() - 1000 * 60 * 60 * 24)
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
        <h1 className="text-3xl font-bold tracking-tight">Orders</h1>

        <div className="flex gap-2">
          <CreateBatchButton />
          <SyncOrdersButton />
          <SyncPaymentsButton fromDate={latestPaidOrderDate} />
        </div>
      </div>

      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-4">
        <div className="relative w-full sm:w-[250px]">
          <SearchIcon className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input type="search" placeholder="Search orders..." className="pl-8" />
        </div>
        <Select defaultValue="newest">
          <SelectTrigger className="w-[130px]">
            <SelectValue placeholder="Sort by" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="newest">Newest first</SelectItem>
            <SelectItem value="oldest">Oldest first</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-4">
        {orders.map((order) => (
          <Card key={order._id} className="overflow-hidden transition-all hover:shadow-md">
            <CardHeader className="p-4 pb-0">
              <div className="flex justify-between items-start">
                <div>
                  <CardTitle className="text-lg">{order.customerName}</CardTitle>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground mt-1">
                    <span>Order ID: {order.platformOrderId}</span>
                    <span>•</span>
                    <span className="flex items-center">
                      <CalendarIcon className="mr-1 h-3 w-3" />
                      {formatDate(order.createdAt)}
                    </span>
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
            <CardFooter className="p-4 pt-0 flex justify-end">
              <Button variant="outline" size="sm">
                View Details
              </Button>
            </CardFooter>
          </Card>
        ))}
      </div>
    </main>
  )
}
