import { useGetAllOrders } from '@/hooks/useQueries';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2, AlertCircle, ShoppingBag, User, Phone, Calendar } from 'lucide-react';
import { setLastSeenOrders } from '@/utils/adminLastSeenOrders';
import { useEffect } from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';

export default function AdminOrdersPage() {
  const { data: orders, isLoading, isError, error } = useGetAllOrders();

  // Mark orders as seen when the page loads successfully
  useEffect(() => {
    if (orders && orders.length > 0) {
      const latestOrder = orders.reduce((latest, order) => 
        order.timestamp > latest.timestamp ? order : latest
      );
      setLastSeenOrders(Number(latestOrder.timestamp) / 1000000, latestOrder.id.toString());
    }
  }, [orders]);

  if (isLoading) {
    return (
      <div className="flex justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (isError) {
    return (
      <Alert variant="destructive">
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>
          Failed to load orders: {error?.message || 'Unknown error'}
        </AlertDescription>
      </Alert>
    );
  }

  const sortedOrders = orders ? [...orders].sort((a, b) => 
    Number(b.timestamp - a.timestamp)
  ) : [];

  const handleViewDetails = (orderId: string) => {
    window.location.href = `/admin/orders/${orderId}`;
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Orders</h1>
          <p className="text-muted-foreground mt-1">
            Manage and view all customer orders
          </p>
        </div>
        <div className="text-sm text-muted-foreground">
          Total Orders: <span className="font-bold text-foreground">{sortedOrders.length}</span>
        </div>
      </div>

      {sortedOrders.length === 0 ? (
        <Card>
          <CardHeader>
            <ShoppingBag className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
            <CardTitle className="text-center">No Orders Yet</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-center text-muted-foreground">
              Orders will appear here once customers start placing them.
            </p>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Order ID</TableHead>
                  <TableHead>Date & Time</TableHead>
                  <TableHead>Customer</TableHead>
                  <TableHead>Phone</TableHead>
                  <TableHead className="text-right">Total</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {sortedOrders.map((order) => (
                  <TableRow key={order.id.toString()}>
                    <TableCell className="font-medium">
                      #{order.id.toString()}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2 text-sm">
                        <Calendar className="h-4 w-4 text-muted-foreground" />
                        {new Date(Number(order.timestamp) / 1000000).toLocaleString()}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <User className="h-4 w-4 text-muted-foreground" />
                        {order.customerName}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2 text-sm">
                        <Phone className="h-4 w-4 text-muted-foreground" />
                        {order.phoneNumber}
                      </div>
                    </TableCell>
                    <TableCell className="text-right font-medium">
                      ₹{Number(order.totalAmount)}
                    </TableCell>
                    <TableCell className="text-right">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleViewDetails(order.id.toString())}
                      >
                        View Details
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
