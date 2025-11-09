import { PrismaClient } from '@prisma/client';
import * as dotenv from 'dotenv';
import * as path from 'path';
import * as fs from 'fs';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const rawDataPath = path.join(__dirname, '..', '..', '..', 'data', 'Analytics_Test_Data.json'); 
const rawData = JSON.parse(fs.readFileSync(rawDataPath, 'utf-8'));


const prisma = new PrismaClient();

const getNestedValue = (obj: any, path: string, defaultValue: any = null): any => {
  if (!obj) return defaultValue;
  
  const value = path.split('.').reduce((acc: any, part: string) => {
    return acc && acc.value && acc.value[part] ? acc.value[part] : null;
  }, obj);
  
  return value && value.value !== undefined ? value.value : defaultValue;
};

const parseDate = (dateField: any, defaultValue: Date | null = null): Date | null => {
    if (dateField && dateField.$date) {
        return new Date(dateField.$date);
    }
    if (typeof dateField === 'string' && dateField) {
        const date = new Date(dateField);
        if (!isNaN(date.getTime())) {
            return date;
        }
    }
    return defaultValue;
}

const parseFloatSafe = (value: any): number => {
    const rawValue = value && value.$numberDouble !== undefined ? value.$numberDouble : value;
    
    if (rawValue === null || rawValue === undefined || rawValue === "") return 0;
    
    const parsed = parseFloat(String(rawValue)); 
    return isNaN(parsed) ? 0 : parsed;
};


async function main() {
  console.log(`Starting seeding...`);

  const validInvoices = rawData.filter((d: any) => d.extractedData?.llmData?.invoice);

  for (const doc of validInvoices) {
    const llmData = doc.extractedData.llmData;

    const vendorName = getNestedValue(llmData.vendor, 'vendorName', 'Unknown Vendor');
    
    let vendor = await prisma.vendor.upsert({
      where: { name: vendorName },
      update: {}, 
      create: {
        name: vendorName,
        address: getNestedValue(llmData.vendor, 'vendorAddress'),
        taxId: getNestedValue(llmData.vendor, 'vendorTaxId'),
      },
    });

    let customerId: string | null = null;
    const customerName = getNestedValue(llmData.customer, 'customerName');
    
    if (customerName) {
        const uniqueCustomerName = `${customerName.substring(0, 50)}-${doc._id.substring(0, 8)}`; 
        
        let customer = await prisma.customer.upsert({
            where: { name: uniqueCustomerName },
            update: { name: uniqueCustomerName }, 
            create: {
                name: uniqueCustomerName,
                address: getNestedValue(llmData.customer, 'customerAddress'),
            },
        });
        customerId = customer.id;
    }

    const documentRecord = await prisma.document.create({
        data: {
            id: doc._id,
            fileName: doc.name || 'N/A',
            filePath: doc.filePath,
            fileSize: BigInt(doc.fileSize?.$numberLong || 0),
            fileType: doc.fileType || 'N/A',
            status: doc.status || 'processed',
            createdAt: parseDate(doc.createdAt) || new Date(),
            updatedAt: parseDate(doc.updatedAt) || new Date(),
        }
    });

    const invoiceTotal = parseFloatSafe(getNestedValue(llmData.summary, 'invoiceTotal'));

    const invoiceRecord = await prisma.invoice.create({
      data: {
        documentId: documentRecord.id,
        vendorId: vendor.id,
        customerId: customerId,

        invoiceId: getNestedValue(llmData.invoice, 'invoiceId') || 'N/A',
        invoiceDate: parseDate(getNestedValue(llmData.invoice, 'invoiceDate')) || new Date(),
        deliveryDate: parseDate(getNestedValue(llmData.invoice, 'deliveryDate')),
        dueDate: parseDate(getNestedValue(llmData.payment, 'dueDate')),
        documentType: getNestedValue(llmData.summary, 'documentType') || 'invoice',
        
        currencySymbol: getNestedValue(llmData.summary, 'currencySymbol') || '€',
        subTotal: parseFloatSafe(getNestedValue(llmData.summary, 'subTotal')),
        totalTax: parseFloatSafe(getNestedValue(llmData.summary, 'totalTax')),
        invoiceTotal: invoiceTotal,

        lineItems: {
          create: (getNestedValue(llmData.lineItems, 'items') || []).map((item: any) => ({
            description: getNestedValue(item, 'description') || 'N/A',
            quantity: parseFloatSafe(getNestedValue(item, 'quantity')),
            unitPrice: parseFloatSafe(getNestedValue(item, 'unitPrice')),
            totalPrice: parseFloatSafe(getNestedValue(item, 'totalPrice')),
            sachkonto: getNestedValue(item, 'Sachkonto'),
            buSchluessel: getNestedValue(item, 'BUSchluessel'),
          })),
        },
      },
    });
    console.log(`Seeded invoice: ${invoiceRecord.invoiceId} from Document ID: ${documentRecord.id}`);
  }

  console.log(`\n Seeding finished. Total Invoices Processed: ${validInvoices.length}`);
}

main()
  .catch(e => {
    console.error("Seeding failed:");
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });