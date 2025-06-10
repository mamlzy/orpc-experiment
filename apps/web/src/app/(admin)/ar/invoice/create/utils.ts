export const countSubtotal = ({
  grandTotal,
  percentage,
}: {
  grandTotal: number;
  percentage: number;
}) => {
  return grandTotal * (percentage / 100);
};

export const countDPP = ({ subtotal }: { subtotal: number }) => {
  return (11 / 12) * subtotal;
};

export const countPPN = ({ dpp }: { dpp: number }) => {
  return (12 / 100) * dpp;
};

export const countGrandTotal = ({
  subtotal,
  materai,
  ppn,
}: {
  subtotal: number;
  materai: number;
  ppn: number;
}) => {
  return subtotal + materai + ppn;
};
