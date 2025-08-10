import snakecaseKeys from "snakecase-keys";
import { prisma } from "../db/connection";
import { EventOrganizer, Prisma } from "../generated/prisma";

interface MonthlySalesResult {
  month: string;
  total_tickets: number;
}

interface AnnualRevenueResult {
  year: string;
  total_revenue: number;
}

export const getDashboardService = async ({
  id: organizerId,
  userId,
}: Pick<EventOrganizer, "id" | "userId">) => {
  const eventIds = await prisma.event
    .findMany({
      where: { eventOrganizerId: organizerId, deletedAt: null },
      select: { id: true },
    })
    .then((events) => events.map((e) => e.id));

  if (eventIds.length === 0) {
    const response = {
      totalEvents: 0,
      totalTicketsSold: 0,
      totalRevenue: 0,
      events: [],
      monthlyTicketSales: {},
      annualRevenue: {},
    };
    return snakecaseKeys(response, { deep: true });
  }

  const aggregateData = await prisma.purchaseOrders.aggregate({
    where: { eventId: { in: eventIds }, orderStatus: "DONE" },
    _sum: { quantity: true, finalPrice: true },
  });

  const totalTicketsSold = aggregateData._sum.quantity ?? 0;
  const totalRevenue = aggregateData._sum.finalPrice ?? 0;

  const events = await prisma.event.findMany({
    where: { id: { in: eventIds }, deletedAt: null },
    select: { id: true, eventName: true, startDate: true },
  });

  const eventsWithTickets = await Promise.all(
    events.map(async (event) => {
      const tickets = await prisma.purchaseOrders.aggregate({
        where: { eventId: event.id, orderStatus: "DONE" },
        _sum: { quantity: true },
      });
      return {
        ...event,
        totalTicketsSold: tickets._sum.quantity ?? 0,
      };
    })
  );

  const monthlyTicketSalesRaw = await prisma.$queryRaw<MonthlySalesResult[]>`
  SELECT
    TO_CHAR(created_at, 'YYYY-MM') as month,
    SUM(quantity) as total_tickets
  FROM purchase_orders
  WHERE event_id IN (${Prisma.join(eventIds)}) AND order_status = 'PAID'
  GROUP BY month
  ORDER BY month;
  `;

  const monthlyTicketSales = monthlyTicketSalesRaw.reduce<
    Record<string, number>
  >((acc, curr) => {
    acc[curr.month] = curr.total_tickets;
    return acc;
  }, {});

  const annualRevenueRaw = await prisma.$queryRaw<AnnualRevenueResult[]>`
  SELECT
    TO_CHAR(created_at, 'YYYY') as year,
    SUM(final_price) as total_revenue
  FROM purchase_orders
  WHERE event_id IN (${Prisma.join(eventIds)}) AND order_status = 'PAID'
  GROUP BY year
  ORDER BY year;
  `;

  const annualRevenue = annualRevenueRaw.reduce<Record<string, number>>(
    (acc, curr) => {
      acc[curr.year] = curr.total_revenue;
      return acc;
    },
    {}
  );

  const response = {
    totalEvents: eventIds.length,
    totalTicketsSold,
    totalRevenue,
    events: eventsWithTickets,
    monthlyTicketSales,
    annualRevenue,
  };

  return snakecaseKeys(response, { deep: true });
};
