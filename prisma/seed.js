const { PrismaClient } = require('../src/generated/prisma');
const prisma = new PrismaClient();
const bcrypt = require('bcrypt');

const venue = [
  {
    venueName : 'Gelora Bung Karno',
    venueCapacity : 50000,
    address: 'Jl. Pintu Satu Senayan, Gelora, Kecamatan Tanah Abang, Kota Jakarta Pusat, Daerah Khusus Ibukota Jakarta 10270.'
},

];

const event = [
  {
    eventName: 'Black Pink DEADLINE',
    category : 'MUSIC',
    startDate: new Date("2025-11-01T18:00:00Z"), 
    endDate: new Date("2025-11-02T22:00:00Z"),
    imageUrl: 'https://res.cloudinary.com/drcqshbbu/image/upload/v1754069199/event/vk5zarzvkzmc4r6yy2qm.png',
    eventOrganizerId: '7f448bbf-b1fd-4773-a4f2-2e160e4cd7f2',
    venueId : '53a58556-7113-4fb7-9008-b333c0820275',
    description: 'Jakarta, get ready! Global icon girl group, BLACKPINK, has announced their Asia tour, BLACKPINK WORLD TOUR <DEADLINE>,The concert will take place on November 1-2, 2025, at Gelora Bung Karno Main Stadium, Jakarta!',
    availableTicket: 100000,
    price: 2500000
  }


];

const coupon = [
  {
        discountValue: 10,
        provider_type: 'APP',
        providerId: null,
        description: 'Diskon 10% untuk semua event',
        availableCoupon: 100,
  }
]

async function main() {

  await prisma.coupon.createMany({
    data: coupon,
  });
}

main()
  .catch((error) => {
    console.log(error);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });