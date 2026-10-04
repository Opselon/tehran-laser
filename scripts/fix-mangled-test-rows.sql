-- Repair test rows whose Persian text was mangled by shell encoding during curl tests.
UPDATE customers
SET name = 'مریم احمدی',
    updated_at = datetime('now')
WHERE id = '1f420d38-42a0-4fd5-bef1-df02fb0b9905'
  AND name LIKE '%?%';

UPDATE accounting_transactions
SET description = 'دریافت هزینه پکیج لیزر کل بدن بانوان + شارژ جلسه'
WHERE reference = 'TX-U7425'
  AND description LIKE '%?%';
